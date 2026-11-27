"use server";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { decideInviteChange } from "@/lib/invite-permission";
import { inviteForm } from "@/lib/schemas";
import { createInvite } from "@/lib/invite";
import { revalidatePath } from "next/cache";
import type { DepartmentFormState } from "../departments/actions";
import { clerkClient } from "@clerk/nextjs/server";

export async function sendInvite(
  _prevState: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const user = await requireUser();
  const decision = decideInviteChange(user.role);

  if (decision.kind === "forbidden") return { message: "forbidden" };

  // Config problems fail before any write, so no INVITED row is left behind.
  if (!process.env.APP_URL) {
    console.error("APP_URL is not set");
    return { message: "Couldn't send the invite. Please try again later." };
  }

  let appUrl: string;

  try {
    appUrl = new URL("/sign-up", process.env.APP_URL).toString();
  } catch (error) {
    console.error("APP_URL is not a valid URL", error);
    return { message: "Couldn't send the invite. Please try again later." };
  }

  const parsed = inviteForm.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    role: formData.get("role"),
    departmentIds: formData.getAll("departmentIds"),
  });

  if (!parsed.success) {
    return { message: "Check the name, email, and departments." };
  }

  const result = await createInvite(prisma, user.companyId, parsed.data);

  if (result.kind === "email-taken") {
    return { message: `An account with this email was already created.` };
  }
  if (result.kind === "invalid-departments") {
    return {
      message: `One or more departments are no longer available. Refresh the page.`,
    };
  }

  let invitation;

  try {
    const client = await clerkClient();

    invitation = await client.invitations.createInvitation({
      emailAddress: result.user.email,
      redirectUrl: appUrl,
    });
  } catch (error) {
    console.error("Clerk invitation failed", error);

    await prisma.user.delete({
      where: { id: result.user.id },
    });
    return { message: "Couldn't send the invite. Please try again." };
  }

  // The invite is already sent. Accepting it matches on verified email, so a
  // failed save here is tolerable: log enough to repair the row later (look
  // the invitation up in Clerk by email, or backfill) and treat it as sent.
  try {
    await prisma.user.update({
      where: { id: result.user.id },
      data: { clerkInvitationId: invitation.id },
    });
  } catch (error) {
    console.error("Invite sent but clerkInvitationId was not saved", {
      userId: result.user.id,
      invitationId: invitation.id,
      error,
    });
  }

  revalidatePath("/team");

  return null;
}

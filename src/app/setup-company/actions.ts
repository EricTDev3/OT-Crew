"use server";
import { requireCompanySetupAccess } from "@/lib/require-company-setup-access";
import { createCompanyWithAdmin } from "@/lib/company";
import companyForm from "@/lib/schemas";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export type SetupFormState = { message: string } | null;

export async function createCompany(
  _prevState: SetupFormState,
  formData: FormData,
): Promise<SetupFormState> {
  const userId = await requireCompanySetupAccess();

  const user = await currentUser();

  if (!user) {
    return { message: "user does not exist." };
  }

  const firstName = user.firstName;

  if (!firstName) {
    return { message: "Missing first name." };
  }

  const lastName = user.lastName;

  if (!lastName) {
    return { message: "Missing last name." };
  }

  const emailAddress = user.primaryEmailAddress?.emailAddress;

  if (!emailAddress) {
    return { message: "missing or invalid email address." };
  }

  const confirmed =
    user.primaryEmailAddress?.verification?.status === "verified";

  if (!confirmed) return { message: "Confirm your email and try again." };

  const companyName = formData.get("companyName");
  const timeZone = formData.get("timeZone");
  const departments = formData.getAll("departmentNames");

  const validateData = companyForm.safeParse({
    companyName: companyName,
    timeZone: timeZone,
    departmentNames: departments,
  });

  if (!validateData.success) {
    return { message: "Invalid values entered." };
  }

  try {
    await createCompanyWithAdmin(prisma, {
      clerkUserId: userId,
      email: emailAddress,
      firstName: firstName,
      lastName: lastName,
      companyName: validateData.data.companyName,
      timeZone: validateData.data.timeZone,
      departmentNames: validateData.data.departmentNames,
    });
  } catch (error) {
    // P2002 is Prisma's code for a unique constraint violation. Here that means
    // this Clerk user or this email already has a User row.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        message:
          "An account with this email already exists. Try signing in, or contact your company admin.",
      };
    }
    // Anything else is unexpected, so let Next.js show the error page and log it.
    throw error;
  }

  // Only reached when the create succeeded. redirect() throws, so it stays outside the try.
  redirect("/dashboard");
}

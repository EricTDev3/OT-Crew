import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { findUserByClerkId } from "./user";
import { decideCompanySetupAccess } from "./access";
import { redirect } from "next/navigation";
import { acceptInvite } from "./accept-invite";

export async function requireCompanySetupAccess() {
  const { isAuthenticated, userId, redirectToSignIn } = await auth();

  if (!isAuthenticated) return redirectToSignIn();

  const user = await findUserByClerkId(prisma, userId);

  if (user === null) {
    const getCurrentUser = await currentUser();

    const email = getCurrentUser?.primaryEmailAddress?.emailAddress;
    const emailVerified =
      getCurrentUser?.primaryEmailAddress?.verification?.status === "verified";

    // No email: skip, and fall through as if there were no invite.
    if (email) {
      const result = await acceptInvite(prisma, userId, email, emailVerified);

      // "no-invite" needs no code: a founder carries on to the setup form.
      if (result.kind === "accepted") redirect("/dashboard");
      if (result.kind === "refuse") redirect("/no-access");
    }
  }

  // Runs for everyone, so a person who already has a row is turned away.
  const accessResult = decideCompanySetupAccess(user);
  if (accessResult.kind === "redirect") redirect(accessResult.to);

  return userId;
}

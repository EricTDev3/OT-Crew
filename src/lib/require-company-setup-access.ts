import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { findUserByClerkId } from "./user";
import { decideCompanySetupAccess } from "./access";
import { redirect } from "next/navigation";

export async function requireCompanySetupAccess() {
  const { isAuthenticated, userId, redirectToSignIn } = await auth();

  if (!isAuthenticated) return redirectToSignIn();

  const user = await findUserByClerkId(prisma, userId);
  const accessResult = decideCompanySetupAccess(user);

  if (accessResult.kind === "redirect") redirect(accessResult.to);

  return userId;
}

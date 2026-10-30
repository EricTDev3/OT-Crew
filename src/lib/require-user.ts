import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { findUserByClerkId } from "./user";
import { decideAccess } from "./access";
import { redirect } from "next/navigation";

export async function requireUser() {
  const { isAuthenticated, userId, redirectToSignIn } = await auth();

  if (!isAuthenticated) return redirectToSignIn();

  const user = await findUserByClerkId(prisma, userId);
  const accessResult = decideAccess(user);

  if (accessResult.kind === "redirect") redirect(accessResult.to);

  return accessResult.activeUser;
}

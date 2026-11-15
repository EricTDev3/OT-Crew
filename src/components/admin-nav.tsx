import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { findUserByClerkId } from "@/lib/user";
import { decideNavLinksAccess } from "@/lib/access";
import NavLink from "./nav-link";

export default async function AdminNav() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated) return null;

  const user = await findUserByClerkId(prisma, userId);
  const decide = decideNavLinksAccess(user);

  if (decide.departments)
    return <NavLink href="/departments">Departments</NavLink>;

  return null;
}

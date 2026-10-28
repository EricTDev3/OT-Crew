import type { PrismaClient } from "../generated/prisma/client";

export async function findUserByClerkId(db: PrismaClient, clerkUserId: string) {
  return db.user.findUnique({
    where: { clerkUserId: clerkUserId },
    select: {
      id: true,
      companyId: true,
      role: true,
      firstName: true,
      lastName: true,
      status: true,
    },
  });
}

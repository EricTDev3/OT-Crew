import type { PrismaClient, User, UserRole } from "../generated/prisma/client";
import { normalizeEmail } from "./email";

export type CreateInviteInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentIds: number[];
};

export type CreateInviteResult =
  | { kind: "invited"; user: User }
  | { kind: "email-taken" }
  | { kind: "invalid-departments" };

export async function createInvite(
  db: PrismaClient,
  companyId: number,
  input: CreateInviteInput,
): Promise<CreateInviteResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) return { kind: "email-taken" };

  const departmentIds = [...new Set(input.departmentIds)];
  if (departmentIds.length === 0) return { kind: "invalid-departments" };

  const departments = await db.department.findMany({
    where: {
      companyId,
      id: { in: departmentIds },
      deletedAt: null,
    },
  });

  if (departments.length !== departmentIds.length)
    return { kind: "invalid-departments" };

  const user = await db.user.create({
    data: {
      companyId,
      email: normalizedEmail,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      status: "INVITED",
      memberships: {
        createMany: {
          data: departmentIds.map((departmentId) => ({ departmentId })),
        },
      },
    },
  });

  return { kind: "invited", user };
}

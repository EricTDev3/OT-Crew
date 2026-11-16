import type { PrismaClient } from "../generated/prisma/client";
import { normalizeEmail } from "./email";

export type CreateCompanyWithAdminInput = {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  timeZone: string;
  departmentNames: string[];
};

export async function createCompanyWithAdmin(
  db: PrismaClient,
  input: CreateCompanyWithAdminInput,
) {
  return db.company.create({
    data: {
      name: input.companyName,
      timeZone: input.timeZone,
      users: {
        create: {
          clerkUserId: input.clerkUserId,
          email: normalizeEmail(input.email),
          firstName: input.firstName,
          lastName: input.lastName,
          role: "ADMIN",
          status: "ACTIVE",
        },
      },
      departments: {
        createMany: {
          data: input.departmentNames.map((name) => ({ name })),
        },
      },
    },
    include: { users: true, departments: true },
  });
}

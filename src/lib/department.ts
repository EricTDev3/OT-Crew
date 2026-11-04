import type { PrismaClient } from "../generated/prisma/client";

export async function listDepartments(db: PrismaClient, companyId: number) {
  const departments = await db.department.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
    where: {
      companyId,
      deletedAt: null,
    },
  });

  return departments;
}

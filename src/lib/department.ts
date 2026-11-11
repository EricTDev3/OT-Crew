import type { Department, PrismaClient } from "../generated/prisma/client";

type RenameResult =
  | { kind: "renamed"; department: Department }
  | { kind: "not-found" };

type CreateResult =
  | { kind: "created"; department: Department }
  | { kind: "duplicate-name" };

type DeleteResult = { kind: "deleted" } | { kind: "not-found" };

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

export async function renameDepartment(
  db: PrismaClient,
  companyId: number,
  departmentId: number,
  name: string,
): Promise<RenameResult> {
  const result = await db.department.updateMany({
    where: {
      companyId,
      id: departmentId,
      deletedAt: null,
    },
    data: { name },
  });

  if (result.count === 0) return { kind: "not-found" };

  const department = await db.department.findFirst({
    where: {
      companyId,
      id: departmentId,
      deletedAt: null,
    },
  });

  // Deleted between the update and this read.
  if (department === null) return { kind: "not-found" };

  return { kind: "renamed", department };
}

export async function createDepartment(
  db: PrismaClient,
  companyId: number,
  name: string,
): Promise<CreateResult> {
  const findDuplicateDept = await db.department.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      companyId,
      deletedAt: null,
    },
  });

  if (findDuplicateDept) return { kind: "duplicate-name" };

  const department = await db.department.create({
    data: {
      name,
      companyId,
    },
  });

  return { kind: "created", department };
}

export async function deleteDepartment(
  db: PrismaClient,
  companyId: number,
  departmentId: number,
  nameEntered: string,
): Promise<DeleteResult> {
  const result = await db.department.updateMany({
    where: {
      companyId,
      id: departmentId,
      name: {
        equals: nameEntered.trim(),
        mode: "insensitive",
      },
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  if (result.count === 0) return { kind: "not-found" };

  return { kind: "deleted" };
}

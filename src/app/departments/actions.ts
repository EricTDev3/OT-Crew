"use server";
import { requireUser } from "@/lib/require-user";
import { decideDepartmentChange } from "@/lib/department-permission";
import {
  createDepartment,
  renameDepartment,
  deleteDepartment,
} from "@/lib/department";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { departmentName } from "@/lib/schemas";

export type DepartmentFormState = { message: string } | null;

export async function addDepartment(
  _prevState: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const user = await requireUser();

  const decision = decideDepartmentChange(user.role);

  if (decision.kind === "forbidden") return { message: "forbidden" };

  const parsed = departmentName.safeParse(formData.get("name"));

  if (!parsed.success) {
    return { message: "Department name must be 2 to 40 characters." };
  }

  const result = await createDepartment(prisma, user.companyId, parsed.data);

  if (result.kind === "duplicate-name") {
    return { message: `A department named "${parsed.data}" already exists.` };
  }

  // Only reached when the department was created. Refresh the list on the page.
  revalidatePath("/departments");

  return null;
}

export async function editDepartmentName(
  _prevState: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const user = await requireUser();
  const decision = decideDepartmentChange(user.role);

  if (decision.kind === "forbidden") return { message: "forbidden" };

  const getId = formData.get("departmentId");
  if (typeof getId !== "string") return { message: "Invalid id" };

  const parsedId = Number(getId);
  if (!Number.isInteger(parsedId) || parsedId < 1)
    return { message: "Invalid id" };

  const parsed = departmentName.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { message: "Department name must be 2 to 40 characters." };
  }

  const result = await renameDepartment(
    prisma,
    user.companyId,
    parsedId,
    parsed.data,
  );

  if (result.kind === "duplicate-name") {
    return { message: `A department named "${parsed.data}" already exists.` };
  }

  if (result.kind === "not-found") {
    return {
      message: "That department no longer exists. Refresh the page.",
    };
  }

  // Only reached when the department was renamed. Refresh the list on the page.
  revalidatePath("/departments");

  return null;
}

export async function removeDepartment(
  _prevState: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const user = await requireUser();

  const decision = decideDepartmentChange(user.role);

  if (decision.kind === "forbidden") return { message: "forbidden" };

  const getId = formData.get("departmentId");
  if (typeof getId !== "string") return { message: "Invalid id" };

  const parsedId = Number(getId);
  if (!Number.isInteger(parsedId) || parsedId < 1)
    return { message: "Invalid id" };

  const result = await deleteDepartment(prisma, user.companyId, parsedId);

  if (result.kind === "not-found") {
    return {
      message: "That department no longer exists. Refresh the page.",
    };
  }

  revalidatePath("/departments");

  return null;
}

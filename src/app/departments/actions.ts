"use server";
import { requireUser } from "@/lib/require-user";
import { decideDepartmentChange } from "@/lib/department-permission";
import { createDepartment } from "@/lib/department";
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

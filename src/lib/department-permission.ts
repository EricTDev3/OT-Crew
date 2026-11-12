import type { UserRole } from "../generated/prisma/client";

type DepartmentChangeDecision = { kind: "allowed" } | { kind: "forbidden" };

export function decideDepartmentChange(
  role: UserRole,
): DepartmentChangeDecision {
  if (role !== "ADMIN") return { kind: "forbidden" };

  return { kind: "allowed" };
}

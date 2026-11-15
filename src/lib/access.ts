import type { findUserByClerkId } from "./user";
import { decideDepartmentChange } from "./department-permission";

export type FoundUser = NonNullable<
  Awaited<ReturnType<typeof findUserByClerkId>>
>;
export type NavLinks = { departments: boolean };

type RedirectPaths = "/setup-company" | "/no-access";

type DecisionAnswer =
  | { kind: "allowed"; activeUser: FoundUser }
  | { kind: "redirect"; to: RedirectPaths };

type ExistingUser =
  | { kind: "allowed" }
  | { kind: "redirect"; to: "/dashboard" };

export function decideAccess(activeUser: FoundUser | null): DecisionAnswer {
  if (activeUser === null) {
    return { kind: "redirect", to: "/setup-company" };
  }

  if (activeUser.status === "ACTIVE") {
    return { kind: "allowed", activeUser };
  }

  return { kind: "redirect", to: "/no-access" };
}

export function decideCompanySetupAccess(
  activeUser: FoundUser | null,
): ExistingUser {
  if (activeUser === null) {
    return { kind: "allowed" };
  }

  return { kind: "redirect", to: "/dashboard" };
}

export function decideNavLinksAccess(activeUser: FoundUser | null): NavLinks {
  if (activeUser === null) return { departments: false };
  if (activeUser.status !== "ACTIVE") return { departments: false };

  const result = decideDepartmentChange(activeUser.role);
  return { departments: result.kind === "allowed" };
}

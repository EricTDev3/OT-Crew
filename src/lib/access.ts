import type { findUserByClerkId } from "./user";

export type FoundUser = NonNullable<
  Awaited<ReturnType<typeof findUserByClerkId>>
>;

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

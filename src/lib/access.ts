import type { findUserByClerkId } from "./user";

export type FoundUser = NonNullable<
  Awaited<ReturnType<typeof findUserByClerkId>>
>;

type RedirectPaths = "/setup-company" | "/no-access";

type DecisionAnswer =
  | { kind: "allowed"; activeUser: FoundUser }
  | { kind: "redirect"; to: RedirectPaths };

export function decideAccess(activeUser: FoundUser | null): DecisionAnswer {
  if (activeUser === null) {
    return { kind: "redirect", to: "/setup-company" };
  }

  if (activeUser.status === "ACTIVE") {
    return { kind: "allowed", activeUser };
  }

  return { kind: "redirect", to: "/no-access" };
}

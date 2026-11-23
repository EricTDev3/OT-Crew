import { type UserStatus } from "../generated/prisma/client";

export type InviteInput = {
  id: number;
  status: UserStatus;
  clerkUserId: string | null;
};

type InviteAnswer =
  | { kind: "no-invite"; to: "/setup-company" }
  | { kind: "invited"; id: InviteInput["id"] }
  | { kind: "refuse"; to: "/no-access" };

export function decideInviteAcceptance(
  invitedUser: InviteInput | null,
  emailVerified: boolean,
): InviteAnswer {
  if (invitedUser === null) return { kind: "no-invite", to: "/setup-company" };
  if (
    emailVerified &&
    invitedUser.clerkUserId === null &&
    invitedUser.status === "INVITED"
  )
    return { kind: "invited", id: invitedUser.id };

  return { kind: "refuse", to: "/no-access" };
}

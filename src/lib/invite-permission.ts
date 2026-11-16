import type { UserRole } from "../generated/prisma/client";

// Who may send account invites (Step 3). OT requests are a separate rule (Step 4).
export type InviteChangeDecision = { kind: "allowed" } | { kind: "forbidden" };

export function decideInviteChange(role: UserRole): InviteChangeDecision {
  if (role !== "ADMIN") return { kind: "forbidden" };

  return { kind: "allowed" };
}

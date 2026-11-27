import type { PrismaClient } from "../generated/prisma/client";
import { decideInviteAcceptance } from "./invite-acceptance";
import { normalizeEmail } from "./email";

export type AcceptInviteResult =
  | { kind: "accepted" }
  | { kind: "no-invite" }
  | { kind: "refuse" };

export async function acceptInvite(
  db: PrismaClient,
  clerkUserId: string,
  email: string,
  emailVerified: boolean,
): Promise<AcceptInviteResult> {
  const normalizedEmail = normalizeEmail(email);

  const userRow = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, status: true, clerkUserId: true },
  });

  const decision = decideInviteAcceptance(userRow, emailVerified);

  if (decision.kind === "no-invite") return { kind: "no-invite" };
  if (decision.kind === "refuse") return { kind: "refuse" };

  const updated = await db.user.updateMany({
    where: { id: decision.id, clerkUserId: null, status: "INVITED" },
    data: { clerkUserId, status: "ACTIVE" },
  });

  if (updated.count === 0) return { kind: "refuse" };

  return { kind: "accepted" };
}

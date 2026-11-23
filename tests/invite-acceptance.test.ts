import { expect, test, describe } from "vitest";
import {
  decideInviteAcceptance,
  type InviteInput,
} from "../src/lib/invite-acceptance";

describe("decideInviteAcceptance", () => {
  const validInput: InviteInput = {
    id: 1,
    clerkUserId: null,
    status: "INVITED",
  };

  test("Should link clerkUserId to invited user row", () => {
    const result = decideInviteAcceptance(validInput, true);

    expect(result).toEqual({ kind: "invited", id: 1 });
  });

  test("Goes to setup when there is no row for the email", () => {
    const result = decideInviteAcceptance(null, true);

    expect(result).toEqual({ kind: "no-invite", to: "/setup-company" });
  });

  test("Refuses when the email is not verified", () => {
    const result = decideInviteAcceptance(validInput, false);

    expect(result).toEqual({ kind: "refuse", to: "/no-access" });
  });

  test("Refuses when the row already has a clerkUserId", () => {
    const result = decideInviteAcceptance(
      { ...validInput, clerkUserId: "user_other" },
      true,
    );

    expect(result).toEqual({ kind: "refuse", to: "/no-access" });
  });

  test("Refuses a REMOVED row", () => {
    const result = decideInviteAcceptance(
      { ...validInput, status: "REMOVED" },
      true,
    );

    expect(result).toEqual({ kind: "refuse", to: "/no-access" });
  });

  test("Refuses an ACTIVE row", () => {
    const result = decideInviteAcceptance(
      { ...validInput, status: "ACTIVE" },
      true,
    );

    expect(result).toEqual({ kind: "refuse", to: "/no-access" });
  });
});

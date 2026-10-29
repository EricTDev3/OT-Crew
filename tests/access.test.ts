import { describe, expect, test } from "vitest";
import { decideAccess, type FoundUser } from "../src/lib/access";

const activeUser: FoundUser = {
  id: 1,
  companyId: 2,
  firstName: "John",
  lastName: "Smith",
  role: "ADMIN",
  status: "ACTIVE",
};

describe("DecideAccess", () => {
  test("Sends someone with no user row to the company setup page", () => {
    const result = decideAccess(null);

    expect(result).toEqual({ kind: "redirect", to: "/setup-company" });
  });

  test("Allows someone with active status and returns their user", () => {
    const result = decideAccess(activeUser);

    expect(result).toEqual({ kind: "allowed", activeUser });
  });

  test("Sends someone with invited status to the no access page", () => {
    const result = decideAccess({ ...activeUser, status: "INVITED" });

    expect(result).toEqual({ kind: "redirect", to: "/no-access" });
  });

  test("Sends someone with removed status to the no access page", () => {
    const result = decideAccess({ ...activeUser, status: "REMOVED" });

    expect(result).toEqual({ kind: "redirect", to: "/no-access" });
  });

  // tests an unknown status type as a safety check.
  test("Sends someone with an unknown status to the no access page", () => {
    const result = decideAccess({
      ...activeUser,
      status: "SUSPENDED" as FoundUser["status"],
    });

    expect(result).toEqual({ kind: "redirect", to: "/no-access" });
  });
});

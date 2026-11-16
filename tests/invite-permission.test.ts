import { expect, test, describe } from "vitest";
import { decideInviteChange } from "../src/lib/invite-permission";

describe("decideInviteChange", () => {
  test("Return allowed if role is admin", () => {
    const result = decideInviteChange("ADMIN");

    expect(result).toEqual({ kind: "allowed" });
  });

  test("Return forbidden if role is employee", () => {
    const result = decideInviteChange("EMPLOYEE");

    expect(result).toEqual({ kind: "forbidden" });
  });
});

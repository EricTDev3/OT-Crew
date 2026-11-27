import "dotenv/config";
import { afterAll, beforeEach, describe, test, expect } from "vitest";
import { acceptInvite } from "../src/lib/accept-invite";
import {
  createCompanyWithAdmin,
  type CreateCompanyWithAdminInput,
} from "../src/lib/company";
import { createInvite } from "../src/lib/invite";
import { resetDb, testDb } from "./helpers/db";

beforeEach(resetDb);
afterAll(() => testDb.$disconnect());

const companyInput1: CreateCompanyWithAdminInput = {
  clerkUserId: "user_1",
  email: "JSmith@acme.com",
  firstName: "Jay",
  lastName: "Smith",
  companyName: "Acme Corp",
  timeZone: "America/New_York",
  departmentNames: ["Finishing", "Soldering", "IT"],
};

const invitedEmail = "pat.lee@acme.com";
const clerkId = "user_pat";

let invitedId: number;

// Declared after the top-level resetDb hook, so it runs after the reset.
beforeEach(async () => {
  const company1 = await createCompanyWithAdmin(testDb, companyInput1);

  const invite = await createInvite(testDb, company1.id, {
    firstName: "Pat",
    lastName: "Lee",
    email: invitedEmail,
    role: "EMPLOYEE",
    departmentIds: company1.departments.slice(0, 2).map((dept) => dept.id),
  });

  if (invite.kind !== "invited") throw new Error("test setup: invite failed");

  invitedId = invite.user.id;
});

// Read the invited row back from the database.
function readInvited() {
  return testDb.user.findUniqueOrThrow({ where: { id: invitedId } });
}

describe("acceptInvite", () => {
  test("links the Clerk user to the invited row and makes it ACTIVE", async () => {
    const before = await readInvited();

    const result = await acceptInvite(testDb, clerkId, invitedEmail, true);

    expect(result).toEqual({ kind: "accepted" });

    const after = await readInvited();
    expect(after.clerkUserId).toBe(clerkId);
    expect(after.status).toBe("ACTIVE");
    // The invite locks these (rule 3), so accepting must not touch them.
    expect(after.firstName).toBe(before.firstName);
    expect(after.lastName).toBe(before.lastName);
    expect(after.email).toBe(before.email);
    expect(after.role).toBe(before.role);
    expect(after.companyId).toBe(before.companyId);
  });

  test("matches an email that differs in case or spacing", async () => {
    const result = await acceptInvite(
      testDb,
      clerkId,
      "  PAT.Lee@Acme.com ",
      true,
    );

    expect(result).toEqual({ kind: "accepted" });
    expect((await readInvited()).clerkUserId).toBe(clerkId);
  });

  test("returns no-invite and writes nothing when no row has the email", async () => {
    const before = await readInvited();

    const result = await acceptInvite(testDb, clerkId, "nobody@acme.com", true);

    expect(result).toEqual({ kind: "no-invite" });
    expect(await readInvited()).toEqual(before);
  });

  test("refuses an unverified email and writes nothing", async () => {
    const before = await readInvited();

    const result = await acceptInvite(testDb, clerkId, invitedEmail, false);

    expect(result).toEqual({ kind: "refuse" });
    expect(await readInvited()).toEqual(before);
  });

  test("refuses a row that already has a clerkUserId", async () => {
    await testDb.user.update({
      where: { id: invitedId },
      data: { clerkUserId: "user_other" },
    });
    const before = await readInvited();

    const result = await acceptInvite(testDb, clerkId, invitedEmail, true);

    expect(result).toEqual({ kind: "refuse" });
    expect(await readInvited()).toEqual(before);
    expect(before.clerkUserId).toBe("user_other");
  });

  test("refuses a REMOVED row", async () => {
    await testDb.user.update({
      where: { id: invitedId },
      data: { status: "REMOVED" },
    });
    const before = await readInvited();

    const result = await acceptInvite(testDb, clerkId, invitedEmail, true);

    expect(result).toEqual({ kind: "refuse" });
    expect(await readInvited()).toEqual(before);
  });

  test("refuses an ACTIVE row", async () => {
    await testDb.user.update({
      where: { id: invitedId },
      data: { status: "ACTIVE" },
    });
    const before = await readInvited();

    const result = await acceptInvite(testDb, clerkId, invitedEmail, true);

    expect(result).toEqual({ kind: "refuse" });
    expect(await readInvited()).toEqual(before);
  });

  test("a second person cannot take a row that was just linked", async () => {
    const first = await acceptInvite(testDb, "user_first", invitedEmail, true);
    const second = await acceptInvite(
      testDb,
      "user_second",
      invitedEmail,
      true,
    );

    expect(first).toEqual({ kind: "accepted" });
    expect(second).toEqual({ kind: "refuse" });
    expect((await readInvited()).clerkUserId).toBe("user_first");
  });
});

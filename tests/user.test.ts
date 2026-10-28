import { afterAll, describe, beforeEach, expect, test } from "vitest";
import { findUserByClerkId } from "../src/lib/user";
import {
  createCompanyWithAdmin,
  type CreateCompanyWithAdminInput,
} from "../src/lib/company";
import { resetDb, testDb } from "./helpers/db";

beforeEach(resetDb);
afterAll(() => testDb.$disconnect());

describe("findUserByClerkId", () => {
  const input: CreateCompanyWithAdminInput = {
    clerkUserId: "user_1",
    email: "JSmith@acme.com",
    firstName: "Jay",
    lastName: "Smith",
    companyName: "Acme Corp",
    timeZone: "America/New_York",
    departmentNames: ["Finishing", "Soldering", "IT"],
  };

  test("Returns null for unknown Id", async () => {
    await createCompanyWithAdmin(testDb, input);

    const result = await findUserByClerkId(testDb, "nobody");

    expect(result).toBe(null);
  });

  test("Finds an existing user with known Clerk ID", async () => {
    await createCompanyWithAdmin(testDb, input);

    const result = await findUserByClerkId(testDb, input.clerkUserId);
    const companies = await testDb.company.findMany();

    expect(result).toEqual({
      id: expect.any(Number),
      status: "ACTIVE",
      role: "ADMIN",
      firstName: input.firstName,
      lastName: input.lastName,
      companyId: companies[0].id,
    });
  });
});

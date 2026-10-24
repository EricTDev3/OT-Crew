import { afterAll, describe, beforeEach, expect, test } from "vitest";
import { resetDb, testDb } from "./helpers/db";
import {
  createCompanyWithAdmin,
  type CreateCompanyWithAdminInput,
} from "../src/lib/company";

beforeEach(resetDb);
afterAll(() => testDb.$disconnect());

describe("createCompanyWithAdmin", () => {
  const input: CreateCompanyWithAdminInput = {
    clerkUserId: "user_1",
    email: "JSmith@acme.com",
    firstName: "Jay",
    lastName: "Smith",
    companyName: "Acme Corp",
    timeZone: "America/New_York",
    departmentNames: ["Finishing", "Soldering", "IT"],
  };

  test("create a company with given name", async () => {
    await createCompanyWithAdmin(testDb, input);

    const companies = await testDb.company.findMany();

    expect(companies).toHaveLength(1);
    expect(companies[0].name).toBe("Acme Corp");
  });

  test("user should be created and be linked to the correct company", async () => {
    await createCompanyWithAdmin(testDb, input);

    const users = await testDb.user.findMany();
    const companies = await testDb.company.findMany();

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(input.email);
    expect(users[0].role).toBe("ADMIN");
    expect(users[0].companyId).toEqual(companies[0].id);
  });

  test("department should be created and all companies linked to the correct company", async () => {
    await createCompanyWithAdmin(testDb, input);

    const depts = await testDb.department.findMany();
    const companies = await testDb.company.findMany();
    const deptNames = depts.map((dept) => dept.name);

    expect(depts).toHaveLength(input.departmentNames.length);
    expect([...deptNames].sort()).toEqual([...input.departmentNames].sort());
    expect(depts.every((dept) => dept.companyId === companies[0].id)).toBe(
      true,
    );
  });

  test("company cannot be created when the admin cannot be created", async () => {
    await createCompanyWithAdmin(testDb, input);

    await expect(
      createCompanyWithAdmin(testDb, {
        ...input,
        companyName: "Other Corp",
        email: "other@acme.com",
      }),
    ).rejects.toThrow();

    const companies = await testDb.company.findMany();
    const depts = await testDb.department.findMany();

    expect(companies).toHaveLength(1);
    expect(companies.map((company) => company.name)).not.toContain(
      "Other Corp",
    );
    expect(depts).toHaveLength(input.departmentNames.length);
  });
});

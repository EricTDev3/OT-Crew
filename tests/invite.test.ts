import "dotenv/config";
import { afterAll, beforeEach, describe, test, expect } from "vitest";
import { resetDb, testDb } from "./helpers/db";
import {
  createCompanyWithAdmin,
  type CreateCompanyWithAdminInput,
} from "../src/lib/company";
import { createInvite, type CreateInviteInput } from "../src/lib/invite";
import { Prisma, type PrismaClient } from "../src/generated/prisma/client";

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

const companyInput2: CreateCompanyWithAdminInput = {
  clerkUserId: "user_2",
  email: "DDavis@JJcorp.org",
  firstName: "David",
  lastName: "Joan",
  companyName: "JJ Corp",
  timeZone: "America/New_York",
  departmentNames: ["CS", "HR", "IT"],
};

let company1: Awaited<ReturnType<typeof createCompanyWithAdmin>>;
let company2: Awaited<ReturnType<typeof createCompanyWithAdmin>>;
let validInput: CreateInviteInput;

// Declared after the top-level resetDb hook, so it runs after the reset.
beforeEach(async () => {
  company1 = await createCompanyWithAdmin(testDb, companyInput1);
  company2 = await createCompanyWithAdmin(testDb, companyInput2);

  // One valid input. Each test changes one thing.
  validInput = {
    firstName: "Pat",
    lastName: "Lee",
    email: "pat.lee@acme.com",
    role: "EMPLOYEE",
    departmentIds: company1.departments.slice(0, 2).map((dept) => dept.id),
  };
});

// The two admins from setup are the only users before each test.
async function countUsers() {
  return testDb.user.count();
}

// A stand-in for the database client. Reads go to the real test database,
// but user.create throws the error we hand it. This reproduces the race where
// the email is free at the check but taken by the time of the insert.
function dbWhereCreateThrows(error: Error) {
  return {
    user: {
      findUnique: (args: Parameters<typeof testDb.user.findUnique>[0]) =>
        testDb.user.findUnique(args),
      create: async () => {
        throw error;
      },
    },
    department: {
      findMany: (args: Parameters<typeof testDb.department.findMany>[0]) =>
        testDb.department.findMany(args),
    },
  } as unknown as PrismaClient;
}

describe("createInvite", () => {
  test("Creates an INVITED user in the right company with its memberships", async () => {
    const result = await createInvite(testDb, company1.id, validInput);

    expect(result.kind).toBe("invited");
    if (result.kind !== "invited") return;

    const stored = await testDb.user.findUniqueOrThrow({
      where: { id: result.user.id },
      include: { memberships: true },
    });

    expect(stored.companyId).toBe(company1.id);
    expect(stored.status).toBe("INVITED");
    expect(stored.role).toBe("EMPLOYEE");
    expect(stored.firstName).toBe("Pat");
    expect(stored.lastName).toBe("Lee");
    expect(stored.clerkUserId).toBeNull();
    expect(stored.clerkInvitationId).toBeNull();
    expect(stored.memberships.map((m) => m.departmentId).sort()).toEqual(
      [...validInput.departmentIds].sort(),
    );
    expect(stored.memberships.every((m) => m.companyId === company1.id)).toBe(
      true,
    );
  });

  test("Stores the email trimmed and lowercased", async () => {
    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      email: "  Pat.LEE@Acme.com ",
    });

    expect(result.kind).toBe("invited");
    if (result.kind !== "invited") return;

    const stored = await testDb.user.findUniqueOrThrow({
      where: { id: result.user.id },
    });
    expect(stored.email).toBe("pat.lee@acme.com");
  });

  test("Creates an ADMIN invite when the role is ADMIN", async () => {
    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      role: "ADMIN",
    });

    expect(result.kind).toBe("invited");
    if (result.kind !== "invited") return;
    expect(result.user.role).toBe("ADMIN");
  });

  test("Duplicate department ids create one membership each", async () => {
    const id = validInput.departmentIds[0];

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      departmentIds: [id, id],
    });

    expect(result.kind).toBe("invited");
    if (result.kind !== "invited") return;

    const memberships = await testDb.departmentMember.findMany({
      where: { userId: result.user.id },
    });
    expect(memberships).toHaveLength(1);
    expect(memberships[0].departmentId).toBe(id);
  });

  test("Rejects an email that already exists in the same company", async () => {
    const before = await countUsers();

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      email: "jsmith@acme.com",
    });

    expect(result).toEqual({ kind: "email-taken" });
    expect(await countUsers()).toBe(before);
  });

  test("Rejects an email that differs only in case or whitespace", async () => {
    const before = await countUsers();

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      email: " JSMITH@ACME.COM ",
    });

    expect(result).toEqual({ kind: "email-taken" });
    expect(await countUsers()).toBe(before);
  });

  test("Rejects an email that belongs to another company", async () => {
    const before = await countUsers();

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      email: "ddavis@jjcorp.org",
    });

    expect(result).toEqual({ kind: "email-taken" });
    expect(await countUsers()).toBe(before);
  });

  test("Rejects an email that belongs to an already invited person", async () => {
    const first = await createInvite(testDb, company1.id, validInput);
    expect(first.kind).toBe("invited");
    const before = await countUsers();

    const second = await createInvite(testDb, company1.id, validInput);

    expect(second).toEqual({ kind: "email-taken" });
    expect(await countUsers()).toBe(before);
  });

  test("Rejects a department that belongs to another company", async () => {
    const before = await countUsers();
    const foreignId = company2.departments[0].id;

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      departmentIds: [foreignId],
    });

    expect(result).toEqual({ kind: "invalid-departments" });
    expect(await countUsers()).toBe(before);
  });

  test("Rejects the whole invite when only one department is foreign", async () => {
    const before = await countUsers();
    const foreignId = company2.departments[0].id;

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      departmentIds: [...validInput.departmentIds, foreignId],
    });

    expect(result).toEqual({ kind: "invalid-departments" });
    expect(await countUsers()).toBe(before);
    expect(await testDb.departmentMember.count()).toBe(0);
  });

  test("Rejects a soft-deleted department", async () => {
    const before = await countUsers();
    await testDb.department.update({
      where: { id: validInput.departmentIds[0] },
      data: { deletedAt: new Date() },
    });

    const result = await createInvite(testDb, company1.id, validInput);

    expect(result).toEqual({ kind: "invalid-departments" });
    expect(await countUsers()).toBe(before);
  });

  test("Rejects a department id that does not exist", async () => {
    const before = await countUsers();

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      departmentIds: [999999],
    });

    expect(result).toEqual({ kind: "invalid-departments" });
    expect(await countUsers()).toBe(before);
  });

  test("Returns email-taken when the insert hits a unique violation (P2002)", async () => {
    const before = await countUsers();
    const uniqueViolation = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "test" },
    );

    const result = await createInvite(
      dbWhereCreateThrows(uniqueViolation),
      company1.id,
      validInput,
    );

    expect(result).toEqual({ kind: "email-taken" });
    expect(await countUsers()).toBe(before);
  });

  test("Rethrows any other error from the insert", async () => {
    const other = new Error("connection lost");

    await expect(
      createInvite(dbWhereCreateThrows(other), company1.id, validInput),
    ).rejects.toThrow("connection lost");
  });

  test("Rejects an empty department list", async () => {
    const before = await countUsers();

    const result = await createInvite(testDb, company1.id, {
      ...validInput,
      departmentIds: [],
    });

    expect(result).toEqual({ kind: "invalid-departments" });
    expect(await countUsers()).toBe(before);
  });
});

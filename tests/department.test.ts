import { afterAll, beforeEach, describe, test, expect } from "vitest";
import { resetDb, testDb } from "./helpers/db";
import {
  createCompanyWithAdmin,
  type CreateCompanyWithAdminInput,
} from "../src/lib/company";
import { listDepartments } from "../src/lib/department";
import { renameDepartment } from "../src/lib/department";

beforeEach(resetDb);
afterAll(() => testDb.$disconnect());

const input1: CreateCompanyWithAdminInput = {
  clerkUserId: "user_1",
  email: "JSmith@acme.com",
  firstName: "Jay",
  lastName: "Smith",
  companyName: "Acme Corp",
  timeZone: "America/New_York",
  departmentNames: ["Finishing", "Soldering", "IT"],
};

const input2: CreateCompanyWithAdminInput = {
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
let company3: Awaited<ReturnType<typeof createCompanyWithAdmin>>;

// Declared after the top-level resetDb hook, so it runs after the reset.
beforeEach(async () => {
  company1 = await createCompanyWithAdmin(testDb, input1);
  company2 = await createCompanyWithAdmin(testDb, input2);
  company3 = await createCompanyWithAdmin(testDb, {
    ...input1,
    companyName: "Empty Co.",
    clerkUserId: "user_3",
    email: "empty@example.com",
    departmentNames: [],
  });
});

describe("listDepartments", () => {
  test("Returns only the departments of the given company", async () => {
    const departments1 = await listDepartments(testDb, company1.id);
    const departments2 = await listDepartments(testDb, company2.id);

    expect(departments1.map((dept) => dept.name)).toEqual(
      [...input1.departmentNames].sort(),
    );

    expect(departments1.every((dept) => dept.companyId === company1.id)).toBe(
      true,
    );

    expect(departments2.map((dept) => dept.name)).toEqual(
      [...input2.departmentNames].sort(),
    );

    expect(departments2.every((dept) => dept.companyId === company2.id)).toBe(
      true,
    );
  });

  test("Return [] if there are no departments for a given companyId", async () => {
    const departments3 = await listDepartments(testDb, company3.id);

    expect(departments3).toEqual([]);
  });

  test("Only return departments that were not deleted", async () => {
    const deletedName = "Finishing";
    const deleted = company1.departments.find((d) => d.name === deletedName);
    if (!deleted) throw new Error(`seed has no department "${deletedName}"`);

    await testDb.department.update({
      where: { id: deleted.id },
      data: { deletedAt: new Date() },
    });

    const company1Depts = await listDepartments(testDb, company1.id);
    const company1DeptsNames = company1Depts.map((dept) => dept.name);

    // Everything except the deleted one, in the order listDepartments returns.
    expect(company1DeptsNames).toEqual(
      input1.departmentNames.filter((n) => n !== deletedName).sort(),
    );
  });
});

describe("renameDepartment", () => {
  test("Return 'renamed' when a department name is successfully updated", async () => {
    const deptToUpdate = company1.departments.find(
      (d) => d.name === "Finishing",
    );

    if (!deptToUpdate) throw new Error(`seed has no department "Finishing"`);

    const result = await renameDepartment(
      testDb,
      company1.id,
      deptToUpdate.id,
      "Finishing Production",
    );

    const savedDeptName = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("renamed");
    expect(savedDeptName?.name).toBe("Finishing Production");
  });

  test("Another company cannot rename the department of another company", async () => {
    const deptToUpdate = company1.departments.find(
      (d) => d.name === "Finishing",
    );

    if (!deptToUpdate) throw new Error(`seed has no department "Finishing"`);

    const result = await renameDepartment(
      testDb,
      company2.id,
      deptToUpdate.id,
      "Finishing Production",
    );

    const savedDeptName = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("not-found");
    expect(savedDeptName?.name).toBe("Finishing");
  });

  test("Should not be able to edit a department name when soft deleted.", async () => {
    const deptToUpdate = company1.departments.find(
      (d) => d.name === "Finishing",
    );

    if (!deptToUpdate) throw new Error(`seed has no department "Finishing"`);

    await testDb.department.update({
      where: { id: deptToUpdate.id },
      data: { deletedAt: new Date() },
    });

    const result = await renameDepartment(
      testDb,
      company1.id,
      deptToUpdate.id,
      "Finishing Production",
    );

    const savedDeptName = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("not-found");
    expect(savedDeptName?.name).toBe("Finishing");
  });
});

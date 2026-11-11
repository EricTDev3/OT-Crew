import { afterAll, beforeEach, describe, test, expect } from "vitest";
import { resetDb, testDb } from "./helpers/db";
import {
  createCompanyWithAdmin,
  type CreateCompanyWithAdminInput,
} from "../src/lib/company";
import {
  listDepartments,
  renameDepartment,
  createDepartment,
  deleteDepartment,
} from "../src/lib/department";

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

describe("createDepartments", () => {
  test("It creates a department under the right company", async () => {
    const newDept = await createDepartment(testDb, company1.id, "HR");

    if (newDept.kind !== "created") {
      throw new Error("expected created");
    }

    const savedDeptName = await testDb.department.findUnique({
      where: { id: newDept.department.id },
    });

    expect(newDept.kind).toEqual("created");
    expect(savedDeptName?.companyId).toBe(company1.id);
    expect(savedDeptName?.name).toEqual("HR");
  });

  test("It should not create a duplicate department in the same company", async () => {
    const newDept = await createDepartment(testDb, company1.id, "Finishing");

    const deptCount = await testDb.department.count({
      where: { companyId: company1.id },
    });

    expect(newDept.kind).toEqual("duplicate-name");
    expect(deptCount).toEqual(input1.departmentNames.length);
  });

  test("It should not create a duplicate department regardless of case", async () => {
    const name = "FINISHING";
    const deptLowerCase = name.toLowerCase();

    const newDept = await createDepartment(testDb, company1.id, deptLowerCase);

    const deptCount = await testDb.department.count({
      where: { companyId: company1.id },
    });

    expect(newDept.kind).toEqual("duplicate-name");
    expect(deptCount).toEqual(input1.departmentNames.length);
  });

  test("Allow creation of a department from another company", async () => {
    const newDept = await createDepartment(testDb, company1.id, "CS");

    if (newDept.kind !== "created") {
      throw new Error("expected created");
    }

    const savedDeptName = await testDb.department.findUnique({
      where: { id: newDept.department.id },
    });

    expect(newDept.kind).toEqual("created");
    expect(savedDeptName?.companyId).toEqual(company1.id);
    expect(savedDeptName?.name).toEqual("CS");
  });

  test("Soft deleted departments should not block the name.", async () => {
    const deptToUpdate = company1.departments.find(
      (d) => d.name === "Finishing",
    );

    if (!deptToUpdate) throw new Error(`seed has no department "Finishing"`);

    await testDb.department.update({
      where: { id: deptToUpdate.id },
      data: { deletedAt: new Date() },
    });

    const newDept = await createDepartment(testDb, company1.id, "Finishing");

    if (newDept.kind !== "created") {
      throw new Error("expected created");
    }

    const savedDeptName = await testDb.department.findUnique({
      where: { id: newDept.department.id },
    });

    expect(newDept.kind).toEqual("created");
    expect(savedDeptName?.companyId).toEqual(company1.id);
    expect(newDept.department.id).not.toBe(deptToUpdate.id);
    expect(savedDeptName?.deletedAt).toEqual(null);
    expect(savedDeptName?.name).toEqual("Finishing");
  });
});

describe("deleteDepartment", () => {
  test("Deletes it's own department with the exact name.", async () => {
    const deptToUpdate = company1.departments.find(
      (d) => d.name === "Finishing",
    );

    if (!deptToUpdate) throw new Error(`seed has no department "Finishing"`);

    const result = await deleteDepartment(
      testDb,
      company1.id,
      deptToUpdate.id,
      "Finishing",
    );

    const updatedDept = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("deleted");
    expect(updatedDept?.deletedAt).toBeInstanceOf(Date);
  });

  test("Deletes a department regardless of casing.", async () => {
    const deptToUpdate = company1.departments.find(
      (d) => d.name === "Finishing",
    );

    if (!deptToUpdate) throw new Error(`seed has no department "Finishing"`);

    const result = await deleteDepartment(
      testDb,
      company1.id,
      deptToUpdate.id,
      "FINISHING",
    );
    const updatedDept = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("deleted");
    expect(updatedDept?.deletedAt).toBeInstanceOf(Date);
  });

  test("Deletes nothing when the wrong department name is entered.", async () => {
    const deptToUpdate = company1.departments.find(
      (d) => d.name === "Finishing",
    );

    if (!deptToUpdate) throw new Error(`seed has no department "IT"`);

    const result = await deleteDepartment(
      testDb,
      company1.id,
      deptToUpdate.id,
      "Marketing",
    );
    const updatedDept = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("not-found");
    expect(updatedDept?.deletedAt).toBe(null);
  });

  test("Deletes nothing when the wrong company's department id is referenced.", async () => {
    const deptToUpdate = company1.departments.find((d) => d.name === "IT");

    if (!deptToUpdate) throw new Error(`seed has no department "IT"`);

    const result = await deleteDepartment(
      testDb,
      company2.id,
      deptToUpdate.id,
      "IT",
    );
    const updatedDept = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("not-found");
    expect(updatedDept?.deletedAt).toBe(null);
  });

  test("An already-deleted department returns not-found.", async () => {
    const deptToUpdate = company1.departments.find((d) => d.name === "IT");

    if (!deptToUpdate) throw new Error(`seed has no department "IT"`);

    await deleteDepartment(testDb, company1.id, deptToUpdate.id, "IT");

    const updatedDept = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    const result = await deleteDepartment(
      testDb,
      company1.id,
      deptToUpdate.id,
      "IT",
    );

    const reupdatedDept = await testDb.department.findUnique({
      where: { id: deptToUpdate.id },
    });

    expect(result.kind).toEqual("not-found");
    expect(updatedDept?.deletedAt).toBeInstanceOf(Date);
    expect(updatedDept?.deletedAt).toEqual(reupdatedDept?.deletedAt);
  });
});

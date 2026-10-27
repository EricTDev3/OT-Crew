import companyForm from "../src/lib/schemas";
import { describe, test, expect } from "vitest";

describe("companyForm", () => {
  const validInput = {
    companyName: "Acme Corp",
    timeZone: "America/New_York",
    departmentNames: ["IT", "Finishing", "Surfacing", "AR", "Customer Service"],
  };

  test("The company name should exist", () => {
    const result = companyForm.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data?.companyName).toBe("Acme Corp");
  });

  test("Trims spaces around the company name", () => {
    const result = companyForm.safeParse({
      ...validInput,
      companyName: "  Acme Corp  ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.companyName).toBe("Acme Corp");
  });

  test("Rejects a company with no name", () => {
    const result = companyForm.safeParse({ ...validInput, companyName: "   " });

    expect(result.success).toBe(false);
  });

  test("Rejects invalid time zone", () => {
    const result = companyForm.safeParse({
      ...validInput,
      timeZone: "+01:00",
    });

    expect(result.success).toBe(false);
  });

  test("Rejects non-canonical spelling time zone", () => {
    const result = companyForm.safeParse({
      ...validInput,
      timeZone: "america/new_york",
    });

    expect(result.success).toBe(false);
  });

  test("Department name should have a minimum of 2 characters", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: [
        "I",
        "Finishing",
        "Surfacing",
        "AR",
        "Customer Service",
      ],
    });

    expect(result.success).toBe(false);
  });

  test("Department name should have a maximum of 40 characters", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: [
        "TheWorldOfFreeTradeAndGamblingErrorFreeCompanyAndDepartmentsOfJustice",
      ],
    });

    expect(result.success).toBe(false);
  });

  test("Rejects duplicate departments", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: ["IT", "it"],
    });

    expect(result.success).toBe(false);
  });

  test("Rejects less than 1 department", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: [],
    });

    expect(result.success).toBe(false);
  });

  test("Accepts a single department", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: ["IT"],
    });

    expect(result.success).toBe(true);
  });

  test("Trims spaces around the department name", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: ["  Finishing  "],
    });

    expect(result.success).toBe(true);
    expect(result.data?.departmentNames[0]).toBe("Finishing");
  });

  test("Rejects more than 20 department names", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: Array.from(
        { length: 21 },
        (_, index) => `Department ${index}`,
      ),
    });

    expect(result.success).toBe(false);
  });

  test("Accepts 20 or less department names", () => {
    const result = companyForm.safeParse({
      ...validInput,
      departmentNames: Array.from(
        { length: 20 },
        (_, index) => `Department ${index}`,
      ),
    });

    expect(result.success).toBe(true);
  });
});

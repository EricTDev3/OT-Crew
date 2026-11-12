import { expect, test, describe } from "vitest";
import { decideDepartmentChange } from "../src/lib/department-permission";

describe("decideDepartmentChange", () => {
  test("Return allowed if role is admin", () => {
    const result = decideDepartmentChange("ADMIN");

    expect(result).toEqual({ kind: "allowed" });
  });

  test("Return forbidden if role is employee", () => {
    const result = decideDepartmentChange("EMPLOYEE");

    expect(result).toEqual({ kind: "forbidden" });
  });
});

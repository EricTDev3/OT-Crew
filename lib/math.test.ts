import math from "./math";
import { expect, test } from "vitest";

test("add two numbers", () => {
  const result = math(2, 4);
  expect(result).toBe(6);
});

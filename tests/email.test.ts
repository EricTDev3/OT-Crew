import { normalizeEmail } from "../src/lib/email";
import { describe, expect, test } from "vitest";

describe("normalizeEmail", () => {
  test("It should trim writespace from an email input.", () => {
    const email = normalizeEmail(" test123@gmail.com");
    expect(email).toEqual("test123@gmail.com");
  });

  test("It should lowercase an email input.", () => {
    const email = normalizeEmail("TEST123@GMAIL.COM");
    expect(email).toEqual("test123@gmail.com");
  });

  test("It should trim leading and trailing writespace from an email input.", () => {
    const email = normalizeEmail(" test123@gmail.com ");
    expect(email).toEqual("test123@gmail.com");
  });

  test("It should trim and lowercase an email input.", () => {
    const email = normalizeEmail(" TEST123@GMAIL.COM ");
    expect(email).toEqual("test123@gmail.com");
  });

  test("A +tag or a dot in an email input is untouched.", () => {
    const email = normalizeEmail("first.last+crew@gmail.com");
    expect(email).toEqual("first.last+crew@gmail.com");
  });
});

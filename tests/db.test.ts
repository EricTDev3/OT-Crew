import { afterAll, beforeEach, expect, test } from "vitest";
import { resetDb, testDb } from "./helpers/db";

beforeEach(resetDb);
afterAll(() => testDb.$disconnect());

test("the test database is reachable and empty", async () => {
  expect(await testDb.company.count()).toBe(0);
});

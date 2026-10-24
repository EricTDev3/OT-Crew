import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is not set");

const host = new URL(url).hostname;
if (host !== "localhost" && host !== "127.0.0.1") {
  throw new Error("TEST_DATABASE_URL must point at localhost");
}

export const testDb = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

export async function resetDb() {
  await testDb.$executeRaw`TRUNCATE TABLE "DepartmentMember", "Department", "User", "Company" RESTART IDENTITY CASCADE`;
}

import * as z from "zod";

const validTimeZones = new Set(Intl.supportedValuesOf("timeZone"));

const ianaTimeZoneSchema = z.string().refine((tz) => validTimeZones.has(tz), {
  error: "Invalid IANA time zone",
});

const departmentName = z.string().trim().min(2).max(40);

const companyForm = z.object({
  companyName: z.string().trim().min(1).max(50),
  timeZone: ianaTimeZoneSchema,
  departmentNames: z
    .array(departmentName)
    .min(1)
    .max(20)
    .refine(
      (names) =>
        new Set(names.map((name) => name.toLowerCase())).size === names.length,
      { error: "Department names must be unique, ignoring capitals." },
    ),
});

const inviteForm = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().pipe(z.email()),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  departmentIds: z.array(z.coerce.number().int().min(1)),
});

export { companyForm, departmentName, inviteForm };

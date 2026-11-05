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

export { companyForm, departmentName };

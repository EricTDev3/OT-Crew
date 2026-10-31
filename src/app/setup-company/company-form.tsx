"use client";

import { useActionState, useState } from "react";
import { createCompany } from "./actions";
import { TIME_ZONES } from "./time-zones";

const inputClass =
  "w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-500";

export default function CompanyForm() {
  const [state, formAction, pending] = useActionState(createCompany, null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function addDepartment() {
    const name = draft.trim();
    if (!name) return;
    // Mirrors the "unique, ignoring capitals" rule. The server checks again.
    if (departments.some((d) => d.toLowerCase() === name.toLowerCase())) return;
    setDepartments([...departments, name]);
    setDraft("");
  }

  function removeDepartment(name: string) {
    setDepartments(departments.filter((d) => d !== name));
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-gray-200 bg-white p-6"
    >
      <label
        htmlFor="companyName"
        className="block text-sm font-semibold text-slate-900"
      >
        Company name
      </label>
      <input
        id="companyName"
        name="companyName"
        required
        maxLength={50}
        placeholder="e.g. Acme Distribution"
        className={`${inputClass} mt-2`}
      />

      <label
        htmlFor="timeZone"
        className="mt-6 block text-sm font-semibold text-slate-900"
      >
        Time zone
      </label>
      <select
        id="timeZone"
        name="timeZone"
        defaultValue="America/New_York"
        className={`${inputClass} mt-2`}
      >
        {TIME_ZONES.map((zone) => (
          <option key={zone.value} value={zone.value}>
            {zone.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm text-slate-600">
        Used to close requests at their local start time.
      </p>

      <label
        htmlFor="departmentDraft"
        className="mt-6 block text-sm font-semibold text-slate-900"
      >
        Your departments
      </label>
      <div className="mt-2 flex gap-3">
        {/* No name attribute, so this box is never submitted. Only the hidden inputs below are. */}
        <input
          id="departmentDraft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Enter would otherwise submit the whole form
              addDepartment();
            }
          }}
          maxLength={40}
          placeholder="e.g. Receiving"
          className={inputClass}
        />
        <button
          type="button"
          onClick={addDepartment}
          className="cursor-pointer rounded-lg border border-blue-900 px-5 py-2.5 font-semibold text-blue-900 transition-colors hover:bg-blue-900 hover:text-white"
        >
          Add
        </button>
      </div>

      {departments.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {departments.map((name) => (
            <li
              key={name}
              className="flex items-center gap-2 rounded-full bg-blue-50 py-2 pl-4 pr-3 font-medium text-blue-900"
            >
              {name}
              <input type="hidden" name="departmentNames" value={name} />
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => removeDepartment(name)}
                className="cursor-pointer px-1 text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-sm text-slate-600">
        You can rename or add departments later.
      </p>

      {state && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 cursor-pointer rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create company"}
      </button>
    </form>
  );
}

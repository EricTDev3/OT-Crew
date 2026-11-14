"use client";

import { useActionState } from "react";
import { addDepartment } from "./actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500";

export default function AddDepartmentForm() {
  // state is the last value the action returned: a { message } on a problem,
  // or null at the start and after a success. pending is true while it runs.
  const [state, formAction, pending] = useActionState(addDepartment, null);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-gray-200 bg-white p-6"
    >
      <h2 className="text-lg font-bold text-slate-900">Add a department</h2>
      <label
        htmlFor="departmentName"
        className="mt-4 block text-sm font-semibold text-slate-900"
      >
        Name
      </label>
      <input
        id="departmentName"
        name="name"
        type="text"
        required
        minLength={2}
        maxLength={40}
        placeholder="e.g. Returns"
        className={`${inputClass} mt-2`}
      />
      <p aria-live="polite" className="mt-2 text-sm text-red-700">
        {state?.message}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add department"}
      </button>
    </form>
  );
}

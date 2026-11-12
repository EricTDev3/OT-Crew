import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { decideDepartmentChange } from "@/lib/department-permission";
import { listDepartments } from "@/lib/department";
import { prisma } from "@/lib/prisma";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500";

const secondaryButtonClass =
  "rounded-lg border border-slate-900 px-5 py-2.5 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

async function DepartmentsContent() {
  const user = await requireUser();

  // Courtesy check only: it keeps non-admins away from a screen they cannot
  // use. The real protection is the check inside each Server Action.
  const decision = decideDepartmentChange(user.role);
  if (decision.kind === "forbidden") redirect("/dashboard");

  const departments = await listDepartments(prisma, user.companyId);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Departments
      </h1>
      <p className="mt-2 text-base text-slate-600">
        Rename a department any time. Past requests and records keep their
        history and show the new name.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          {departments.length === 0 ? (
            <p className="text-slate-600">
              No departments yet. Add your first one.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm font-semibold text-slate-600">
                  <th className="pb-3">Department</th>
                  <th className="pb-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="py-4 text-lg font-semibold text-slate-900">
                      {department.name}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          disabled
                          className={secondaryButtonClass}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          disabled
                          className={secondaryButtonClass}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
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
            placeholder="e.g. Returns"
            disabled
            className={`${inputClass} mt-2 disabled:opacity-60`}
          />
          <button
            type="button"
            disabled
            className="mt-4 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add department
          </button>
        </section>
      </div>
    </>
  );
}

export default function DepartmentsPage() {
  return (
    <main className="flex-1 bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <Suspense fallback={<p>Loading...</p>}>
          <DepartmentsContent />
        </Suspense>
      </div>
    </main>
  );
}

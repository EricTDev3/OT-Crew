"use client";

import { useActionState, useState } from "react";
import { editDepartmentName, type DepartmentFormState } from "./actions";

const secondaryButtonClass =
  "min-h-11 rounded-lg border border-slate-900 px-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

function RenameForm({
  id,
  name,
  onDone,
  onCancel,
}: {
  id: number;
  name: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  // Wraps the Server Action so the row can leave edit mode after a real rename.
  // The action returns null only on success, so null means "renamed".
  async function renameAction(
    prevState: DepartmentFormState,
    formData: FormData,
  ): Promise<DepartmentFormState> {
    const result = await editDepartmentName(prevState, formData);
    if (result === null) onDone();
    return result;
  }

  const [state, formAction, pending] = useActionState(renameAction, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <div className="flex w-full items-center justify-end gap-3">
        {/* The id says WHICH department. Whose department it is comes from the
            signed-in user on the server, never from this form. */}
        <input type="hidden" name="departmentId" value={id} />
        <input
          name="name"
          type="text"
          aria-label={`New name for ${name}`}
          defaultValue={name}
          required
          minLength={2}
          maxLength={40}
          autoFocus
          className="min-h-11 min-w-28 flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-[15px] text-slate-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-lg border border-teal-700 bg-teal-700 px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className={secondaryButtonClass}
        >
          Cancel
        </button>
      </div>
      <p aria-live="polite" className="text-sm text-red-700">
        {state?.message}
      </p>
    </form>
  );
}

export default function DepartmentRow({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      <td className="py-4 text-lg font-semibold text-slate-900">{name}</td>
      <td className="py-4">
        {editing ? (
          <RenameForm
            id={id}
            name={name}
            onDone={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={secondaryButtonClass}
            >
              Rename
            </button>
            {/* Delete is not wired yet. */}
            <button type="button" disabled className={secondaryButtonClass}>
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

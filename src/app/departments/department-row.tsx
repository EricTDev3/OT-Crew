"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  editDepartmentName,
  removeDepartment,
  type DepartmentFormState,
} from "./actions";

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

function DeleteDialog({
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  // This component is mounted only while the dialog should be open, so open it
  // as a modal on mount. showModal() traps focus, dims the page, and lets Esc close it.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Same wrapper idea as RenameForm: the action returns null only on success.
  async function deleteAction(
    prevState: DepartmentFormState,
    formData: FormData,
  ): Promise<DepartmentFormState> {
    const result = await removeDepartment(prevState, formData);
    if (result === null) onDone();
    return result;
  }

  const [state, formAction, pending] = useActionState(deleteAction, null);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      aria-labelledby={`delete-title-${id}`}
      className="m-auto w-full max-w-140 rounded-2xl p-6 backdrop:bg-slate-900/40"
    >
      <form action={formAction} className="flex flex-col gap-4">
        {/* The id says WHICH department. Whose department it is comes from the
            signed-in user on the server, never from this form. */}
        <input type="hidden" name="departmentId" value={id} />
        <h2
          id={`delete-title-${id}`}
          className="text-[22px] font-bold text-slate-900"
        >
          Delete {name}?
        </h2>
        <p className="rounded-lg border border-rose-800 bg-[#FDE8EC] px-4 py-3 text-sm font-semibold text-[#7F0F2E]">
          This can&apos;t be undone.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[15px] leading-7 text-slate-900">
          <li>People in {name} stay in the company.</li>
          <li>Past OT records keep this department, shown as deleted.</li>
        </ul>
        <p aria-live="polite" className="text-sm text-red-700">
          {state?.message}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 rounded-lg border border-rose-800 bg-rose-800 px-5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Deleting..." : "Delete department"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="min-h-11 rounded-lg border border-slate-900 bg-white px-5 text-[15px] font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
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
  const [deleting, setDeleting] = useState(false);

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
            <button
              type="button"
              onClick={() => setDeleting(true)}
              className={secondaryButtonClass}
            >
              Delete
            </button>
            {deleting && (
              <DeleteDialog
                id={id}
                name={name}
                onDone={() => setDeleting(false)}
                onCancel={() => setDeleting(false)}
              />
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

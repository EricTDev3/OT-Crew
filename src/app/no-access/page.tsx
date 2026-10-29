import { SignOutButton } from "@clerk/nextjs";

export default function NoAccessPage() {
  return (
    <main className="flex flex-1 items-start justify-center bg-gray-100 px-4 pt-24 dark:bg-zinc-950">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          You don&apos;t have access right now
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-zinc-300">
          Your account isn&apos;t active. Contact your company admin.
        </p>
        <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-zinc-300">
          If you were recently invited, open the link in your invite email to
          finish setting up.
        </p>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="mt-8 cursor-pointer rounded-lg border border-slate-900 px-5 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-200 dark:hover:text-zinc-900"
          >
            Sign out
          </button>
        </SignOutButton>
      </section>
    </main>
  );
}

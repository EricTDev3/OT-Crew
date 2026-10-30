import { SignOutButton } from "@clerk/nextjs";

export default function NoAccessPage() {
  return (
    <main className="flex flex-1 items-start justify-center bg-gray-100 px-4 pt-14">
      <section className="w-full max-w-[30rem] rounded-2xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          You don&apos;t have access right now
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          Your account isn&apos;t active. Contact your company admin.
        </p>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          If you were recently invited, open the link in your invite email to
          finish setting up.
        </p>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="mt-8 cursor-pointer rounded-lg border border-slate-900 px-5 py-2 font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
          >
            Sign out
          </button>
        </SignOutButton>
      </section>
    </main>
  );
}

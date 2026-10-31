import { currentUser } from "@clerk/nextjs/server";
import { requireCompanySetupAccess } from "@/lib/require-company-setup-access";
import { Suspense } from "react";
import CompanyForm from "./company-form";

async function EmailConfirmedBadge() {
  const user = await currentUser();
  const confirmed =
    user?.primaryEmailAddress?.verification?.status === "verified";

  if (!confirmed) return null;

  return (
    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900">
      Email confirmed
    </span>
  );
}

async function SetupContent() {
  await requireCompanySetupAccess();

  return (
    <>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        Set up your company
      </h1>
      <p className="mt-2 mb-6 text-base leading-relaxed text-slate-700">
        You&apos;ll be the company admin. Nothing is created until you finish
        this step.
      </p>
      <CompanyForm />
    </>
  );
}

export default function SetupCompanyPage() {
  return (
    <main className="flex flex-1 justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <Suspense>
          <EmailConfirmedBadge />
          <SetupContent />
        </Suspense>
      </div>
    </main>
  );
}

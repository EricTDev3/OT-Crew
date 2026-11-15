import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-gray-100 px-6 py-12">
      <div className="w-full max-w-[520px]">
        <h1 className="mb-6 text-[28px] font-bold text-[#14213d]">Log in</h1>
      </div>
      <Suspense>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#0f766e",
              colorForeground: "#14213d",
              borderRadius: "8px",
            },
            elements: {
              rootBox: "w-full max-w-[520px]",
              cardBox:
                "w-full rounded-xl border border-[#d9dde3] bg-white shadow-none",
              card: "gap-4 p-6 shadow-none",
              header: "hidden",
              formFieldLabel: "text-[13px] font-semibold",
              formFieldInput:
                "min-h-11 rounded-lg border border-[#aeb5c1] px-3 text-[15px] shadow-none",
              formButtonPrimary:
                "min-h-11 w-auto self-start rounded-lg px-5 text-[15px] font-semibold normal-case shadow-none",
              formFieldAction: "font-semibold text-[#0f766e]",
              // The design puts this text under the card, so Clerk's own
              // footer ("Don't have an account?") is hidden and replaced below.
              footer: "hidden",
            },
          }}
        />
      </Suspense>
      <p className="mt-4 w-full max-w-[520px] text-sm leading-6 text-gray-600">
        Starting a new company?{" "}
        <Link href="/sign-up" className="text-[#0f766e] underline">
          Create an account
        </Link>
        .<br />
        Employees and department leads join through an invite from their admin.
      </p>
    </main>
  );
}

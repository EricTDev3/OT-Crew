import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-[560px]">
        <h1 className="text-[30px] font-bold text-[#14213d]">
          Create your account
        </h1>
        <p className="mt-2 mb-6 text-base leading-6 text-gray-600">
          Start with your own login. Next, you&apos;ll confirm your email with a
          code, then set up your company.
        </p>
      </div>
      <Suspense>
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#0f766e",
              colorForeground: "#14213d",
              borderRadius: "8px",
            },
            elements: {
              rootBox: "w-full max-w-[560px]",
              cardBox:
                "w-full rounded-xl border border-[#d9dde3] bg-white shadow-none",
              card: "gap-4 p-6 shadow-none",
              header: "hidden",
              formFieldLabel: "text-[13px] font-semibold",
              formFieldInput:
                "min-h-11 rounded-lg border border-[#aeb5c1] px-3 text-[15px] shadow-none",
              formButtonPrimary:
                "min-h-11 self-start rounded-lg px-5 text-[15px] font-semibold normal-case shadow-none",
              footerActionLink: "font-semibold text-[#0f766e]",
            },
          }}
        />
      </Suspense>
    </main>
  );
}

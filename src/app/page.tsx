import { Show, SignUpButton } from "@clerk/nextjs";
import { Suspense } from "react";

const steps = [
  {
    title: "Post an OT request",
    text: "Choose the department, how many people you need, the hours, and what the work is.",
  },
  {
    title: "Employees confirm",
    text: "Employees in that department get notified and say whether they're available.",
  },
  {
    title: "Choose the crew",
    text: "Department leads pick from the employees who confirmed. Admins can adjust if needed.",
  },
];

const benefits = [
  {
    title: "Department-based visibility",
    text: "Employees only see overtime for their own departments, and never see each other's responses.",
  },
  {
    title: "Clear records",
    text: "See who worked overtime and for how many hours, by week, month, or quarter.",
  },
  {
    title: "Admins stay in control",
    text: "Close or reopen requests, and step in on any crew decision.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gray-100">
      <section className="bg-[#14213d] py-20 text-white">
        <div className="mx-auto max-w-[936px] px-[18px]">
          <h1 className="max-w-[760px] text-[44px] font-bold leading-[1.15]">
            Fill overtime without chasing employees one by one
          </h1>
          <p className="mt-5 max-w-[640px] text-lg leading-8 text-gray-200">
            For production, warehouse, and any team that issues overtime. Post a
            need, let employees confirm they&apos;re available, and choose the
            crew. Every request and who worked it stays on record.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[936px] flex-1 px-4 py-12">
        <h2 className="text-2xl font-bold text-[#14213d]">How it works</h2>
        <ol className="mt-5 grid gap-5 sm:grid-cols-2">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-gray-200 bg-white p-5 last:odd:sm:col-span-2"
            >
              <span className="inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                {i + 1}
              </span>
              <h3 className="mt-2 text-lg font-bold text-[#14213d]">
                {step.title}
              </h3>
              <p className="mt-1 text-gray-600">{step.text}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-2xl font-bold text-[#14213d]">
          Why teams use it
        </h2>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-xl border border-gray-200 bg-white p-5 last:odd:sm:col-span-2"
            >
              <h3 className="font-bold text-[#14213d]">{benefit.title}</h3>
              <p className="mt-1 text-gray-600">{benefit.text}</p>
            </li>
          ))}
        </ul>

        <section className="mt-12 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-[22px] font-bold text-[#14213d]">
            Ready to try it with your team?
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your company details and confirm your email to get started.
          </p>
          <Suspense>
            <Show when="signed-out">
              <SignUpButton>
                <button className="mt-4 cursor-pointer rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white">
                  Create account
                </button>
              </SignUpButton>
            </Show>
          </Suspense>
        </section>

        <p className="mt-6 text-center text-sm text-gray-500">OT Crew Builder</p>
      </main>
    </div>
  );
}

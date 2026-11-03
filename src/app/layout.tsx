import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono, Public_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Suspense } from "react";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OT Crew",
  description: "Build your overtime crew from the employees who volunteer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{ cssLayerName: "clerk" }}
          localization={{
            formFieldLabel__emailAddress: "Work email",
            formFieldInputPlaceholder__emailAddress: "name@yourcompany.com",
          }}
        >
          <header className="flex h-16 items-center justify-between border-b border-[#2b3a63] bg-[#14213d] px-8">
            <Link href="/" className="text-lg font-bold text-white">
              OT Crew Builder
            </Link>
            <div className="flex items-center gap-2">
              <Suspense>
                <Show when="signed-out">
                  <SignInButton>
                    <button className="cursor-pointer p-3 text-[15px] text-white">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="min-h-11 cursor-pointer rounded-lg bg-white px-5 text-[15px] font-semibold text-[#14213d]">
                      Create account
                    </button>
                  </SignUpButton>
                </Show>
              </Suspense>
              <Suspense>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </Suspense>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

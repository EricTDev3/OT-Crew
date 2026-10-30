import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
            <Link href="/" className="text-xl font-bold text-blue-900">
              OT Crew
            </Link>
            <div className="flex items-center gap-4">
              <Suspense>
                <Show when="signed-out">
                  <SignInButton>
                    <button className="cursor-pointer font-medium text-blue-900">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="cursor-pointer rounded-lg bg-blue-900 px-5 py-2.5 font-semibold text-white">
                      Sign up
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

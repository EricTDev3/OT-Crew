"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// One link in the header nav. It is a client component only because
// usePathname() needs the browser's current URL to know which link is active.
export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Active on the page itself and on anything under it (/departments/anything).
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-2.5 text-[15px] text-white ${
        active ? "bg-[#2b3a63]" : "hover:bg-[#2b3a63]/60"
      }`}
    >
      {children}
    </Link>
  );
}

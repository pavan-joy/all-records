"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminUsersSectionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const usersActive = pathname === "/admin-users";
  const securityActive = pathname.startsWith("/admin-users/security");

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
      active
        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25"
        : "border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/90"
    }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm">
        <Link href="/admin-users" className={tabClass(usersActive)}>
          <ShieldCheck className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
          Users
        </Link>
        <Link href="/admin-users/security" className={tabClass(securityActive)}>
          <LockKeyhole className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
          Security
        </Link>
      </div>
      {children}
    </div>
  );
}

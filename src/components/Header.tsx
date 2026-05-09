"use client";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data } = useSession();

  return (
    <header className="advanced-panel flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-white/95 via-indigo-50/40 to-cyan-50/40 px-4 py-3 backdrop-blur">
      <div>
        <p className="text-sm text-slate-500">Logged in as</p>
        <p className="font-semibold text-slate-800">{data?.user?.name ?? "Admin"}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/85 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}

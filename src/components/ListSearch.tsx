"use client";

import { Search } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";

export function ListSearchPanel({
  children,
  gridClassName = "gap-4 md:grid-cols-3",
}: {
  children: ReactNode;
  gridClassName?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/50 bg-gradient-to-br from-white via-violet-50/50 to-cyan-50/40 p-5 shadow-[0_14px_44px_-14px_rgba(79,70,229,0.18)]">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-violet-400/25 to-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-48 rounded-full bg-indigo-400/10 blur-2xl" />
      <div className={`relative grid ${gridClassName}`}>{children}</div>
    </div>
  );
}

type ListSearchFieldProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

export function ListSearchField({ value, onChange, placeholder = "", label = "Search", className }: ListSearchFieldProps) {
  return (
    <label className={["group block md:col-span-1", className].filter(Boolean).join(" ")}>
      <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700/90">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_10px_rgba(139,92,246,0.75)]"
          aria-hidden
        />
        {label}
      </span>
      <div className="list-search-ring">
        <div className="relative overflow-hidden rounded-[10px] bg-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-violet-400 transition duration-300 group-focus-within:text-violet-600 group-focus-within:drop-shadow-[0_0_6px_rgba(139,92,246,0.55)]"
            aria-hidden
          />
          <input
            type="search"
            autoComplete="off"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border-0 bg-transparent py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 placeholder:transition placeholder:duration-300 focus:placeholder:text-slate-300"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent opacity-0 transition duration-300 group-focus-within:opacity-100" />
        </div>
      </div>
    </label>
  );
}

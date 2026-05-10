"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BrickWall,
  ChevronDown,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Phone,
  Server,
  Settings2,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: Database },
  { href: "/vendors", label: "Vendors", icon: Users },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/firewalls", label: "Firewalls", icon: BrickWall },
  { href: "/avaya-telephones", label: "Avaya Telephone", icon: Phone },
  { href: "/isp", label: "ISP", icon: Wifi },
  { href: "/csv-upload", label: "CSV Upload", icon: FileSpreadsheet },
  { href: "/admin-users", label: "Admin Users", icon: ShieldCheck },
];

function AdminUsersDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const adminUsersRoot = pathname === "/admin-users";
  const securityActive = pathname.startsWith("/admin-users/security");
  const platformActive = pathname === "/platform-settings" || pathname.startsWith("/platform-settings/");
  const triggerActive = adminUsersRoot || securityActive || platformActive;

  const triggerClass = `group inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
    triggerActive
      ? "border border-amber-400/45 bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-yellow-600/10 text-amber-50 shadow-[0_0_22px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "border border-transparent text-zinc-400 hover:border-zinc-600/60 hover:bg-zinc-800/50 hover:text-amber-100/95"
  }`;

  const itemClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
      active
        ? "bg-amber-500/15 text-amber-100"
        : "text-zinc-300 hover:bg-zinc-800/90 hover:text-amber-50"
    }`;

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <ShieldCheck className={`h-4 w-4 shrink-0 ${triggerActive ? "text-amber-300" : "text-zinc-500 group-hover:text-amber-400/80"}`} />
        Admin users
        <ChevronDown
          className={`h-4 w-4 shrink-0 opacity-80 transition-transform duration-200 ${open ? "rotate-180" : ""} ${triggerActive ? "text-amber-200/90" : "text-zinc-500"}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-[60] flex min-w-[13.5rem] flex-col gap-0.5 rounded-xl border border-zinc-600/70 bg-[#0c0c0e] py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.65)] ring-1 ring-amber-500/15"
        >
          <Link
            href="/admin-users"
            role="menuitem"
            className={`block w-full ${itemClass(adminUsersRoot)}`}
            onClick={() => setOpen(false)}
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400/90" aria-hidden />
            Manage users
          </Link>
          <Link
            href="/admin-users/security"
            role="menuitem"
            className={`block w-full ${itemClass(securityActive)}`}
            onClick={() => setOpen(false)}
          >
            <LockKeyhole className="h-4 w-4 shrink-0 text-amber-400/90" aria-hidden />
            Security
          </Link>
          <Link
            href="/platform-settings"
            role="menuitem"
            className={`block w-full ${itemClass(platformActive)}`}
            onClick={() => setOpen(false)}
          >
            <Settings2 className="h-4 w-4 shrink-0 text-amber-400/90" aria-hidden />
            Platform
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const links = isSuperAdmin ? baseLinks.filter((l) => l.href !== "/admin-users") : baseLinks;

  return (
    <aside className="nav-premium sticky top-0 z-40 w-full border-b border-amber-500/15 bg-[#070708] shadow-[0_12px_48px_rgba(0,0,0,0.75)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent opacity-90"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-zinc-700/20 via-amber-500/25 to-zinc-700/20" />

      <div className="relative mx-auto flex max-w-[1920px] flex-col gap-4 px-4 py-3.5 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6">
        <Link
          href="/dashboard"
          className="group flex w-fit shrink-0 items-center gap-3 rounded-2xl border border-zinc-700/40 bg-zinc-900/40 px-2.5 py-2 pr-4 shadow-inner shadow-black/40 ring-1 ring-amber-500/10 transition hover:border-amber-500/35 hover:ring-amber-400/25"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black ring-1 ring-amber-500/25">
            <Image
              src="/nav-logo.png"
              alt="IT Asset Portal"
              width={44}
              height={44}
              className="object-contain p-1"
              priority
            />
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="bg-gradient-to-r from-zinc-100 via-amber-100 to-amber-200/90 bg-clip-text text-base font-bold tracking-tight text-transparent md:text-lg">
              IT Asset Portal
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 group-hover:text-amber-500/70">
              Enterprise control
            </span>
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
          {/* Dropdown must sit outside the horizontally scrolling nav or overflow-x clips the menu (Platform hidden). */}
          <div className="relative z-50 flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
            <nav
              className="flex max-w-full gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:justify-end md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
              aria-label="Main navigation"
            >
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      active
                        ? "border border-amber-400/45 bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-yellow-600/10 text-amber-50 shadow-[0_0_22px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "border border-transparent text-zinc-400 hover:border-zinc-600/60 hover:bg-zinc-800/50 hover:text-amber-100/95"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${active ? "text-amber-300" : "text-zinc-500 group-hover:text-amber-400/80"}`}
                    />
                    {label}
                  </Link>
                );
              })}
            </nav>
            {isSuperAdmin ? <AdminUsersDropdown pathname={pathname} /> : null}
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-2 text-sm font-medium text-rose-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-rose-400/45 hover:bg-rose-900/55 hover:text-white md:self-auto"
          >
            <LogOut className="h-4 w-4 opacity-90" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

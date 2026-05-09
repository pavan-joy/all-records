"use client";

import { BellRing, Database, Server, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";
import DashboardCard from "@/components/DashboardCard";
import type { DashboardSummary } from "@/lib/dashboardSummary";

type Props = {
  initialSummary: DashboardSummary;
};

export default function DashboardContent({ initialSummary }: Props) {
  const summary = initialSummary;

  const subscriptionHealth = summary.totalSubscriptions
    ? Math.round((summary.activeSubscriptions / summary.totalSubscriptions) * 100)
    : 0;
  const serverHealth = summary.totalServers
    ? Math.round((summary.activeServers / summary.totalServers) * 100)
    : 0;

  const renewalRiskPct = useMemo(
    () =>
      summary.totalSubscriptions
        ? Math.round((summary.expiringSubscriptions / summary.totalSubscriptions) * 100)
        : 0,
    [summary.expiringSubscriptions, summary.totalSubscriptions],
  );

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-r from-slate-950 via-indigo-950 to-cyan-950 bg-[length:240%_240%] p-6 text-white shadow-[0_25px_70px_-22px_rgba(2,6,23,0.9)] animate-[borderShift_15s_ease_infinite]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(34,211,238,0.22),transparent_36%),radial-gradient(circle_at_85%_18%,rgba(139,92,246,0.28),transparent_36%),radial-gradient(circle_at_72%_88%,rgba(245,158,11,0.18),transparent_42%)]" />
        <div className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl animate-[softFloat_7s_ease-in-out_infinite]" />
        <div
          className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl animate-[softFloat_8s_ease-in-out_infinite]"
          style={{ animationDelay: "-2.5s" }}
        />
        <div className="pointer-events-none absolute inset-x-[-20%] top-[-35%] h-[170%] bg-[linear-gradient(112deg,transparent_44%,rgba(165,243,252,0.08)_50%,transparent_56%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-200/10 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200 animate-pulse" />
              Live IT Operations Snapshot
            </p>
            <h1 className="bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
              IT Asset & Subscription Dashboard
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-indigo-100/95">
              Monitor renewals, infrastructure health, and vendor footprint from a single command center.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" aria-hidden />
                Active subscriptions: {summary.activeSubscriptions}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/30 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
                Active servers: {summary.activeServers}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-2.5 py-1 text-xs font-medium text-amber-100">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" aria-hidden />
                Renewal risk: {renewalRiskPct}%
              </span>
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-cyan-200/25 bg-slate-900/35 p-4 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.35)] backdrop-blur-md md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-100/90">Total Managed Items</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
                Live
              </span>
            </div>
            <p className="text-3xl font-extrabold text-white drop-shadow-sm">
              {summary.totalSubscriptions + summary.totalVendors + summary.totalServers}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-cyan-200/20 bg-cyan-300/10 p-2.5 text-center transition hover:-translate-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-cyan-100">Subs</p>
                <p className="mt-1 text-base font-bold text-white">{summary.totalSubscriptions}</p>
              </div>
              <div className="rounded-xl border border-violet-200/20 bg-violet-300/10 p-2.5 text-center transition hover:-translate-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-violet-100">Vendors</p>
                <p className="mt-1 text-base font-bold text-white">{summary.totalVendors}</p>
              </div>
              <div className="rounded-xl border border-emerald-200/20 bg-emerald-300/10 p-2.5 text-center transition hover:-translate-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-emerald-100">Servers</p>
                <p className="mt-1 text-base font-bold text-white">{summary.totalServers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Total subscriptions"
          value={summary.totalSubscriptions}
          subtitle={`${summary.activeSubscriptions} active licenses`}
          icon={<Database className="h-4 w-4" />}
          accentClass="from-indigo-500/15 to-white"
          valueClass="text-indigo-700"
        />
        <DashboardCard
          title="Active subscriptions"
          value={summary.activeSubscriptions}
          subtitle={`${subscriptionHealth}% subscription health`}
          icon={<ShieldCheck className="h-4 w-4" />}
          accentClass="from-emerald-500/15 to-white"
          valueClass="text-emerald-700"
        />
        <DashboardCard
          title="Expiring in 30 days"
          value={summary.expiringSubscriptions}
          subtitle="Prioritize renewal actions"
          icon={<BellRing className="h-4 w-4" />}
          accentClass="from-amber-500/20 to-white"
          valueClass="text-amber-700"
        />
        <DashboardCard
          title="Total vendors"
          value={summary.totalVendors}
          subtitle="Partner ecosystem"
          icon={<Users className="h-4 w-4" />}
          accentClass="from-violet-500/15 to-white"
          valueClass="text-violet-700"
        />
        <DashboardCard
          title="Total servers"
          value={summary.totalServers}
          subtitle={`${summary.activeServers} currently active`}
          icon={<Server className="h-4 w-4" />}
          accentClass="from-sky-500/15 to-white"
          valueClass="text-sky-700"
        />
        <DashboardCard
          title="Active servers"
          value={summary.activeServers}
          subtitle={`${serverHealth}% server health`}
          icon={<Server className="h-4 w-4" />}
          accentClass="from-teal-500/15 to-white"
          valueClass="text-teal-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Operational Health</h2>
          <p className="mb-4 text-sm text-slate-500">Real-time portfolio quality indicators.</p>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Subscription Health</span>
                <span className="font-semibold text-slate-800">{subscriptionHealth}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${subscriptionHealth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Server Health</span>
                <span className="font-semibold text-slate-800">{serverHealth}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  style={{ width: `${serverHealth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Renewal Risk</span>
                <span className="font-semibold text-amber-600">{renewalRiskPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
                  style={{ width: `${renewalRiskPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Action Queue</h2>
          <p className="mb-4 text-sm text-slate-500">Recommended priorities for IT admins.</p>

          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">Renewal Attention</p>
              <p className="text-xs text-amber-700">
                {summary.expiringSubscriptions} subscriptions are nearing renewal in the next 30 days.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-medium text-emerald-800">Infrastructure Status</p>
              <p className="text-xs text-emerald-700">
                {summary.activeServers} active servers are online across your environments.
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-sm font-medium text-indigo-800">Vendor Portfolio</p>
              <p className="text-xs text-indigo-700">
                {summary.totalVendors} vendors currently linked to enterprise services and subscriptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

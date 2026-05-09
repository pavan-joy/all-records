import { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  value: number;
  icon?: ReactNode;
  subtitle?: string;
  accentClass?: string;
  valueClass?: string;
};

export default function DashboardCard({
  title,
  value,
  icon,
  subtitle,
  accentClass = "from-slate-500/10 to-slate-100",
  valueClass = "text-slate-800",
}: DashboardCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br ${accentClass} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className="rounded-xl bg-white/70 p-2 text-slate-700 shadow-sm">{icon}</div>
      </div>
      <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

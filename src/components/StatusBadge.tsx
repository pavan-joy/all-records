export default function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Expired: "bg-rose-100 text-rose-700",
    Cancelled: "bg-slate-100 text-slate-700",
    "Pending Renewal": "bg-amber-100 text-amber-700",
    Inactive: "bg-slate-100 text-slate-700",
    Retired: "bg-zinc-200 text-zinc-700",
    Production: "bg-cyan-100 text-cyan-700",
    Testing: "bg-violet-100 text-violet-700",
    Development: "bg-indigo-100 text-indigo-700",
    SUPER_ADMIN: "bg-fuchsia-100 text-fuchsia-700",
    ADMIN: "bg-blue-100 text-blue-700",
    READ_ONLY: "bg-slate-200 text-slate-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colorMap[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

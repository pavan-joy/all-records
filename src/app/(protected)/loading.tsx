export default function ProtectedLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 md:p-6">
      <div className="h-36 rounded-3xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-slate-100" />
      <div className="h-64 rounded-2xl bg-slate-50" />
    </div>
  );
}

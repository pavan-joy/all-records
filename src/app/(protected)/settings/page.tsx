export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          System settings placeholder. Environment variables drive database and auth configuration. Keep `NEXTAUTH_SECRET` strong in production.
        </p>
      </div>
    </section>
  );
}

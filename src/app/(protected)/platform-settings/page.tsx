"use client";

import { Loader2, Mail, RadioTower, Send, ServerCog, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormInput from "@/components/FormInput";
import FormPrimaryButton from "@/components/FormPrimaryButton";

type SettingsPayload = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPasswordSet: boolean;
  alertsEnabled: boolean;
  alertRecipients: string[];
  subscriptionAlertDays: number;
  firewallAlertDays: number;
  lastExpiryDigestAt?: string;
};

const emptyForm = {
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPassword: "",
  smtpPasswordSet: false,
  alertsEnabled: false,
  alertRecipientsText: "",
  subscriptionAlertDays: 30,
  firewallAlertDays: 30,
  testEmailTo: "",
};

export default function PlatformSettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const extractRecipients = (raw: string) =>
    raw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/platform/settings");
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.message || "Could not load settings");
        return;
      }
      const d = payload.data as SettingsPayload;
      setForm({
        smtpHost: d.smtpHost ?? "",
        smtpPort: d.smtpPort ?? 587,
        smtpSecure: d.smtpSecure ?? false,
        smtpUser: d.smtpUser ?? "",
        smtpPassword: "",
        smtpPasswordSet: d.smtpPasswordSet ?? false,
        alertsEnabled: d.alertsEnabled ?? false,
        alertRecipientsText: (d.alertRecipients || []).join(", "),
        subscriptionAlertDays: d.subscriptionAlertDays ?? 30,
        firewallAlertDays: d.firewallAlertDays ?? 30,
        testEmailTo: d.alertRecipients?.[0] ?? d.smtpUser ?? "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      setLoading(false);
      return;
    }
    if (session.user.role === "SUPER_ADMIN") void load();
    else setLoading(false);
  }, [session, status, load]);

  const save = async () => {
    setSaving(true);
    try {
      const recipients = extractRecipients(form.alertRecipientsText);
      const invalid = recipients.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      if (invalid.length > 0) {
        toast.error(`Invalid email(s): ${invalid.slice(0, 3).join(", ")}`);
        setSaving(false);
        return;
      }

      const body: Record<string, unknown> = {
        smtpHost: form.smtpHost,
        smtpPort: form.smtpPort,
        smtpSecure: form.smtpSecure,
        smtpUser: form.smtpUser,
        alertsEnabled: form.alertsEnabled,
        alertRecipients: recipients,
        subscriptionAlertDays: form.subscriptionAlertDays,
        firewallAlertDays: form.firewallAlertDays,
      };
      if (form.smtpPassword.trim()) body.smtpPassword = form.smtpPassword;

      const response = await fetch("/api/platform/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.message || "Save failed");
        return;
      }
      toast.success("Platform settings saved.");
      setForm((f) => ({ ...f, smtpPassword: "" }));
      await load();
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const inlineRecipients = extractRecipients(form.alertRecipientsText);
      const candidateTo =
        form.testEmailTo.trim() || inlineRecipients[0] || form.smtpUser.trim() || undefined;
      const response = await fetch("/api/platform/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: candidateTo,
          smtpHost: form.smtpHost,
          smtpPort: form.smtpPort,
          smtpSecure: form.smtpSecure,
          smtpUser: form.smtpUser,
          smtpPassword: form.smtpPassword,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.message || "Test send failed");
        return;
      }
      toast.success(`Test email sent to ${payload.data.sentTo}`);
    } finally {
      setTesting(false);
    }
  };

  const runDigest = async () => {
    setRunning(true);
    try {
      const response = await fetch("/api/platform/expiry-alerts/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const payload = await response.json();
      const result = payload.data;
      if (!response.ok) {
        toast.error(payload.message || "Run failed");
        return;
      }
      if (result?.skipped) {
        toast(result.reason || "Skipped", { icon: "ℹ️" });
      } else if (result?.sent) {
        toast.success(result.message || "Digest sent.");
      } else {
        toast(result?.message || "Done", { icon: "ℹ️" });
      }
      await load();
    } finally {
      setRunning(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading platform settings…
      </div>
    );
  }

  if (session?.user?.role !== "SUPER_ADMIN") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Platform settings</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="font-medium">Super Admin access required</p>
          <p className="mt-2 text-sm text-amber-900/90">
            SMTP and expiry alerts can only be managed by a Super Admin. Contact your administrator if you need changes.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-amber-900 underline">
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="relative">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <ShieldAlert className="h-3.5 w-3.5" />
            Super Admin · Platform configuration
          </p>
          <h1 className="text-2xl font-bold md:text-3xl">SMTP & expiry alerts</h1>
          <p className="mt-2 max-w-3xl text-sm text-indigo-100">
            Configure outbound email for automated expiry digests (active subscriptions approaching renewal, firewall license
            expiry). Schedule daily checks via{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">GET /api/cron/expiry-alerts</code> with{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">Authorization: Bearer CRON_SECRET</code>.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">SMTP delivery</h2>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Used for test messages and scheduled expiry digests. Credentials are stored in the database — restrict database
            access in production.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormInput
              label="SMTP host"
              value={form.smtpHost}
              onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
              placeholder="smtp.example.com"
            />
            <FormInput
              label="Port"
              type="number"
              value={String(form.smtpPort)}
              onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) || 587 })}
            />
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.smtpSecure}
              onChange={(e) => setForm({ ...form, smtpSecure: e.target.checked })}
              className="rounded border-slate-300"
            />
            Use TLS (secure) — typical for port 465
          </label>
          <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs leading-relaxed text-indigo-900">
            <p className="font-semibold">Gmail / Google Workspace recommended settings</p>
            <p className="mt-1">
              Host: <code className="rounded bg-white/80 px-1">smtp.gmail.com</code> (no http/https), Port:{" "}
              <code className="rounded bg-white/80 px-1">587</code> with secure off (STARTTLS) or{" "}
              <code className="rounded bg-white/80 px-1">465</code> with secure on.
            </p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FormInput
              label="Username (optional)"
              value={form.smtpUser}
              onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
              autoComplete="off"
            />
            <FormInput
              label={form.smtpPasswordSet ? "Password (leave blank to keep)" : "Password"}
              type="password"
              value={form.smtpPassword}
              onChange={(e) => setForm({ ...form, smtpPassword: e.target.value })}
              autoComplete="new-password"
              placeholder={form.smtpPasswordSet ? "••••••••" : ""}
            />
          </div>
          <div className="mt-3">
            <FormInput
              label="Test email address"
              type="email"
              value={form.testEmailTo}
              onChange={(e) => setForm({ ...form, testEmailTo: e.target.value })}
              placeholder="alerts@company.com"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sendTest}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-indigo-600" />}
              Send test email
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <RadioTower className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Expiry alerts</h2>
          </div>
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={form.alertsEnabled}
              onChange={(e) => setForm({ ...form, alertsEnabled: e.target.checked })}
              className="rounded border-slate-300"
            />
            Enable automated expiry digest emails
          </label>
          <label className="block text-sm text-slate-600">
            <span className="mb-1 block font-medium text-slate-700">Alert recipients (comma-separated)</span>
            <textarea
              value={form.alertRecipientsText}
              onChange={(e) => setForm({ ...form, alertRecipientsText: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="ops@company.com, admin@company.com"
            />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FormInput
              label="Subscription window (days)"
              type="number"
              value={String(form.subscriptionAlertDays)}
              onChange={(e) => setForm({ ...form, subscriptionAlertDays: Number(e.target.value) || 30 })}
            />
            <FormInput
              label="Firewall window (days)"
              type="number"
              value={String(form.firewallAlertDays)}
              onChange={(e) => setForm({ ...form, firewallAlertDays: Number(e.target.value) || 30 })}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            <ServerCog className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
            Active subscriptions with renewal on or before the horizon are included (including overdue renewals). Firewalls
            with expiry on or before the firewall horizon are included.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runDigest}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:opacity-60"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Run expiry digest now
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <FormPrimaryButton type="button" onClick={save} disabled={saving} className="min-w-[12rem] justify-center">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save all settings
        </FormPrimaryButton>
        <p className="text-xs text-slate-500">SMTP, recipients, and alert windows are saved together.</p>
      </div>
    </section>
  );
}

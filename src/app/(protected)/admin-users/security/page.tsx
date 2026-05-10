"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { KeyRound, LockKeyhole, ShieldCheck, Sparkles, Users } from "lucide-react";
import DataTable from "@/components/DataTable";
import FormInput from "@/components/FormInput";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import StatusBadge from "@/components/StatusBadge";
import { ListSearchField, ListSearchPanel } from "@/components/ListSearch";

type TwoFaStatus = {
  twoFactorEnabled: boolean;
  pendingEnrollment: boolean;
};

type AdminRow = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
  status: "Active" | "Inactive";
  twoFactorEnabled?: boolean;
};

type ProvisionPayload = {
  email: string;
  name: string;
  otpauthUrl: string;
  secretBase32: string;
};

export default function AdminSecurityPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const [twoFaStatus, setTwoFaStatus] = useState<TwoFaStatus | null>(null);
  const [setupPayload, setSetupPayload] = useState<{ otpauthUrl: string; secretBase32: string } | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [busy, setBusy] = useState(false);

  const [disablePassword, setDisablePassword] = useState("");
  const [disableTotp, setDisableTotp] = useState("");
  const [showDisable, setShowDisable] = useState(false);

  const [orgUsers, setOrgUsers] = useState<AdminRow[]>([]);
  const [search, setSearch] = useState("");
  const [provisionOpen, setProvisionOpen] = useState<ProvisionPayload | null>(null);

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/me/2fa/status");
    if (!response.ok) return;
    const payload = await response.json();
    const enabled = Boolean(payload.twoFactorEnabled);
    const pending = Boolean(payload.pendingEnrollment);
    setTwoFaStatus({
      twoFactorEnabled: enabled,
      pendingEnrollment: pending,
    });
    if (enabled) {
      setSetupPayload(null);
    } else if (pending && payload.otpauthUrl && payload.secretBase32) {
      setSetupPayload({ otpauthUrl: payload.otpauthUrl, secretBase32: payload.secretBase32 });
    } else {
      setSetupPayload(null);
    }
  }, []);

  const loadOrgUsers = useCallback(async () => {
    if (!isSuperAdmin) return;
    const response = await fetch("/api/admin-users");
    const payload = await response.json();
    setOrgUsers(payload.data ?? []);
  }, [isSuperAdmin]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrgUsers();
  }, [loadOrgUsers]);

  const startSetup = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/me/2fa/setup", { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(typeof payload.message === "string" ? payload.message : "Could not start setup");
        return;
      }
      setSetupPayload({ otpauthUrl: payload.otpauthUrl, secretBase32: payload.secretBase32 });
      setEnrollCode("");
      await loadStatus();
      toast.success("Scan the QR code with your authenticator app.");
    } finally {
      setBusy(false);
    }
  };

  const verifyEnrollment = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = enrollCode.trim().replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/me/2fa/verify-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(typeof payload.message === "string" ? payload.message : "Verification failed");
        return;
      }
      toast.success("Two-factor authentication is enabled.");
      setSetupPayload(null);
      setEnrollCode("");
      await loadStatus();
    } finally {
      setBusy(false);
    }
  };

  const submitDisable = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const body: { password: string; totp?: string } = { password: disablePassword };
      const totp = disableTotp.trim().replace(/\s/g, "");
      if (twoFaStatus?.twoFactorEnabled) {
        if (!/^\d{6}$/.test(totp)) {
          toast.error("Enter your current 6-digit authenticator code.");
          return;
        }
        body.totp = totp;
      }
      const response = await fetch("/api/me/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(typeof payload.message === "string" ? payload.message : "Could not disable 2FA");
        return;
      }
      toast.success(
        twoFaStatus?.twoFactorEnabled ? "Two-factor authentication is turned off." : "Authenticator enrollment cancelled.",
      );
      setShowDisable(false);
      setDisablePassword("");
      setDisableTotp("");
      setSetupPayload(null);
      await loadStatus();
    } finally {
      setBusy(false);
    }
  };

  const resetUser2fa = async (id: string) => {
    const response = await fetch(`/api/admin-users/${id}/2fa`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(typeof payload.message === "string" ? payload.message : "Reset failed");
      return;
    }
    toast.success(typeof payload.message === "string" ? payload.message : "2FA cleared.");
    await loadOrgUsers();
  };

  const provisionUser2fa = async (id: string) => {
    const response = await fetch(`/api/admin-users/${id}/2fa`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "provision" }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(typeof payload.message === "string" ? payload.message : "Provision failed");
      return;
    }
    setProvisionOpen({
      email: payload.email,
      name: payload.name,
      otpauthUrl: payload.otpauthUrl,
      secretBase32: payload.secretBase32,
    });
    await loadOrgUsers();
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  const selfStatusLabel =
    twoFaStatus?.twoFactorEnabled === true
      ? "On"
      : twoFaStatus?.pendingEnrollment
        ? "Setup pending"
        : "Off";

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-slate-800 via-indigo-900 to-violet-900 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Security
            </p>
            <h1 className="text-2xl font-bold md:text-3xl">Authenticator &amp; 2FA</h1>
            <p className="mt-2 max-w-xl text-sm text-indigo-100">
              Use an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, etc.). Super admins can
              provision or reset 2FA for other operators.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div className="text-left text-sm">
              <p className="font-semibold">Your 2FA</p>
              <p className="text-xs text-indigo-100">{selfStatusLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="advanced-panel rounded-2xl p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Your account</p>
            <p className="text-xs text-slate-500">
              {twoFaStatus?.twoFactorEnabled
                ? "Sign-in requires your password and a time-based code."
                : twoFaStatus?.pendingEnrollment
                  ? "Finish enrollment with the code from your app."
                  : "Protect your account with a second factor."}
            </p>
          </div>
        </div>

        {twoFaStatus && !twoFaStatus.twoFactorEnabled && !setupPayload ? (
          <div className="flex flex-wrap gap-3">
            <FormPrimaryButton type="button" disabled={busy} onClick={() => void startSetup()} className="px-4 py-2 text-sm">
              <KeyRound className="h-4 w-4" />
              Start authenticator setup
            </FormPrimaryButton>
          </div>
        ) : null}

        {setupPayload ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-800">Scan this QR code</p>
            <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="rounded-xl border border-white bg-white p-2 shadow-sm">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupPayload.otpauthUrl)}`}
                  alt="Authenticator QR"
                  width={180}
                  height={180}
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-sm text-slate-600">
                <p>
                  Can&apos;t scan? Enter this secret manually:{" "}
                  <code className="break-all rounded bg-white px-2 py-1 font-mono text-xs text-slate-800">
                    {setupPayload?.secretBase32}
                  </code>
                </p>
                <button
                  type="button"
                  className="font-medium text-violet-700 underline-offset-2 hover:underline"
                  onClick={() => copyText(setupPayload?.secretBase32 ?? "", "Secret")}
                >
                  Copy secret
                </button>
              </div>
            </div>
            <form onSubmit={verifyEnrollment} className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[12rem] flex-1">
                <FormInput
                  label="6-digit code"
                  value={enrollCode}
                  onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <FormPrimaryButton type="submit" disabled={busy} className="px-5 py-2.5 text-sm">
                Confirm enrollment
              </FormPrimaryButton>
            </form>
          </div>
        ) : null}

        {twoFaStatus?.twoFactorEnabled || setupPayload ? (
          <div className="mt-4">
            {!showDisable ? (
              <button
                type="button"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                onClick={() => setShowDisable(true)}
              >
                {twoFaStatus?.twoFactorEnabled ? "Turn off 2FA" : "Cancel enrollment"}
              </button>
            ) : (
              <form onSubmit={submitDisable} className="max-w-md space-y-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                <p className="text-sm text-rose-950">
                  {twoFaStatus?.twoFactorEnabled
                    ? "Confirm your password and current authenticator code."
                    : "Enter your password to cancel this enrollment."}
                </p>
                <FormInput
                  label="Password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                {twoFaStatus?.twoFactorEnabled ? (
                  <FormInput
                    label="Authenticator code"
                    value={disableTotp}
                    onChange={(e) => setDisableTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                ) : null}
                <div className="flex gap-2">
                  <FormPrimaryButton type="submit" disabled={busy} className="py-2 text-sm">
                    {twoFaStatus?.twoFactorEnabled ? "Turn off 2FA" : "Cancel setup"}
                  </FormPrimaryButton>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    onClick={() => {
                      setShowDisable(false);
                      setDisablePassword("");
                      setDisableTotp("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </div>

      {isSuperAdmin ? (
        <>
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-500/10 to-white p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-600" />
              <p className="font-semibold text-violet-950">Organization — two-factor controls</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Reset clears 2FA immediately. Provision generates a new QR and secret for an operator to finish under{" "}
              <strong>Security</strong> on their account.
            </p>
          </div>

          <ListSearchPanel>
            <ListSearchField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" />
          </ListSearchPanel>

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <DataTable
              data={orgUsers}
              searchValue={search}
              searchKeys={["name", "email"]}
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "role", label: "Role", render: (row) => <StatusBadge status={row.role} /> },
                {
                  key: "twoFactorEnabled",
                  label: "2FA",
                  render: (row) => (
                    <span className="text-xs font-medium text-slate-700">
                      {row.twoFactorEnabled ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">On</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">Off</span>
                      )}
                    </span>
                  ),
                },
                {
                  key: "_id",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-900 hover:bg-violet-100"
                        onClick={() => void provisionUser2fa(row._id)}
                      >
                        Provision QR
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-950 hover:bg-amber-100"
                        onClick={() => void resetUser2fa(row._id)}
                      >
                        Reset 2FA
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      ) : null}

      {provisionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="advanced-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Provision {provisionOpen.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{provisionOpen.email}</p>
            <p className="mt-3 text-sm text-slate-600">
              Share this QR or secret securely. They must open <strong>Admin users → Security</strong> and enter a 6-digit
              code to finish enrollment before sign-in requires 2FA.
            </p>
            <div className="mt-4 flex justify-center rounded-xl border border-slate-200 bg-white p-3">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(provisionOpen.otpauthUrl)}`}
                alt="QR"
                width={200}
                height={200}
                unoptimized
              />
            </div>
            <p className="mt-3 break-all font-mono text-xs text-slate-700">{provisionOpen.secretBase32}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                onClick={() => copyText(provisionOpen.secretBase32, "Secret")}
              >
                Copy secret
              </button>
              <button
                type="button"
                className="rounded-xl bg-violet-600 px-3 py-2 text-sm text-white"
                onClick={() => setProvisionOpen(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

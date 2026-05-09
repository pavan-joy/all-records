"use client";

import { BrickWall, Download, PlusCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable from "@/components/DataTable";
import { ListSearchField, ListSearchPanel } from "@/components/ListSearch";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

type FirewallRecord = {
  _id: string;
  county: string;
  branch: string;
  wanIp?: string;
  lanIp?: string;
  serialNumber?: string;
  expiryDate?: string | Date;
  firmwareVersion?: string;
  vendor?: string;
  backup?: "Yes" | "No" | "Not Required";
  lastCheckedDate?: string | Date;
};

type FirewallForm = {
  county: string;
  branch: string;
  wanIp: string;
  lanIp: string;
  serialNumber: string;
  expiryDate: string;
  firmwareVersion: string;
  vendor: string;
  backup: "Yes" | "No" | "Not Required";
  lastCheckedDate: string;
};

const emptyForm: FirewallForm = {
  county: "",
  branch: "",
  wanIp: "",
  lanIp: "",
  serialNumber: "",
  expiryDate: "",
  firmwareVersion: "",
  vendor: "",
  backup: "Not Required",
  lastCheckedDate: "",
};

function dateInputValue(value: string | Date | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatDate(value: string | Date | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formPayload(form: FirewallForm) {
  return {
    county: form.county,
    branch: form.branch,
    wanIp: form.wanIp || undefined,
    lanIp: form.lanIp || undefined,
    serialNumber: form.serialNumber || undefined,
    expiryDate: form.expiryDate || undefined,
    firmwareVersion: form.firmwareVersion || undefined,
    vendor: form.vendor || undefined,
    backup: form.backup,
    lastCheckedDate: form.lastCheckedDate || undefined,
  };
}

export default function FirewallsPage() {
  const [records, setRecords] = useState<FirewallRecord[]>([]);
  const [form, setForm] = useState<FirewallForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    const response = await fetch(`/api/firewalls?${params.toString()}`);
    const payload = await response.json();
    setRecords(payload.data ?? []);
  }, [debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/firewalls/${editingId}` : "/api/firewalls", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload(form)),
    });
    if (!response.ok) return toast.error("Failed to save firewall");
    toast.success(editingId ? "Firewall updated" : "Firewall added");
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/firewalls/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Failed to delete firewall");
    toast.success("Firewall deleted");
    setDeleteId(null);
    load();
  };

  const stats = useMemo(() => {
    const total = records.length;
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const expiringSoon = records.filter((r) => {
      if (!r.expiryDate) return false;
      const ex = new Date(r.expiryDate);
      return !Number.isNaN(ex.getTime()) && ex >= now && ex <= in30;
    }).length;
    const backupYes = records.filter((r) => r.backup === "Yes").length;
    const staleDays = 90;
    const staleCutoff = new Date(now);
    staleCutoff.setDate(staleCutoff.getDate() - staleDays);
    const needsCheck = records.filter((r) => {
      if (!r.lastCheckedDate) return true;
      const c = new Date(r.lastCheckedDate);
      return Number.isNaN(c.getTime()) || c < staleCutoff;
    }).length;
    return { total, expiringSoon, backupYes, needsCheck };
  }, [records]);

  return (
    <section className="space-y-5">
      <div className="firewall-hero-shell">
        <div className="firewall-hero-inner px-6 py-7 text-white md:px-8 md:py-8">
          <div className="firewall-hero-orb -left-16 -top-24 h-56 w-56 bg-orange-500/44" />
          <div
            className="firewall-hero-orb -bottom-28 -right-12 h-52 w-52 bg-rose-500/36"
            style={{ animationDelay: "-4s" }}
          />
          <div className="firewall-hero-beam" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/35 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-orange-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Network perimeter
              </p>
              <h1 className="bg-gradient-to-br from-white via-orange-100 to-indigo-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                Firewall Inventory
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
                Track counties, branches, IPs, firmware, vendors, backups, and compliance dates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open("/api/csv-upload/export/firewalls", "_blank")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-orange-400/35 bg-gradient-to-r from-white/12 to-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_36px_-8px_rgba(249,115,22,0.38)] backdrop-blur-md transition hover:border-amber-300/50 hover:from-white/18 hover:shadow-[0_14px_44px_-6px_rgba(244,63,94,0.35)]"
            >
              <Download className="h-4 w-4 text-orange-200 transition group-hover:translate-y-0.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-600">Total firewalls</p>
          <p className="mt-1 text-3xl font-bold text-orange-800">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Expiring ≤ 30 days</p>
          <p className="mt-1 text-3xl font-bold text-amber-800">{stats.expiringSoon}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Backup enabled</p>
          <p className="mt-1 text-3xl font-bold text-emerald-800">{stats.backupYes}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">Stale check (90d+)</p>
          <p className="mt-1 text-3xl font-bold text-violet-900">{stats.needsCheck}</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BrickWall className="h-4 w-4 text-orange-600" />
          <p className="text-sm font-semibold text-slate-800">{editingId ? "Update Firewall" : "Create Firewall"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormInput
            label="County"
            value={form.county}
            onChange={(e) => setForm({ ...form, county: e.target.value })}
            required
          />
          <FormInput
            label="Branch"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            required
          />
          <FormInput
            label="WAN IP"
            value={form.wanIp}
            onChange={(e) => setForm({ ...form, wanIp: e.target.value })}
          />
          <FormInput
            label="LAN IP"
            value={form.lanIp}
            onChange={(e) => setForm({ ...form, lanIp: e.target.value })}
          />
          <FormInput
            label="Serial number"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
          />
          <FormInput
            label="Expiry date"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
          <FormInput
            label="Firmware version"
            value={form.firmwareVersion}
            onChange={(e) => setForm({ ...form, firmwareVersion: e.target.value })}
          />
          <FormInput label="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          <FormSelect
            label="Backup"
            value={form.backup}
            onChange={(e) => setForm({ ...form, backup: e.target.value as FirewallForm["backup"] })}
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
              { label: "Not required", value: "Not Required" },
            ]}
          />
          <FormInput
            label="Last checked date"
            type="date"
            value={form.lastCheckedDate}
            onChange={(e) => setForm({ ...form, lastCheckedDate: e.target.value })}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FormPrimaryButton type="submit">
            <PlusCircle className="h-4 w-4" />
            {editingId ? "Update Firewall" : "Add Firewall"}
          </FormPrimaryButton>
          {editingId ? (
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      <ListSearchPanel gridClassName="gap-4 md:grid-cols-1 max-w-2xl">
        <ListSearchField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="County, branch, IP, serial, vendor..."
        />
      </ListSearchPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <DataTable
          data={records}
          searchValue={search}
          searchKeys={["county", "branch", "wanIp", "lanIp", "serialNumber", "vendor"]}
          columns={[
            { key: "county", label: "County" },
            { key: "branch", label: "Branch" },
            {
              key: "wanIp",
              label: "WAN IP",
              render: (row) => <span className="font-mono text-xs text-slate-700">{row.wanIp ?? "—"}</span>,
            },
            {
              key: "lanIp",
              label: "LAN IP",
              render: (row) => <span className="font-mono text-xs text-slate-700">{row.lanIp ?? "—"}</span>,
            },
            {
              key: "serialNumber",
              label: "Serial",
              render: (row) => (
                <span className="max-w-[8rem] truncate font-mono text-xs text-slate-700" title={row.serialNumber}>
                  {row.serialNumber ?? "—"}
                </span>
              ),
            },
            {
              key: "expiryDate",
              label: "Expiry",
              render: (row) => <span className="whitespace-nowrap text-slate-600">{formatDate(row.expiryDate)}</span>,
            },
            {
              key: "firmwareVersion",
              label: "Firmware",
              render: (row) => (
                <span className="max-w-[6rem] truncate text-slate-700" title={row.firmwareVersion}>
                  {row.firmwareVersion ?? "—"}
                </span>
              ),
            },
            {
              key: "vendor",
              label: "Vendor",
              render: (row) => (
                <span className="max-w-[8rem] truncate text-slate-700" title={row.vendor}>
                  {row.vendor ?? "—"}
                </span>
              ),
            },
            {
              key: "backup",
              label: "Backup",
              render: (row) => <span className="text-slate-600">{row.backup ?? "Not Required"}</span>,
            },
            {
              key: "lastCheckedDate",
              label: "Last checked",
              render: (row) => (
                <span className="whitespace-nowrap text-slate-600">{formatDate(row.lastCheckedDate)}</span>
              ),
            },
            {
              key: "_id",
              label: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setForm({
                        county: row.county,
                        branch: row.branch,
                        wanIp: row.wanIp || "",
                        lanIp: row.lanIp || "",
                        serialNumber: row.serialNumber || "",
                        expiryDate: dateInputValue(row.expiryDate),
                        firmwareVersion: row.firmwareVersion || "",
                        vendor: row.vendor || "",
                        backup: row.backup ?? "Not Required",
                        lastCheckedDate: dateInputValue(row.lastCheckedDate),
                      });
                      setEditingId(row._id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    onClick={() => setDeleteId(row._id)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Firewall"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}

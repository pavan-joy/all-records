"use client";

import { Download, PlusCircle, ServerCog, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable from "@/components/DataTable";
import { ListSearchField, ListSearchPanel } from "@/components/ListSearch";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import StatusBadge from "@/components/StatusBadge";

type ServerRecord = {
  _id: string;
  serverName: string;
  ipAddress?: string;
  hostname?: string;
  siemEnabled?: boolean;
  indefent?: boolean;
  dlpEnabled?: boolean;
  serverType?: "Physical" | "Virtual" | "Cloud";
  iloIp?: string;
  location?: string;
  notes?: string;
  veeamStatus?: "Enabled" | "Disabled" | "Not Required";
  pam?: "Yes" | "No" | "Not Required";
  lastSystemCheckDate?: string | Date;
  environment: "Production" | "Testing" | "Development";
  status: "Active" | "Inactive" | "Retired";
};

type ServerForm = {
  serverName: string;
  ipAddress: string;
  hostname: string;
  siemEnabled: string;
  indefent: string;
  dlpEnabled: string;
  serverType: "Physical" | "Virtual" | "Cloud";
  iloIp: string;
  location: string;
  remarks: string;
  pam: "Yes" | "No" | "Not Required";
  veeamStatus: "Enabled" | "Disabled" | "Not Required";
  lastSystemCheckDate: string;
  environment: "Production" | "Testing" | "Development";
  status: "Active" | "Inactive" | "Retired";
};

const emptyForm: ServerForm = {
  serverName: "",
  ipAddress: "",
  hostname: "",
  siemEnabled: "false",
  indefent: "false",
  dlpEnabled: "false",
  serverType: "Physical",
  iloIp: "",
  location: "",
  remarks: "",
  pam: "Not Required",
  veeamStatus: "Not Required",
  lastSystemCheckDate: "",
  environment: "Production",
  status: "Active",
};

function dateInputValue(value: string | Date | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatCheckDate(value: string | Date | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formPayload(form: ServerForm) {
  return {
    serverName: form.serverName,
    ipAddress: form.ipAddress || undefined,
    hostname: form.hostname || undefined,
    siemEnabled: form.siemEnabled === "true",
    indefent: form.indefent === "true",
    dlpEnabled: form.dlpEnabled === "true",
    serverType: form.serverType,
    iloIp: form.iloIp || undefined,
    location: form.location || undefined,
    notes: form.remarks || undefined,
    pam: form.pam,
    veeamStatus: form.veeamStatus,
    lastSystemCheckDate: form.lastSystemCheckDate || undefined,
    environment: form.environment,
    status: form.status,
  };
}

function boolSelect(value: boolean | undefined) {
  return value ? "true" : "false";
}

export default function ServersPage() {
  const [records, setRecords] = useState<ServerRecord[]>([]);
  const [form, setForm] = useState<ServerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [status, setStatus] = useState("");
  const [environment, setEnvironment] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    if (environment) params.set("environment", environment);
    const response = await fetch(`/api/servers?${params.toString()}`);
    const payload = await response.json();
    setRecords(payload.data ?? []);
  }, [debouncedSearch, status, environment]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/servers/${editingId}` : "/api/servers", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload(form)),
    });
    if (!response.ok) return toast.error("Failed to save server");
    toast.success(editingId ? "Server updated" : "Server added");
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/servers/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Failed to delete server");
    toast.success("Server deleted");
    setDeleteId(null);
    load();
  };

  const stats = useMemo(() => {
    const total = records.length;
    const active = records.filter((record) => record.status === "Active").length;
    const production = records.filter((record) => record.environment === "Production").length;
    const retired = records.filter((record) => record.status === "Retired").length;
    return { total, active, production, retired };
  }, [records]);

  return (
    <section className="space-y-5">
      <div className="server-hero-shell">
        <div className="server-hero-inner px-6 py-7 text-white md:px-8 md:py-8">
          <div className="server-hero-orb -left-16 -top-28 h-60 w-60 bg-cyan-400/42" />
          <div
            className="server-hero-orb -bottom-28 -right-14 h-56 w-56 bg-indigo-500/38"
            style={{ animationDelay: "-3.8s" }}
          />
          <div className="server-hero-beam" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Infrastructure Control Deck
              </p>
              <h1 className="bg-gradient-to-br from-white via-cyan-100 to-indigo-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                Server Information Management
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
                Track environments, runtime status, and server lifecycle from a single advanced panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open("/api/csv-upload/export/servers", "_blank")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-400/35 bg-gradient-to-r from-white/12 to-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_36px_-8px_rgba(34,211,238,0.35)] backdrop-blur-md transition hover:border-cyan-300/55 hover:from-white/18 hover:shadow-[0_14px_44px_-6px_rgba(99,102,241,0.38)]"
            >
              <Download className="h-4 w-4 text-cyan-200 transition group-hover:translate-y-0.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-500">Total Servers</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">Active</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-500">Production</p>
          <p className="mt-1 text-3xl font-bold text-violet-700">{stats.production}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Retired</p>
          <p className="mt-1 text-3xl font-bold text-slate-700">{stats.retired}</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ServerCog className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-800">{editingId ? "Update Server" : "Create Server"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormInput
            label="Server Name"
            value={form.serverName}
            onChange={(e) => setForm({ ...form, serverName: e.target.value })}
            required
          />
          <FormInput
            label="Host Name"
            value={form.hostname}
            onChange={(e) => setForm({ ...form, hostname: e.target.value })}
          />
          <FormInput
            label="IP Address"
            value={form.ipAddress}
            onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
          />
          <FormInput
            label="ILO IP"
            value={form.iloIp}
            onChange={(e) => setForm({ ...form, iloIp: e.target.value })}
          />
          <FormSelect
            label="SIEM"
            value={form.siemEnabled}
            onChange={(e) => setForm({ ...form, siemEnabled: e.target.value })}
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
          />
          <FormSelect
            label="Indefent"
            value={form.indefent}
            onChange={(e) => setForm({ ...form, indefent: e.target.value })}
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
          />
          <FormSelect
            label="DLP"
            value={form.dlpEnabled}
            onChange={(e) => setForm({ ...form, dlpEnabled: e.target.value })}
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
          />
          <FormSelect
            label="PAM"
            value={form.pam}
            onChange={(e) => setForm({ ...form, pam: e.target.value as ServerForm["pam"] })}
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
              { label: "Not required", value: "Not Required" },
            ]}
          />
          <FormSelect
            label="Server type"
            value={form.serverType}
            onChange={(e) =>
              setForm({
                ...form,
                serverType: e.target.value as ServerForm["serverType"],
              })
            }
            options={[
              { label: "Physical", value: "Physical" },
              { label: "Virtual", value: "Virtual" },
              { label: "Cloud", value: "Cloud" },
            ]}
          />
          <FormSelect
            label="Environment"
            value={form.environment}
            onChange={(e) => setForm({ ...form, environment: e.target.value as ServerForm["environment"] })}
            options={[
              { label: "Production", value: "Production" },
              { label: "Testing", value: "Testing" },
              { label: "Development", value: "Development" },
            ]}
          />
          <FormSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ServerForm["status"] })}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
              { label: "Retired", value: "Retired" },
            ]}
          />
          <FormInput
            label="Region / Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <FormSelect
            label="Veeam"
            value={form.veeamStatus}
            onChange={(e) => setForm({ ...form, veeamStatus: e.target.value as ServerForm["veeamStatus"] })}
            options={[
              { label: "Enabled", value: "Enabled" },
              { label: "Disabled", value: "Disabled" },
              { label: "Not required", value: "Not Required" },
            ]}
          />
          <FormInput
            label="Last system check date"
            type="date"
            value={form.lastSystemCheckDate}
            onChange={(e) => setForm({ ...form, lastSystemCheckDate: e.target.value })}
          />
          <label className="md:col-span-2 lg:col-span-4 block space-y-1">
            <span className="text-sm text-slate-600">Remarks</span>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Optional notes about this server..."
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FormPrimaryButton type="submit">
            <PlusCircle className="h-4 w-4" />
            {editingId ? "Update Server" : "Add Server"}
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

      <ListSearchPanel>
        <ListSearchField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, host, IP, or ILO"
        />
        <FormSelect
          label="Filter by Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: "All", value: "" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
            { label: "Retired", value: "Retired" },
          ]}
        />
        <FormSelect
          label="Filter by Environment"
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          options={[
            { label: "All", value: "" },
            { label: "Production", value: "Production" },
            { label: "Testing", value: "Testing" },
            { label: "Development", value: "Development" },
          ]}
        />
      </ListSearchPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <DataTable
          data={records}
          searchValue={search}
          searchKeys={["serverName", "hostname", "ipAddress", "iloIp", "location", "pam"]}
          columns={[
            { key: "serverName", label: "Server Name" },
            { key: "hostname", label: "Host Name" },
            { key: "ipAddress", label: "IP Address" },
            {
              key: "location",
              label: "Region / Location",
              render: (row) => (
                <span className="max-w-[10rem] truncate text-slate-700" title={row.location}>
                  {row.location ?? "—"}
                </span>
              ),
            },
            {
              key: "serverType",
              label: "Type",
              render: (row) => <span className="text-slate-700">{row.serverType ?? "—"}</span>,
            },
            {
              key: "siemEnabled",
              label: "SIEM",
              render: (row) => (
                <span className="text-slate-600">{row.siemEnabled ? "Yes" : "No"}</span>
              ),
            },
            {
              key: "pam",
              label: "PAM",
              render: (row) => <span className="text-slate-600">{row.pam ?? "Not Required"}</span>,
            },
            {
              key: "veeamStatus",
              label: "Veeam",
              render: (row) => (
                <span className="text-slate-600">{row.veeamStatus ?? "Not Required"}</span>
              ),
            },
            {
              key: "lastSystemCheckDate",
              label: "Last check",
              render: (row) => (
                <span className="whitespace-nowrap text-slate-600">{formatCheckDate(row.lastSystemCheckDate)}</span>
              ),
            },
            { key: "environment", label: "Environment", render: (row) => <StatusBadge status={row.environment} /> },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "_id",
              label: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setForm({
                        serverName: row.serverName,
                        ipAddress: row.ipAddress || "",
                        hostname: row.hostname || "",
                        siemEnabled: boolSelect(row.siemEnabled),
                        indefent: boolSelect(row.indefent),
                        dlpEnabled: boolSelect(row.dlpEnabled),
                        serverType: row.serverType ?? "Physical",
                        iloIp: row.iloIp || "",
                        location: row.location || "",
                        remarks: row.notes || "",
                        pam: row.pam ?? "Not Required",
                        veeamStatus: row.veeamStatus ?? "Not Required",
                        lastSystemCheckDate: dateInputValue(row.lastSystemCheckDate),
                        environment: row.environment,
                        status: row.status,
                      });
                      setEditingId(row._id);
                    }}
                  >
                    Edit
                  </button>
                  <button
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
        title="Delete Server"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}

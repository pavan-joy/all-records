"use client";

import { Download, PlusCircle, Sparkles, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable from "@/components/DataTable";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import FormInput from "@/components/FormInput";
import { ListSearchField, ListSearchPanel } from "@/components/ListSearch";
import FormSelect from "@/components/FormSelect";
import StatusBadge from "@/components/StatusBadge";

type VendorOption = { _id: string; name: string };
type Subscription = {
  _id: string;
  name: string;
  vendorId: { _id: string; name: string } | string;
  startDate?: string;
  cost?: number;
  paymentFrequency?: "Monthly" | "Yearly" | "Weekly";
  autoRenewEnabled?: boolean;
  renewalDate?: string;
  status: "Active" | "Expired" | "Cancelled" | "Pending Renewal";
};

const emptyForm = {
  name: "",
  vendorId: "",
  startDate: "",
  cost: "",
  paymentFrequency: "Monthly",
  autoRenewEnabled: "false",
  renewalDate: "",
  status: "Active",
  category: "",
  licenseType: "",
};

export default function SubscriptionsPage() {
  const [records, setRecords] = useState<Subscription[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    const response = await fetch(`/api/subscriptions?${params.toString()}`);
    const payload = await response.json();
    setRecords(payload.data ?? []);
  }, [debouncedSearch, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/vendors", { signal: ac.signal })
      .then((response) => response.json())
      .then((payload) => setVendors(payload.data ?? []))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/subscriptions/${editingId}` : "/api/subscriptions", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) return toast.error("Failed to save subscription");
    toast.success(editingId ? "Subscription updated" : "Subscription added");
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/subscriptions/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Failed to delete subscription");
    toast.success("Subscription deleted");
    setDeleteId(null);
    load();
  };

  const within30Days = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + 30);
    return (date?: string) => (date ? new Date(date) <= limit && new Date(date) >= now : false);
  }, []);

  const stats = useMemo(() => {
    const total = records.length;
    const active = records.filter((record) => record.status === "Active").length;
    const expiring = records.filter((record) => within30Days(record.renewalDate)).length;
    const pending = records.filter((record) => record.status === "Pending Renewal").length;

    return { total, active, expiring, pending };
  }, [records, within30Days]);

  return (
    <section className="space-y-5">
      <div className="subscription-hero-shell">
        <div className="subscription-hero-inner px-6 py-7 text-white md:px-8 md:py-8">
          <div className="subscription-hero-orb -left-16 -top-24 h-56 w-56 bg-violet-500/40" />
          <div
            className="subscription-hero-orb -bottom-28 -right-12 h-52 w-52 bg-cyan-400/35"
            style={{ animationDelay: "-3.5s" }}
          />
          <div className="subscription-hero-beam" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Smart Subscription Command Center
              </p>
              <h1 className="bg-gradient-to-br from-white via-violet-100 to-cyan-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                Subscription Management
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
                Track renewals, license lifecycle, and vendor-linked subscriptions from one elevated workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open("/api/csv-upload/export/subscriptions", "_blank")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-400/35 bg-gradient-to-r from-white/12 to-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_36px_-8px_rgba(34,211,238,0.35)] backdrop-blur-md transition hover:border-cyan-300/55 hover:from-white/18 hover:shadow-[0_14px_44px_-6px_rgba(167,139,250,0.4)]"
            >
              <Download className="h-4 w-4 text-cyan-200 transition group-hover:translate-y-0.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Total</p>
          <p className="mt-1 text-3xl font-bold text-indigo-700">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">Active</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-500/20 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Expiring Soon</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{stats.expiring}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-500">Pending Renewal</p>
          <p className="mt-1 text-3xl font-bold text-violet-700">{stats.pending}</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-600" />
          <p className="text-sm font-semibold text-slate-800">{editingId ? "Update Subscription" : "Create Subscription"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <FormInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormSelect
            label="Vendor"
            value={form.vendorId}
            onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
            options={[
              { label: "Select Vendor", value: "" },
              ...vendors.map((vendor) => ({ label: vendor.name, value: vendor._id })),
            ]}
            required
          />
          <FormSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { label: "Active", value: "Active" },
              { label: "Expired", value: "Expired" },
              { label: "Cancelled", value: "Cancelled" },
              { label: "Pending Renewal", value: "Pending Renewal" },
            ]}
          />
          <FormInput
            label="Subscription Start Date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            type="date"
          />
          <FormInput
            label="Subscription Amount"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
            type="number"
            min="0"
            step="0.01"
          />
          <FormSelect
            label="Billing Frequency"
            value={form.paymentFrequency}
            onChange={(e) => setForm({ ...form, paymentFrequency: e.target.value })}
            options={[
              { label: "Monthly", value: "Monthly" },
              { label: "Yearly", value: "Yearly" },
              { label: "Weekly", value: "Weekly" },
            ]}
          />
          <FormSelect
            label="Auto-renew"
            value={form.autoRenewEnabled}
            onChange={(e) => setForm({ ...form, autoRenewEnabled: e.target.value })}
            options={[
              { label: "Disabled", value: "false" },
              { label: "Enabled", value: "true" },
            ]}
          />
          <FormInput
            label="Renewal Date"
            value={form.renewalDate}
            onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
            type="date"
          />
          <FormInput label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <FormInput
            label="License Type"
            value={form.licenseType}
            onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FormPrimaryButton type="submit">
            <PlusCircle className="h-4 w-4" />
            {editingId ? "Update Subscription" : "Add Subscription"}
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
          placeholder="Find by name or status..."
        />
        <FormSelect
          label="Filter by Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: "All", value: "" },
            { label: "Active", value: "Active" },
            { label: "Expired", value: "Expired" },
            { label: "Cancelled", value: "Cancelled" },
            { label: "Pending Renewal", value: "Pending Renewal" },
          ]}
        />
      </ListSearchPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <DataTable
          data={records}
          searchValue={search}
          searchKeys={["name", "status"]}
          columns={[
            { key: "name", label: "Name" },
            {
              key: "vendorId",
              label: "Vendor",
              render: (row) => (typeof row.vendorId === "string" ? row.vendorId : row.vendorId?.name),
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "renewalDate",
              label: "Renewal Date",
              render: (row) => (
                <span className={within30Days(row.renewalDate) ? "rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-700" : ""}>
                  {row.renewalDate ? new Date(row.renewalDate).toLocaleDateString() : "-"}
                </span>
              ),
            },
            {
              key: "_id",
              label: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setForm({
                        name: row.name,
                        vendorId: typeof row.vendorId === "string" ? row.vendorId : row.vendorId?._id || "",
                        startDate: row.startDate ? new Date(row.startDate).toISOString().slice(0, 10) : "",
                        cost: row.cost?.toString() || "",
                        paymentFrequency: row.paymentFrequency || "Monthly",
                        autoRenewEnabled: row.autoRenewEnabled ? "true" : "false",
                        renewalDate: row.renewalDate ? new Date(row.renewalDate).toISOString().slice(0, 10) : "",
                        status: row.status,
                        category: "",
                        licenseType: "",
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
        title="Delete Subscription"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}

"use client";

import { Globe2, PlusCircle, Sparkles, Wifi } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable from "@/components/DataTable";
import FormInput from "@/components/FormInput";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import FormSelect from "@/components/FormSelect";
import { ListSearchField, ListSearchPanel } from "@/components/ListSearch";

type IspRecord = {
  _id: string;
  shopName: string;
  fiveGBackupEnabled: boolean;
  accountNumber?: string;
  serviceProviderName?: string;
  region?: string;
  telephoneNumber?: string;
};

type IspForm = {
  shopName: string;
  fiveGBackupEnabled: boolean;
  accountNumber: string;
  serviceProviderName: string;
  region: string;
  telephoneNumber: string;
};

const emptyForm: IspForm = {
  shopName: "",
  fiveGBackupEnabled: false,
  accountNumber: "",
  serviceProviderName: "",
  region: "",
  telephoneNumber: "",
};

function formPayload(form: IspForm) {
  return {
    shopName: form.shopName,
    fiveGBackupEnabled: form.fiveGBackupEnabled,
    accountNumber: form.accountNumber || undefined,
    serviceProviderName: form.serviceProviderName || undefined,
    region: form.region || undefined,
    telephoneNumber: form.telephoneNumber || undefined,
  };
}

export default function IspPage() {
  const [records, setRecords] = useState<IspRecord[]>([]);
  const [form, setForm] = useState<IspForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    const response = await fetch(`/api/isps?${params.toString()}`);
    const payload = await response.json();
    setRecords(payload.data ?? []);
  }, [debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() syncs server list when filters change
    load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/isps/${editingId}` : "/api/isps", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload(form)),
    });
    if (!response.ok) return toast.error("Failed to save ISP record");
    toast.success(editingId ? "ISP record updated" : "ISP record added");
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/isps/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Failed to delete");
    toast.success("ISP record deleted");
    setDeleteId(null);
    load();
  };

  const stats = useMemo(() => {
    const total = records.length;
    const backup5g = records.filter((r) => r.fiveGBackupEnabled).length;
    return { total, backup5g };
  }, [records]);

  return (
    <section className="space-y-5">
      <div className="isp-hero-shell">
        <div className="isp-hero-inner px-6 py-7 text-white md:px-8 md:py-8">
          <div className="isp-hero-orb -left-14 -top-20 h-52 w-52 bg-cyan-400/38" />
          <div className="isp-hero-orb -bottom-24 -right-14 h-48 w-48 bg-indigo-500/34" style={{ animationDelay: "-3s" }} />
          <div className="isp-hero-beam" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                Connectivity
              </p>
              <h1 className="bg-gradient-to-br from-white via-cyan-100 to-sky-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                ISP — Shops & circuits
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
                Track shop names, provider accounts, regions, telephone contacts, and 5G backup coverage.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-cyan-400/25 bg-white/10 px-5 py-3 backdrop-blur-md">
              <Wifi className="h-9 w-9 text-cyan-200" aria-hidden />
              <Globe2 className="h-7 w-7 text-sky-200/90" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">Total ISP records</p>
          <p className="mt-1 text-3xl font-bold text-cyan-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-700">5G backup enabled</p>
          <p className="mt-1 text-3xl font-bold text-sky-900">{stats.backup5g}</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit ISP record" : "Add ISP record"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormInput
            label="Shop name"
            value={form.shopName}
            onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            required
          />
          <FormSelect
            label="5G backup enabled"
            value={form.fiveGBackupEnabled ? "yes" : "no"}
            onChange={(e) => setForm({ ...form, fiveGBackupEnabled: e.target.value === "yes" })}
            options={[
              { label: "No", value: "no" },
              { label: "Yes", value: "yes" },
            ]}
          />
          <FormInput
            label="Account number"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
          />
          <FormInput
            label="Service provider name"
            value={form.serviceProviderName}
            onChange={(e) => setForm({ ...form, serviceProviderName: e.target.value })}
          />
          <FormInput label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <FormInput
            label="Telephone number"
            value={form.telephoneNumber}
            onChange={(e) => setForm({ ...form, telephoneNumber: e.target.value })}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FormPrimaryButton type="submit">
            <PlusCircle className="h-4 w-4" />
            {editingId ? "Update ISP record" : "Add ISP record"}
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
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <ListSearchPanel gridClassName="gap-4 md:grid-cols-1 max-w-2xl">
        <ListSearchField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Shop, account, provider, region, phone..."
        />
      </ListSearchPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <DataTable
          data={records}
          searchValue={search}
          searchKeys={["shopName", "accountNumber", "serviceProviderName", "region", "telephoneNumber"]}
          columns={[
            { key: "shopName", label: "Shop name" },
            {
              key: "fiveGBackupEnabled",
              label: "5G backup",
              render: (row) => (
                <span
                  className={
                    row.fiveGBackupEnabled
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                      : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                  }
                >
                  {row.fiveGBackupEnabled ? "Yes" : "No"}
                </span>
              ),
            },
            { key: "accountNumber", label: "Account #" },
            { key: "serviceProviderName", label: "Provider" },
            { key: "region", label: "Region" },
            { key: "telephoneNumber", label: "Telephone" },
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
                        shopName: row.shopName,
                        fiveGBackupEnabled: !!row.fiveGBackupEnabled,
                        accountNumber: row.accountNumber ?? "",
                        serviceProviderName: row.serviceProviderName ?? "",
                        region: row.region ?? "",
                        telephoneNumber: row.telephoneNumber ?? "",
                      });
                      setEditingId(row._id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
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
        title="Delete ISP record?"
        description="This cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}

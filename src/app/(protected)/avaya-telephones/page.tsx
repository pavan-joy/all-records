"use client";

import { Download, Phone, PlusCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable from "@/components/DataTable";
import { ListSearchField, ListSearchPanel } from "@/components/ListSearch";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import FormInput from "@/components/FormInput";

type Row = {
  _id: string;
  county: string;
  branchName: string;
  lanIp?: string;
  extNumber?: string;
};

type FormState = {
  county: string;
  branchName: string;
  lanIp: string;
  extNumber: string;
};

const emptyForm: FormState = {
  county: "",
  branchName: "",
  lanIp: "",
  extNumber: "",
};

function payload(form: FormState) {
  return {
    county: form.county,
    branchName: form.branchName,
    lanIp: form.lanIp || undefined,
    extNumber: form.extNumber || undefined,
  };
}

export default function AvayaTelephonesPage() {
  const [records, setRecords] = useState<Row[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    const response = await fetch(`/api/avaya-telephones?${params.toString()}`);
    const data = await response.json();
    setRecords(data.data ?? []);
  }, [debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = records.length;
    const withExt = records.filter((r) => r.extNumber?.trim()).length;
    const withLan = records.filter((r) => r.lanIp?.trim()).length;
    const branches = new Set(records.map((r) => r.branchName)).size;
    return { total, withExt, withLan, branches };
  }, [records]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/avaya-telephones/${editingId}` : "/api/avaya-telephones", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(form)),
    });
    if (!response.ok) return toast.error("Failed to save");
    toast.success(editingId ? "Updated" : "Added");
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/avaya-telephones/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Failed to delete");
    toast.success("Deleted");
    setDeleteId(null);
    load();
  };

  return (
    <section className="space-y-5">
      <div className="avaya-hero-shell">
        <div className="avaya-hero-inner px-6 py-7 text-white md:px-8 md:py-8">
          <div className="avaya-hero-orb -left-16 -top-28 h-60 w-60 bg-sky-400/40" />
          <div
            className="avaya-hero-orb -bottom-28 -right-14 h-56 w-56 bg-violet-500/38"
            style={{ animationDelay: "-3.5s" }}
          />
          <div className="avaya-hero-beam" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/35 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                Voice / UC
              </p>
              <h1 className="bg-gradient-to-br from-white via-sky-100 to-violet-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                Avaya Telephone
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
                County, branch, LAN IP, and extension numbers for your Avaya estate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open("/api/csv-upload/export/avaya-telephones", "_blank")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-violet-400/35 bg-gradient-to-r from-white/12 to-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_36px_-8px_rgba(139,92,246,0.38)] backdrop-blur-md transition hover:border-sky-400/45 hover:from-white/18 hover:shadow-[0_14px_44px_-6px_rgba(56,189,248,0.35)]"
            >
              <Download className="h-4 w-4 text-violet-200 transition group-hover:translate-y-0.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-600">Total records</p>
          <p className="mt-1 text-3xl font-bold text-sky-800">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Branch names</p>
          <p className="mt-1 text-3xl font-bold text-indigo-800">{stats.branches}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">With extension</p>
          <p className="mt-1 text-3xl font-bold text-emerald-800">{stats.withExt}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">With LAN IP</p>
          <p className="mt-1 text-3xl font-bold text-violet-900">{stats.withLan}</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4 text-indigo-600" />
          <p className="text-sm font-semibold text-slate-800">{editingId ? "Update record" : "Add Avaya telephone"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormInput
            label="County"
            value={form.county}
            onChange={(e) => setForm({ ...form, county: e.target.value })}
            required
          />
          <FormInput
            label="Branch name"
            value={form.branchName}
            onChange={(e) => setForm({ ...form, branchName: e.target.value })}
            required
          />
          <FormInput label="LAN IP" value={form.lanIp} onChange={(e) => setForm({ ...form, lanIp: e.target.value })} />
          <FormInput
            label="Ext number"
            value={form.extNumber}
            onChange={(e) => setForm({ ...form, extNumber: e.target.value })}
            placeholder="e.g. 4521"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FormPrimaryButton type="submit">
            <PlusCircle className="h-4 w-4" />
            {editingId ? "Update" : "Add"}
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
          placeholder="County, branch, LAN IP, extension..."
        />
      </ListSearchPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <DataTable
          data={records}
          searchValue={search}
          searchKeys={["county", "branchName", "lanIp", "extNumber"]}
          columns={[
            { key: "county", label: "County" },
            { key: "branchName", label: "Branch name" },
            {
              key: "lanIp",
              label: "LAN IP",
              render: (row) => <span className="font-mono text-xs text-slate-700">{row.lanIp ?? "—"}</span>,
            },
            {
              key: "extNumber",
              label: "Ext number",
              render: (row) => <span className="font-mono text-sm font-medium text-slate-800">{row.extNumber ?? "—"}</span>,
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
                        branchName: row.branchName,
                        lanIp: row.lanIp || "",
                        extNumber: row.extNumber || "",
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
        title="Delete record"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}

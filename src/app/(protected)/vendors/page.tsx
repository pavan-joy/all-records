"use client";

import { Download, PlusCircle, Sparkles, Users2 } from "lucide-react";
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

type Vendor = {
  _id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  mobileNumber?: string;
  trnNumber?: string;
  location?: string;
  email?: string;
  status: "Active" | "Inactive";
};

const defaultForm = {
  name: "",
  companyName: "",
  contactPerson: "",
  mobileNumber: "",
  trnNumber: "",
  location: "",
  email: "",
  status: "Active",
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    const response = await fetch(`/api/vendors?${params.toString()}`);
    const payload = await response.json();
    setVendors(payload.data ?? []);
  }, [debouncedSearch, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingId ? `/api/vendors/${editingId}` : "/api/vendors", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) return toast.error("Failed to save vendor");
    toast.success(editingId ? "Vendor updated" : "Vendor added");
    setForm(defaultForm);
    setEditingId(null);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/vendors/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Failed to delete vendor");
    toast.success("Vendor deleted");
    setDeleteId(null);
    load();
  };

  const stats = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((vendor) => vendor.status === "Active").length;
    const inactive = vendors.filter((vendor) => vendor.status === "Inactive").length;
    const withContact = vendors.filter((vendor) => vendor.contactPerson || vendor.email).length;
    return { total, active, inactive, withContact };
  }, [vendors]);

  return (
    <section className="space-y-5">
      <div className="vendor-hero-shell">
        <div className="vendor-hero-inner px-6 py-7 text-white md:px-8 md:py-8">
          <div className="vendor-hero-orb -left-20 -top-28 h-60 w-60 bg-fuchsia-500/45" />
          <div
            className="vendor-hero-orb -bottom-32 -right-16 h-56 w-56 bg-emerald-400/38"
            style={{ animationDelay: "-4s" }}
          />
          <div className="vendor-hero-beam" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Vendor Intelligence Hub
              </p>
              <h1 className="bg-gradient-to-br from-white via-fuchsia-100 to-emerald-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                Vendor Management
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
                Organize vendor partnerships, contacts, and service status in one elevated workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open("/api/csv-upload/export/vendors", "_blank")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-400/35 bg-gradient-to-r from-white/14 to-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_36px_-8px_rgba(16,185,129,0.38)] backdrop-blur-md transition hover:border-emerald-300/50 hover:from-white/20 hover:shadow-[0_14px_44px_-6px_rgba(217,70,239,0.38)]"
            >
              <Download className="h-4 w-4 text-emerald-200 transition group-hover:translate-y-0.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-purple-500">Total Vendors</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">Active</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">Inactive</p>
          <p className="mt-1 text-3xl font-bold text-rose-700">{stats.inactive}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">With Contact Info</p>
          <p className="mt-1 text-3xl font-bold text-indigo-700">{stats.withContact}</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users2 className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-semibold text-slate-800">{editingId ? "Update Vendor" : "Create Vendor"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <FormInput label="Vendor Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput
            label="Company Name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
          <FormInput
            label="Contact Person"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
          />
          <FormInput
            label="Mobile Number"
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
          />
          <FormInput
            label="TRN Number"
            value={form.trnNumber}
            onChange={(e) => setForm({ ...form, trnNumber: e.target.value })}
          />
          <FormInput
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <FormInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
          <FormSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FormPrimaryButton type="submit">
            <PlusCircle className="h-4 w-4" />
            {editingId ? "Update Vendor" : "Add Vendor"}
          </FormPrimaryButton>
          {editingId ? (
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={() => {
                setEditingId(null);
                setForm(defaultForm);
              }}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      <ListSearchPanel>
        <ListSearchField
          label="Search Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, location"
        />
        <FormSelect
          label="Filter by Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: "All", value: "" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
        />
      </ListSearchPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <DataTable
          data={vendors}
          searchValue={search}
          searchKeys={["name", "companyName", "email", "mobileNumber", "location"]}
          columns={[
            { key: "name", label: "Name" },
            { key: "companyName", label: "Company Name" },
            { key: "contactPerson", label: "Contact Person" },
            { key: "mobileNumber", label: "Mobile" },
            { key: "trnNumber", label: "TRN Number" },
            { key: "location", label: "Location" },
            { key: "email", label: "Email" },
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
                        name: row.name,
                        companyName: row.companyName || "",
                        contactPerson: row.contactPerson || "",
                        mobileNumber: row.mobileNumber || "",
                        trnNumber: row.trnNumber || "",
                        location: row.location || "",
                        email: row.email || "",
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
        title="Delete Vendor"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}

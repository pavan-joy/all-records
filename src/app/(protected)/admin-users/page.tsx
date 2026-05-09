"use client";

import {
  KeyRound,
  Lock,
  PlusCircle,
  Shield,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable from "@/components/DataTable";
import { ListSearchField, ListSearchPanel } from "@/components/ListSearch";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import StatusBadge from "@/components/StatusBadge";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
  status: "Active" | "Inactive";
};

const emptyForm: {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
  status: "Active" | "Inactive";
} = {
  name: "",
  email: "",
  password: "",
  role: "ADMIN",
  status: "Active",
};

export default function AdminUsersPage() {
  const { data } = useSession();
  const isSuperAdmin = data?.user?.role === "SUPER_ADMIN";
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin-users");
    const payload = await response.json();
    setUsers(payload.data ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const superAdmins = users.filter((u) => u.role === "SUPER_ADMIN").length;
    const readOnly = users.filter((u) => u.role === "READ_ONLY").length;
    return { total, active, superAdmins, readOnly };
  }, [users]);

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) return toast.error("Only SUPER_ADMIN can create admin users");
    toast.success("Admin user created");
    setForm(emptyForm);
    load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/admin-users/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Failed to delete user");
    toast.success("Admin user deleted");
    setDeleteId(null);
    load();
  };

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-64 rounded-full bg-indigo-400/20 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Identity &amp; access
            </p>
            <h1 className="text-2xl font-bold md:text-3xl">Admin Users</h1>
            <p className="mt-2 max-w-xl text-sm text-violet-100">
              Provision portal operators, assign roles, and keep privileged access under control from one secure
              console.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-left text-sm">
              <p className="font-semibold">Your access</p>
              <p className="text-xs text-violet-100">
                {isSuperAdmin ? "Full provisioning — you can create and remove users." : "View-only — contact a super admin for changes."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-500/12 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">Total operators</p>
          <div className="mt-1 flex items-baseline gap-2">
            <Users className="h-5 w-5 text-violet-500 opacity-80" />
            <p className="text-3xl font-bold text-violet-900">{stats.total}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/12 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Active</p>
          <div className="mt-1 flex items-baseline gap-2">
            <Shield className="h-5 w-5 text-emerald-500 opacity-80" />
            <p className="text-3xl font-bold text-emerald-800">{stats.active}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-500/12 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-600">Super admins</p>
          <div className="mt-1 flex items-baseline gap-2">
            <KeyRound className="h-5 w-5 text-fuchsia-500 opacity-80" />
            <p className="text-3xl font-bold text-fuchsia-900">{stats.superAdmins}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-500/10 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Read-only</p>
          <div className="mt-1 flex items-baseline gap-2">
            <Lock className="h-5 w-5 text-slate-500 opacity-80" />
            <p className="text-3xl font-bold text-slate-800">{stats.readOnly}</p>
          </div>
        </div>
      </div>

      {isSuperAdmin ? (
        <form onSubmit={createUser} className="advanced-panel rounded-2xl p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Provision admin user</p>
              <p className="text-xs text-slate-500">Credentials are hashed; share the password through a secure channel.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FormInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <FormInput
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              type="email"
            />
            <FormInput
              label="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              type="password"
            />
            <FormSelect
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminUser["role"] })}
              options={[
                { label: "Admin", value: "ADMIN" },
                { label: "Read-only", value: "READ_ONLY" },
                { label: "Super admin", value: "SUPER_ADMIN" },
              ]}
            />
            <FormSelect
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as AdminUser["status"] })}
              options={[
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />
            <div className="flex items-end">
              <FormPrimaryButton type="submit" className="w-full justify-center py-2.5 text-sm font-semibold">
                <PlusCircle className="h-4 w-4" />
                Create user
              </FormPrimaryButton>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/80 p-4 text-sm text-amber-950 shadow-sm">
          <p className="font-medium text-amber-900">View-only mode</p>
          <p className="mt-1 text-amber-800/90">
            Creating or deleting admin users requires the Super Admin role. You can still review the roster below.
          </p>
        </div>
      )}

      <ListSearchPanel>
        <ListSearchField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email"
        />
        <FormSelect
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { label: "All roles", value: "" },
            { label: "Super admin", value: "SUPER_ADMIN" },
            { label: "Admin", value: "ADMIN" },
            { label: "Read-only", value: "READ_ONLY" },
          ]}
        />
        <FormSelect
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: "All statuses", value: "" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
        />
      </ListSearchPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <DataTable
          data={filteredUsers}
          searchValue={search}
          searchKeys={["name", "email"]}
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role", render: (row) => <StatusBadge status={row.role} /> },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "_id",
              label: "Actions",
              render: (row) =>
                isSuperAdmin ? (
                  <button
                    type="button"
                    className="rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-xs font-medium text-rose-800 transition hover:bg-rose-100"
                    onClick={() => setDeleteId(row._id)}
                  >
                    Delete
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Admin User"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
      />
    </section>
  );
}

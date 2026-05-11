"use client";

import { CheckCircle2, DatabaseZap, FileSpreadsheet, Sparkles, XCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useEffect, useState } from "react";
import CsvUploader from "@/components/CsvUploader";

type LogRecord = {
  _id: string;
  type: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  createdAt: string;
};

const IMPORT_TYPES = [
  { id: "subscriptions" as const, label: "Subscriptions" },
  { id: "vendors" as const, label: "Vendors" },
  { id: "servers" as const, label: "Servers" },
  { id: "firewalls" as const, label: "Firewalls" },
  { id: "avaya-telephones" as const, label: "Avaya phones" },
  { id: "isp" as const, label: "ISP" },
];

type CsvImportTabId = (typeof IMPORT_TYPES)[number]["id"];

export default function CsvUploadPage() {
  const [tab, setTab] = useState<CsvImportTabId>("subscriptions");
  const [logs, setLogs] = useState<LogRecord[]>([]);

  const refreshLogs = useCallback(() => {
    fetch("/api/csv-upload/logs")
      .then((response) => response.json())
      .then((payload) => setLogs(payload.data ?? []));
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const stats = useMemo(() => {
    const totalImports = logs.length;
    const totalRows = logs.reduce((sum, item) => sum + item.totalRows, 0);
    const totalSuccess = logs.reduce((sum, item) => sum + item.successRows, 0);
    const totalFailed = logs.reduce((sum, item) => sum + item.failedRows, 0);
    return { totalImports, totalRows, totalSuccess, totalFailed };
  }, [logs]);

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-56 rounded-tr-full bg-cyan-300/20 blur-2xl" />
        <div className="relative">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-gradient-to-r from-white/25 via-cyan-100/20 to-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_24px_-10px_rgba(6,182,212,0.75)] backdrop-blur-md animate-[softFloat_3.2s_ease-in-out_infinite]">
            <span className="relative inline-flex h-3 w-3 items-center justify-center" aria-hidden>
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-cyan-200/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-100" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-cyan-100 animate-pulse" />
            Bulk Import Operations
          </p>
          <h1 className="text-2xl font-bold md:text-3xl">CSV Upload Center</h1>
          <p className="mt-2 text-sm text-emerald-100">
            Upload validated CSV files, preview records, and monitor import success with full visibility.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-cyan-600">Total Imports</p>
          <p className="mt-1 text-3xl font-bold text-cyan-700">{stats.totalImports}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Rows Processed</p>
          <p className="mt-1 text-3xl font-bold text-indigo-700">{stats.totalRows}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Success Rows</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{stats.totalSuccess}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-500/15 to-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-600">Failed Rows</p>
          <p className="mt-1 text-3xl font-bold text-rose-700">{stats.totalFailed}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
          {IMPORT_TYPES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                  tab === id
                    ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
        </div>
      </div>

      <CsvUploader type={tab} onImportComplete={refreshLogs} />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-800">Recent Import Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-left">File</th>
                <th className="px-2 py-2 text-left">Rows</th>
                <th className="px-2 py-2 text-left">Success</th>
                <th className="px-2 py-2 text-left">Failed</th>
                <th className="px-2 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-slate-100">
                  <td className="px-2 py-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <DatabaseZap className="h-3 w-3" />
                      {log.type}
                    </span>
                  </td>
                  <td className="px-2 py-2 font-medium text-slate-700">{log.fileName}</td>
                  <td className="px-2 py-2">{log.totalRows}</td>
                  <td className="px-2 py-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {log.successRows}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                      <XCircle className="h-3 w-3" />
                      {log.failedRows}
                    </span>
                  </td>
                  <td className="px-2 py-2">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

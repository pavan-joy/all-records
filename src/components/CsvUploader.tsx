"use client";

import { AlertTriangle, CheckCircle2, Download, FileUp, Loader2, UploadCloud, XCircle } from "lucide-react";
import Image from "next/image";
import Papa from "papaparse";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormPrimaryButton from "@/components/FormPrimaryButton";

type Props = {
  type: "subscriptions" | "vendors" | "servers" | "firewalls" | "avaya-telephones";
  onImportComplete?: () => void;
};

type ImportDone = {
  kind: "http" | "result";
  ok: boolean;
  message: string;
  totalRows?: number;
  successRows?: number;
  failedRows?: number;
  rowErrors?: string[];
};

export default function CsvUploader({ type, onImportComplete }: Props) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState<ImportDone | null>(null);

  const clearImportBanner = useCallback(() => setImportDone(null), []);

  useEffect(() => {
    setImportDone(null);
  }, [type]);

  const onFile = (file: File) => {
    setFileName(file.name);
    setImportDone(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
        setErrors(result.errors.map((error) => error.message));
      },
    });
  };

  const importRows = async () => {
    setImporting(true);
    setImportDone(null);

    try {
      const response = await fetch(`/api/csv-upload/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, rows }),
      });

      let payload: { message?: string; data?: { totalRows: number; successRows: number; failedRows: number; errors: string[] } };
      try {
        payload = await response.json();
      } catch {
        const msg = "Could not read the server response.";
        setImportDone({ kind: "http", ok: false, message: msg });
        toast.error(msg);
        return;
      }

      if (!response.ok) {
        const msg = payload.message || `Import failed (${response.status})`;
        setImportDone({ kind: "http", ok: false, message: msg });
        toast.error(msg);
        return;
      }

      const data = payload.data;
      if (!data) {
        const msg = "Import finished but no summary was returned.";
        setImportDone({ kind: "http", ok: false, message: msg });
        toast.error(msg);
        return;
      }

      const { totalRows, successRows, failedRows, errors: rowErrors } = data;

      if (failedRows === 0 && successRows > 0) {
        const msg = `Imported successfully: ${successRows} row${successRows === 1 ? "" : "s"}.`;
        setImportDone({
          kind: "result",
          ok: true,
          message: msg,
          totalRows,
          successRows,
          failedRows,
          rowErrors: rowErrors?.length ? rowErrors : undefined,
        });
        toast.success(msg);
        setRows([]);
        onImportComplete?.();
        return;
      }

      if (successRows === 0 && totalRows > 0) {
        const msg = `Import failed: all ${totalRows} row${totalRows === 1 ? "" : "s"} could not be imported.`;
        setImportDone({
          kind: "result",
          ok: false,
          message: msg,
          totalRows,
          successRows,
          failedRows,
          rowErrors,
        });
        toast.error(msg);
        onImportComplete?.();
        return;
      }

      if (successRows > 0 && failedRows > 0) {
        const msg = `Completed with issues: ${successRows} imported, ${failedRows} failed.`;
        setImportDone({
          kind: "result",
          ok: false,
          message: msg,
          totalRows,
          successRows,
          failedRows,
          rowErrors,
        });
        toast(msg, { icon: "⚠️" });
        setRows([]);
        onImportComplete?.();
        return;
      }

      const msg =
        totalRows === 0 ? "Nothing to import (no rows in file)." : "Import finished with no rows processed.";
      setImportDone({
        kind: "result",
        ok: false,
        message: msg,
        totalRows,
        successRows,
        failedRows,
        rowErrors,
      });
      toast.error(msg);
      onImportComplete?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error during import.";
      setImportDone({ kind: "http", ok: false, message: msg });
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const showBanner = importDone !== null;
  const sr = importDone?.successRows ?? 0;
  const fr = importDone?.failedRows ?? 0;
  const bannerVariant =
    importDone?.ok === true
      ? "success"
      : importDone?.kind === "result" && sr > 0 && fr > 0
        ? "partial"
        : "error";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.14)]">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-400/15 blur-3xl" />

      <div className="relative flex flex-col items-center border-b border-slate-100 bg-gradient-to-br from-sky-50/95 via-white to-indigo-50/60 px-6 pb-7 pt-9">
        <Image
          src="/csv-upload-cloud.png"
          alt="Cloud upload"
          width={128}
          height={128}
          className="h-28 w-28 object-contain drop-shadow-md md:h-32 md:w-32"
          priority
        />
        <p className="mt-5 max-w-lg text-center text-sm leading-relaxed text-slate-600">
          Select a validated CSV, preview the first rows, then import. Download the template if you need the correct columns.
        </p>
      </div>

      <div className="relative space-y-4 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <FileUp className="h-4 w-4 text-indigo-600" />
            Select CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              disabled={importing}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onFile(file);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => window.open(`/api/csv-upload/templates/${type}`, "_blank")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            disabled={importing}
          >
            <Download className="h-4 w-4 text-cyan-600" />
            Download Template
          </button>
          <FormPrimaryButton type="button" onClick={importRows} disabled={!rows.length || importing}>
            {importing ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {importing ? "Importing…" : "Import Rows"}
          </FormPrimaryButton>
        </div>

        {showBanner && importDone && (
          <div
            role="status"
            className={`rounded-2xl border p-4 shadow-sm ${
              bannerVariant === "success"
                ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white"
                : bannerVariant === "partial"
                  ? "border-amber-200/90 bg-gradient-to-br from-amber-50 to-white"
                  : "border-rose-200/90 bg-gradient-to-br from-rose-50 to-white"
            }`}
          >
            <div className="flex gap-3">
              {bannerVariant === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              ) : bannerVariant === "partial" ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {bannerVariant === "success"
                        ? "Import completed successfully"
                        : bannerVariant === "partial"
                          ? "Import completed with errors"
                          : "Import did not complete"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{importDone.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearImportBanner}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Dismiss
                  </button>
                </div>
                {importDone.kind === "result" && importDone.totalRows !== undefined && (
                  <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                    <div>
                      <dt className="inline font-medium text-slate-500">Total rows: </dt>
                      <dd className="inline">{importDone.totalRows}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-emerald-700">Succeeded: </dt>
                      <dd className="inline font-semibold text-emerald-800">{importDone.successRows}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-rose-700">Failed: </dt>
                      <dd className="inline font-semibold text-rose-800">{importDone.failedRows}</dd>
                    </div>
                  </dl>
                )}
                {importDone.rowErrors && importDone.rowErrors.length > 0 && (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200/80 bg-white/80 p-2 text-xs text-rose-800">
                    <p className="mb-1 font-semibold text-slate-700">Row details</p>
                    <ul className="list-inside list-disc space-y-0.5">
                      {importDone.rowErrors.slice(0, 25).map((err, i) => (
                        <li key={`${i}-${err.slice(0, 40)}`}>{err}</li>
                      ))}
                    </ul>
                    {importDone.rowErrors.length > 25 && (
                      <p className="mt-1 text-slate-500">…and {importDone.rowErrors.length - 25} more</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Preview ({rows.length} rows){fileName ? ` - ${fileName}` : ""}
          </p>
          <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <tbody>
                {rows.slice(0, 15).map((row, index) => (
                  <tr key={`${index}-${Object.values(row).join("-")}`} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-2">{JSON.stringify(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

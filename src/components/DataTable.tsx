"use client";

import { useMemo, useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T extends { _id: string }> = {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchValue?: string;
  searchKeys?: (keyof T)[];
};

export default function DataTable<T extends { _id: string }>({
  data,
  columns,
  pageSize = 8,
  searchValue = "",
  searchKeys = [],
}: Props<T>) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim();
    let filtered = [...data];

    if (normalizedSearch && searchKeys.length) {
      filtered = filtered.filter((row) =>
        searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(normalizedSearch)),
      );
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        const left = String(a[sortKey] ?? "");
        const right = String(b[sortKey] ?? "");
        return direction === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      });
    }

    return filtered;
  }, [data, direction, searchKeys, searchValue, sortKey]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="advanced-panel space-y-3 p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="cursor-pointer px-3 py-2 text-left text-slate-600"
                  onClick={() => {
                    if (sortKey === column.key) {
                      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                    } else {
                      setSortKey(column.key);
                      setDirection("asc");
                    }
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr key={row._id} className="border-b border-slate-100">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-3 py-2 text-slate-700">
                    {column.render ? column.render(row) : String(row[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {page} of {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={page === pageCount}
            className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

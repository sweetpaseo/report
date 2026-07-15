"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download } from "lucide-react";

export type Column<T> = {
  key: string;
  label: string;
  value: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  csv?: (row: T) => string;
  align?: "left" | "right";
};

function csvEscape(value: string): string {
  if (/[",;\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const content = [headers, ...rows].map((cols) => cols.map(csvEscape).join(";")).join("\n");
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T>({ columns, rows, filename, caption }: { columns: Column<T>[]; rows: T[]; filename: string; caption?: string }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) list = list.filter((row) => columns.some((col) => String(col.value(row)).toLowerCase().includes(q)));
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        list = [...list].sort((a, b) => {
          const av = col.value(a);
          const bv = col.value(b);
          const an = typeof av === "number" ? av : String(av).toLowerCase();
          const bn = typeof bv === "number" ? bv : String(bv).toLowerCase();
          if (an < bn) return asc ? -1 : 1;
          if (an > bn) return asc ? 1 : -1;
          return 0;
        });
      }
    }
    return list;
  }, [query, sortKey, asc, rows, columns]);

  function toggleSort(key: string): void {
    if (sortKey === key) setAsc(!asc);
    else { setSortKey(key); setAsc(true); }
  }

  function exportCsv(): void {
    const headers = columns.map((c) => c.label);
    const body = visible.map((row) => columns.map((c) => (c.csv ? c.csv(row) : String(c.value(row)))));
    downloadCsv(filename, headers, body);
  }

  return (
    <div className="data-table">
      {caption && <p className="data-table-caption">{caption}</p>}
      <div className="data-table-tools">
        <input className="data-table-search" placeholder="Cari…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button className="button secondary small" onClick={exportCsv}><Download size={14} /> CSV</button>
      </div>
      <div className="data-table-scroll">
        <table>
          <thead>
            <tr>{columns.map((c) => <th key={c.key} className={c.align === "right" ? "right" : ""} onClick={() => toggleSort(c.key)}>{c.label}{sortKey === c.key ? (asc ? " ▲" : " ▼") : ""}</th>)}</tr>
          </thead>
          <tbody>
            {visible.map((row, index) => <tr key={index}>{columns.map((c) => <td key={c.key} className={c.align === "right" ? "right" : ""}>{c.render ? c.render(row) : String(c.value(row))}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <p className="data-table-count">{visible.length} baris</p>
    </div>
  );
}

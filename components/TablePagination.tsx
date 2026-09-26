"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onExportCsv?: () => void;
  exportLabel?: string;
}

export function TablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onExportCsv,
  exportLabel = "Unduh CSV",
}: TablePaginationProps) {
  if (totalItems <= 0) return null;

  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startItem = pageSize > 0 ? (currentPage - 1) * pageSize + 1 : 1;
  const endItem = pageSize > 0 ? Math.min(currentPage * pageSize, totalItems) : totalItems;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
      {/* Left: Summary text & page size selector */}
      <div className="flex items-center gap-3">
        <span>
          Menampilkan <strong className="font-bold text-slate-900">{startItem}–{endItem}</strong> dari{" "}
          <strong className="font-bold text-slate-900">{totalItems}</strong> data
        </span>

        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <span className="text-[11px] text-slate-400">Baris:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={9999}>Semua</option>
          </select>
        </div>
      </div>

      {/* Right: Actions & Page Nav */}
      <div className="flex items-center gap-2">
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            title="Download seluruh baris tabel ke format Excel/CSV"
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200/80 rounded-xl transition-colors shadow-2xs mr-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportLabel}</span>
          </button>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

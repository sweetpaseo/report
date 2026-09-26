"use client";

import React, { useState, useMemo } from "react";
import { FileText, TrendingUp, ExternalLink, Globe, Search, CheckCircle2 } from "lucide-react";
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
  exportTableToCsv,
} from "@/lib/view-helpers";
import { PageDetailModal } from "@/components/PageDetailModal";
import { TablePagination } from "@/components/TablePagination";
import { InfoTooltip } from "@/components/InfoTooltip";

export function PagesView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const rawPages = data?.topGscPages?.web || [];
  const allQueries = data?.topQueries?.web || [];
  const periodLabel = data?.selected?.period_label || "Periode Terpilih";
  const prevPeriodLabel = (data?.comparePeriod || data?.previous)?.period_label;
  const [searchPage, setSearchPage] = useState("");
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  // Modal and pagination states
  const [selectedModalPage, setSelectedModalPage] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPages = useMemo(() => {
    return rawPages.filter((p: any) => {
      if (!searchPage) return true;
      return p.page.toLowerCase().includes(searchPage.toLowerCase());
    });
  }, [rawPages, searchPage]);

  // Paged pages for display
  const pagedPages = useMemo(() => {
    if (pageSize === 0) return filteredPages;
    const start = (currentPage - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, currentPage, pageSize]);

  const activePage = filteredPages[selectedPageIndex] || filteredPages[0] || rawPages[0] || null;

  const handleExportCsv = () => {
    const headers = [
      "URL Halaman",
      `Klik (${periodLabel})`,
      ...(isComparing && prevPeriodLabel ? [`Klik (${prevPeriodLabel})`, "Selisih"] : []),
      "Tayang",
      "CTR (%)",
    ];
    const rows = filteredPages.map((row: any) => [
      row.page,
      row.clicks || 0,
      ...(isComparing && prevPeriodLabel ? [row.previousClicks || 0, row.clicksDiff || 0] : []),
      row.impressions || 0,
      (row.ctr * 100).toFixed(2),
    ]);
    exportTableToCsv(`analisis-halaman-${periodLabel.replace(/\s+/g, "_")}`, headers, rows);
  };

  // KPI Calculations
  const totalPages = rawPages.length;
  const pagesWithClicks = rawPages.filter((p: any) => (p.clicks || 0) > 0).length;
  const totalClicks = rawPages.reduce((sum: number, p: any) => sum + (p.clicks || 0), 0);
  const topPage = rawPages[0];

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Halaman Terindeks</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatNumber(totalPages)}
          </p>
          <p className="text-[10px] text-slate-400">tercatat di Google Search Console</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Halaman Menghasilkan Klik</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums text-emerald-600">
            {formatNumber(pagesWithClicks)}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold">
            {totalPages > 0 ? formatPercent((pagesWithClicks / totalPages) * 100) : "0%"} dari total halaman
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Klik Semua Halaman</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums text-indigo-600">
            {formatNumber(totalClicks)}
          </p>
          <p className="text-[10px] text-indigo-600 font-bold">periode laporan aktif</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Halaman Terpopuler</p>
          <p className="text-sm font-extrabold text-slate-900 truncate" title={topPage?.page}>
            {topPage?.page ? new URL(topPage.page).pathname : "-"}
          </p>
          <p className="text-[10px] text-purple-600 font-bold">
            {formatNumber(topPage?.clicks || 0)} klik ({topPage && totalClicks > 0 ? formatPercent((topPage.clicks / totalClicks) * 100) : "0%"})
          </p>
        </div>
      </div>

      {/* Pages Data Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Analisis Performa Halaman Organik (GSC)</h3>
            <p className="text-[11px] text-slate-400">Klik baris mana saja untuk melihat detail kartu sorotan di bawah</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari URL halaman..."
              value={searchPage}
              onChange={(e) => setSearchPage(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 transition-colors w-48 md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px] custom-scrollbar">
          <table className="w-full text-xs text-left data-table">
            <thead className="sticky top-0 bg-white shadow-xs">
              <tr>
                <th>URL Halaman</th>
                <th className="right">Klik ({periodLabel})</th>
                {isComparing && prevPeriodLabel && (
                  <>
                    <th className="right text-amber-700">Klik ({prevPeriodLabel})</th>
                    <th className="center">Selisih</th>
                  </>
                )}
                <th className="right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span>Tayang</span>
                    <InfoTooltip
                      term="Tayangan Halaman"
                      explanation="Berapa kali URL halaman ini muncul di hasil pencarian Google bagi para pencari."
                    />
                  </div>
                </th>
                <th className="right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span>CTR</span>
                    <InfoTooltip
                      term="CTR (Click-Through Rate)"
                      explanation="Persentase pencari yang melihat halaman Anda lalu mengkliknya (Klik dibagi Tayang)."
                      example="CTR 5% artinya dari 100 penayangan, ada 5 orang yang masuk ke website."
                    />
                  </div>
                </th>
                <th className="center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedPages.length > 0 ? (
                pagedPages.map((row: any, idx: number) => {
                  let path = row.page;
                  try {
                    const u = new URL(row.page);
                    path = u.pathname || "/";
                  } catch {}

                  const isSelected = activePage?.page === row.page;

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedPageIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/70 font-semibold" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="font-mono text-slate-800 max-w-xs md:max-w-md truncate" title={row.page}>
                        {path}
                      </td>
                      <td className="right font-bold text-slate-900">{formatNumber(row.clicks)}</td>
                      {isComparing && prevPeriodLabel && (
                        <>
                          <td className="right font-semibold text-amber-700">{formatNumber(row.previousClicks || 0)}</td>
                          <td className="text-center font-bold">
                            {(row.clicksDiff || 0) > 0 ? (
                              <span className="text-emerald-600">+{row.clicksDiff} ▲</span>
                            ) : (row.clicksDiff || 0) < 0 ? (
                              <span className="text-rose-600">{row.clicksDiff} ▼</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="right text-slate-600">{formatNumber(row.impressions)}</td>
                      <td className="right font-medium text-slate-700">{formatPercent(row.ctr * 100)}</td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedModalPage(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
                          title="Buka analisis lengkap, diagnosis SEO, dan kata kunci halaman ini"
                        >
                          <span>🔍 Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isComparing && prevPeriodLabel ? 7 : 5} className="text-center py-8 text-slate-400">
                    Tidak ada halaman yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination with CSV Download */}
        <TablePagination
          totalItems={filteredPages.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onExportCsv={handleExportCsv}
        />
      </div>

      {/* Spotlight Detail Card */}
      {activePage && (
        <div className="page-spotlight-card space-y-4 border-2 border-indigo-100 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Sorotan Halaman Terpilih</p>
              <h4 className="text-base font-extrabold text-slate-900 break-all">{activePage.page}</h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedModalPage(activePage)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <span>🔍 Analisis Lengkap & Rekomendasi</span>
              </button>
              <a
                href={activePage.page}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-xs"
              >
                <span>Buka URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <p className="text-[11px] font-bold text-slate-400">Klik Organik</p>
              <p className="text-2xl font-black text-slate-900">{formatNumber(activePage.clicks)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <p className="text-[11px] font-bold text-slate-400">Tayangan di Google</p>
              <p className="text-2xl font-black text-slate-900">{formatNumber(activePage.impressions)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <p className="text-[11px] font-bold text-slate-400">CTR (Rasio Klik)</p>
              <p className="text-2xl font-black text-indigo-600">{formatPercent(activePage.ctr * 100)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Detail Drill-Down Modal */}
      {selectedModalPage && (
        <PageDetailModal
          page={selectedModalPage}
          allQueries={allQueries}
          devices={data?.devices?.web || []}
          periodLabel={periodLabel}
          prevPeriodLabel={prevPeriodLabel}
          isComparing={isComparing}
          onClose={() => setSelectedModalPage(null)}
        />
      )}
    </div>
  );
}

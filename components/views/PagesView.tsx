"use client";

import React, { useState, useMemo } from "react";
import { FileText, TrendingUp, ExternalLink, Globe, Search, CheckCircle2 } from "lucide-react";
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
} from "@/lib/view-helpers";

export function PagesView({ data }: { data: any }) {
  const rawPages = data?.topGscPages?.web || [];
  const [searchPage, setSearchPage] = useState("");
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const filteredPages = useMemo(() => {
    return rawPages.filter((p: any) => {
      if (!searchPage) return true;
      return p.page.toLowerCase().includes(searchPage.toLowerCase());
    });
  }, [rawPages, searchPage]);

  const activePage = filteredPages[selectedPageIndex] || filteredPages[0] || rawPages[0] || null;

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

        <div className="overflow-x-auto max-h-96 custom-scrollbar">
          <table className="w-full text-xs text-left data-table">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th>URL Halaman</th>
                <th className="right">Klik</th>
                <th className="right">Tayang</th>
                <th className="right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.length > 0 ? (
                filteredPages.map((row: any, idx: number) => {
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
                      <td className="font-mono text-slate-800 max-w-md truncate" title={row.page}>
                        {path}
                      </td>
                      <td className="right font-bold text-slate-900">{formatNumber(row.clicks)}</td>
                      <td className="right text-slate-600">{formatNumber(row.impressions)}</td>
                      <td className="right font-medium text-slate-700">{formatPercent(row.ctr * 100)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    Tidak ada halaman yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spotlight Detail Card */}
      {activePage && (
        <div className="page-spotlight-card space-y-4 border-2 border-indigo-100 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Detail Halaman Terpilih</p>
              <h4 className="text-base font-extrabold text-slate-900 break-all">{activePage.page}</h4>
            </div>
            <a
              href={activePage.page}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-xs"
            >
              <span>Buka Halaman</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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
    </div>
  );
}

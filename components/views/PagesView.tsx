"use client";

import React, { useState } from "react";
import { FileText, TrendingUp, TrendingDown, ExternalLink, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { Sparkline } from "@/components/sparkline";

export function PagesView({ data }: { data: any }) {
  const [selectedPage, setSelectedPage] = useState<any>({
    title: "Halaman utama",
    url: "https://example.com/",
    clicks: "3.245",
    impressions: "18.629",
    ctr: "17,4%",
    pos: "1.8",
    keywords: [
      { name: "sepatu lari terbaik", pos: 1, clicks: 542 },
      { name: "sepatu running pria", pos: 1, clicks: 421 },
      { name: "sepatu lari ringan", pos: 2, clicks: 318 },
      { name: "sepatu lari wanita terbaik", pos: 1, clicks: 287 },
    ],
  });

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Halaman Aktif</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">486</p>
          <p className="text-[10px] text-slate-400">+8 vs 30 Apr 2025</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Halaman Pertumbuhan Trafik</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums text-emerald-600">132</p>
          <p className="text-[10px] text-emerald-600 font-bold">+23,1% rerata kenaikan klik</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Halaman Menurun</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums text-rose-600">98</p>
          <p className="text-[10px] text-rose-600 font-bold">-18,6% rerata penurunan klik</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Halaman dengan Konversi</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums text-indigo-600">76</p>
          <p className="text-[10px] text-indigo-600 font-bold">2,35% rerata rasio konversi</p>
        </div>
      </div>

      {/* Pages Data Table with Sparklines */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Analisis Performa Halaman</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Halaman</th>
                <th className="right">Tren</th>
                <th className="right">Klik</th>
                <th className="right">Tayang</th>
                <th className="right">CTR</th>
                <th className="center">Posisi</th>
                <th className="right">Pengguna</th>
                <th className="right">Sesi</th>
                <th className="right">Engagement</th>
                <th className="right">Konversi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { page: "/", clicks: "3.245", imp: "18.629", ctr: "17,4%", pos: "1,8", users: "4.120", sessions: "5.230", eng: "68,7%", conv: "120" },
                { page: "/produk/sepatu-lari-terbaik", clicks: "2.160", imp: "10.850", ctr: "19,9%", pos: "2,3", users: "2.960", sessions: "3.760", eng: "71,2%", conv: "96" },
                { page: "/blog/cara-memilih-sepatu-lari", clicks: "1.420", imp: "6.120", ctr: "23,2%", pos: "2,4", users: "1.890", sessions: "2.435", eng: "66,1%", conv: "58" },
                { page: "/promo/diskon-sepatu", clicks: "1.205", imp: "5.320", ctr: "22,7%", pos: "2,1", users: "1.650", sessions: "2.010", eng: "63,4%", conv: "44" },
              ].map((row, idx) => (
                <tr key={idx} className="cursor-pointer hover:bg-purple-50/50" onClick={() => setSelectedPage({ ...selectedPage, title: row.page, url: `https://example.com${row.page}`, clicks: row.clicks, impressions: row.imp, ctr: row.ctr, pos: row.pos })}>
                  <td className="font-mono font-semibold text-slate-900">{row.page}</td>
                  <td className="right w-20">
                    <div className="h-5">
                      <Sparkline values={[12, 14, 18, 16, 22, 25]} strokeColor="#8b5cf6" />
                    </div>
                  </td>
                  <td className="right font-bold text-slate-900">{row.clicks}</td>
                  <td className="right text-slate-600">{row.imp}</td>
                  <td className="right text-slate-600">{row.ctr}</td>
                  <td className="text-center"><span className="pos-badge pos-badge-green">{row.pos}</span></td>
                  <td className="right text-slate-600">{row.users}</td>
                  <td className="right text-slate-600">{row.sessions}</td>
                  <td className="right text-slate-600">{row.eng}</td>
                  <td className="right font-bold text-indigo-600">{row.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page Detail Drawer / Spotlight Card with Thumbnail Preview */}
      <div className="page-spotlight-card space-y-4 border-2 border-indigo-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Spotlight Detail: {selectedPage.title}
            </h4>
            <a href={selectedPage.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-mono mt-0.5">
              {selectedPage.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
            Performa Sangat Baik ✨
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Live Page Preview Screenshot Mockup */}
          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-full h-40 bg-gradient-to-tr from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs shadow-inner">
              [Pratinjau Halaman Website Webapp]
            </div>
            <p className="text-[10px] text-slate-400">Snapshot pratinjau antarmuka halaman</p>
          </div>

          {/* Mini KPIs & Trend */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Klik</p>
                <p className="text-base font-extrabold text-slate-900">{selectedPage.clicks}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Tayang</p>
                <p className="text-base font-extrabold text-slate-900">{selectedPage.impressions}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">CTR</p>
                <p className="text-base font-extrabold text-slate-900">{selectedPage.ctr}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Posisi</p>
                <p className="text-base font-extrabold text-emerald-600">{selectedPage.pos}</p>
              </div>
            </div>
          </div>

          {/* Top Keywords for this page */}
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-slate-900">Kata Kunci Teratas Halaman Ini:</p>
            <div className="space-y-1.5 text-xs">
              {selectedPage.keywords.map((kw: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-800">{kw.name}</span>
                  <span className="pos-badge pos-badge-green">Pos {kw.pos}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

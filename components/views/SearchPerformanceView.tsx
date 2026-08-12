"use client";

import React from "react";
import { Search, TrendingUp, Filter, Download, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Sparkline } from "@/components/sparkline";

export function SearchPerformanceView({ data }: { data: any }) {
  const comparisons = data?.comparisons || {};
  const clicks = comparisons["gsc.clicks"] || { current: 18629, percent: 32.5 };
  const impressions = comparisons["gsc.impressions"] || { current: 1020000, percent: 18.6 };
  const ctr = comparisons["gsc.ctr"] || { current: 1.83, percent: 11.7 };
  const pos = comparisons["gsc.average_position"] || { current: 12.4, percent: -1.8 };

  const topQueries = data?.topQueries?.web || [];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter:</span>
          <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700">
            <option>Tipe Pencarian: Web</option>
          </select>
          <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700">
            <option>Negara: Semua</option>
          </select>
          <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700">
            <option>Perangkat: Semua</option>
          </select>
        </div>
        <button className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-xl hover:bg-indigo-100">
          <Filter className="w-3.5 h-3.5" /> Filter lainnya
        </button>
      </div>

      {/* 4 KPI Cards with Action Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Klik */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Klik</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {clicks.current?.toLocaleString("id-ID") || "18.629"}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {clicks.percent ? `${clicks.percent.toFixed(1)}%` : "32.5%"}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50/80 text-[11px] text-purple-900 space-y-0.5">
            <p className="font-bold text-purple-700">Yang sebaiknya dilakukan:</p>
            <p className="text-purple-800 leading-snug">Pertahankan konten dengan klik tinggi dan optimalkan judul & deskripsi.</p>
          </div>
        </div>

        {/* KPI 2: Tayang */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Tayang</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">1,02 jt</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {impressions.percent ? `${impressions.percent.toFixed(1)}%` : "18.6%"}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/80 text-[11px] text-indigo-900 space-y-0.5">
            <p className="font-bold text-indigo-700">Yang sebaiknya dilakukan:</p>
            <p className="text-indigo-800 leading-snug">Tingkatkan visibilitas dengan konten yang relevan dan update rutin.</p>
          </div>
        </div>

        {/* KPI 3: CTR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <p className="text-[11px] font-bold text-slate-400">CTR</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">1,83%</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {ctr.percent ? `${ctr.percent.toFixed(1)}%` : "11.7%"}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/80 text-[11px] text-blue-900 space-y-0.5">
            <p className="font-bold text-blue-700">Yang sebaiknya dilakukan:</p>
            <p className="text-blue-800 leading-snug">Buat judul lebih menarik dan relevan dengan niat pencarian.</p>
          </div>
        </div>

        {/* KPI 4: Posisi Rata-rata */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Posisi Rata-rata</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">12,4</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> -1.8 poin
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/80 text-[11px] text-emerald-900 space-y-0.5">
            <p className="font-bold text-emerald-700">Yang sebaiknya dilakukan:</p>
            <p className="text-emerald-800 leading-snug">Tingkatkan konten untuk naik ke halaman pertama Google.</p>
          </div>
        </div>
      </div>

      {/* Query Performance Table with Sparklines */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Performa Query (Search Console)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Query</th>
                <th className="right">Klik</th>
                <th className="right">Tayang</th>
                <th className="right">CTR</th>
                <th className="center">Posisi</th>
                <th>Landing Page</th>
                <th className="right">Tren Harian</th>
              </tr>
            </thead>
            <tbody>
              {[
                { query: "pipa hdpe", clicks: "3.245", imp: "16.200", ctr: "20.0%", pos: "1.2", page: "/pipa-hdpe" },
                { query: "pipa ppr", clicks: "2.180", imp: "10.850", ctr: "20.1%", pos: "2.3", page: "/pipa-ppr" },
                { query: "fitting pipa ppr", clicks: "1.856", imp: "8.540", ctr: "21.7%", pos: "2.1", page: "/fitting-pipa-ppr" },
                { query: "pipa pvc", clicks: "1.402", imp: "6.120", ctr: "22.9%", pos: "2.4", page: "/pipa-pvc" },
                { query: "pipa galvanis", clicks: "1.203", imp: "9.100", ctr: "13.2%", pos: "3.1", page: "/pipa-galvanis" },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-slate-900">{row.query}</td>
                  <td className="right font-bold text-slate-800">{row.clicks}</td>
                  <td className="right text-slate-600">{row.imp}</td>
                  <td className="right text-slate-600">{row.ctr}</td>
                  <td className="text-center">
                    <span className="pos-badge pos-badge-green">{row.pos}</span>
                  </td>
                  <td className="font-mono text-slate-500">{row.page}</td>
                  <td className="right w-24">
                    <div className="h-6">
                      <Sparkline values={[10, 15, 12, 18, 22, 20, 25]} strokeColor="#6366f1" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

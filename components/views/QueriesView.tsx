"use client";

import React from "react";
import { KeyRound, TrendingUp, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import { Sparkline } from "@/components/sparkline";

export function QueriesView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Query Aktif</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">18.629</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 32,5% vs 1 Apr - 30 Apr 2025</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Kontribusi Top 10 Query</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">62,4%</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 8,7% vs 1 Apr - 30 Apr 2025</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Rata-rata CTR</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">2,35%</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 0,41 p.p. vs 1 Apr - 30 Apr 2025</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Query Peningkatan Posisi</p>
          <p className="text-2xl font-extrabold text-indigo-600 tabular-nums">1.204</p>
          <span className="text-[10px] font-bold text-indigo-600">▲ 15,8% vs 1 Apr - 30 Apr 2025</span>
        </div>
      </div>

      {/* Query Breakdown Donut Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Branded vs Non-Branded */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-xs font-extrabold text-slate-900">Branded vs Non-Branded</p>
          <div className="flex items-center justify-around py-2">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-emerald-500 flex items-center justify-center text-[10px] font-bold text-slate-700">
              78,6%
            </div>
            <div className="text-[11px] space-y-1">
              <p className="text-slate-600"><span className="w-2 h-2 rounded-full bg-indigo-600 inline-block mr-1"></span> Non-Branded: 78,6%</p>
              <p className="text-slate-600"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span> Branded: 21,4%</p>
            </div>
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-xs font-extrabold text-slate-900">Distribusi Intent Query</p>
          <div className="text-[11px] space-y-1.5 pt-1">
            <div className="flex justify-between"><span>Informational</span> <span className="font-bold">58,7%</span></div>
            <div className="flex justify-between"><span>Commercial</span> <span className="font-bold">23,5%</span></div>
            <div className="flex justify-between"><span>Navigational</span> <span className="font-bold">12,4%</span></div>
            <div className="flex justify-between"><span>Transactional</span> <span className="font-bold">5,4%</span></div>
          </div>
        </div>

        {/* Rising Queries */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Rising Queries
          </p>
          <div className="text-[11px] space-y-1.5">
            <div className="flex justify-between"><span className="truncate max-w-[110px]">pipa hdpe irigasi</span> <span className="font-bold text-emerald-600">▲ 128%</span></div>
            <div className="flex justify-between"><span className="truncate max-w-[110px]">pipa hdpe 6 inch</span> <span className="font-bold text-emerald-600">▲ 96%</span></div>
            <div className="flex justify-between"><span className="truncate max-w-[110px]">fitting pipa hdpe</span> <span className="font-bold text-emerald-600">▲ 74%</span></div>
          </div>
        </div>

        {/* Falling Queries */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-xs font-extrabold text-rose-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 rotate-180" /> Falling Queries
          </p>
          <div className="text-[11px] space-y-1.5">
            <div className="flex justify-between"><span className="truncate max-w-[110px]">pipa hdpe murah</span> <span className="font-bold text-rose-600">▼ 34%</span></div>
            <div className="flex justify-between"><span className="truncate max-w-[110px]">pipa hdpe bekas</span> <span className="font-bold text-rose-600">▼ 28%</span></div>
            <div className="flex justify-between"><span className="truncate max-w-[110px]">distributor pipa</span> <span className="font-bold text-rose-600">▼ 22%</span></div>
          </div>
        </div>
      </div>

      {/* Opportunities Section: Queries Near Page 1 (Pos 11-20) */}
      <div className="bg-white rounded-2xl p-5 border-2 border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 fill-purple-200" /> Peluang Emas: Query Dekat Halaman Pertama (Posisi 11–20)
            </h3>
            <p className="text-xs text-slate-500">Query yang berpotensi besar naik ke halaman pertama dengan sedikit optimasi tambahan.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Query</th>
                <th className="center">Posisi Saat Ini</th>
                <th className="right">Tayang</th>
                <th className="right">CTR</th>
                <th className="center">Potensi Dampak</th>
                <th>Rekomendasi Aksi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { query: "standar pipa hdpe", pos: "11,3", imp: "2.450", ctr: "12,1%", impact: "Tinggi", action: "Perkuat konten dengan menambahkan detail standar & tabel spesifikasi." },
                { query: "tes tekanan pipa hdpe", pos: "12,6", imp: "1.980", ctr: "11,0%", impact: "Tinggi", action: "Tambahkan FAQ & data teknis untuk meningkatkan relevansi." },
                { query: "cara penyambungan pipa hdpe", pos: "13,4", imp: "1.760", ctr: "10,6%", impact: "Sedang", action: "Tambahkan gambar/video langkah instalasi yang jelas." },
                { query: "pipa hdpe untuk gas", pos: "14,7", imp: "1.420", ctr: "9,8%", impact: "Sedang", action: "Perkuat E-E-A-T dengan referensi & standar keamanan resmi." },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-slate-900">{row.query}</td>
                  <td className="text-center font-bold text-slate-700">{row.pos}</td>
                  <td className="right text-slate-600">{row.imp}</td>
                  <td className="right text-slate-600">{row.ctr}</td>
                  <td className="text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${row.impact === "Tinggi" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {row.impact}
                    </span>
                  </td>
                  <td className="text-slate-600">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Target, TrendingUp, Filter, Sparkles } from "lucide-react";

export function EventsConversionsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Event</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">124.580</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 31,2% vs 1 Apr - 30 Apr 2025</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Key Event</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">8.765</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 28,1% vs 1 Apr - 30 Apr 2025</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Konversi</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">3.245</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 22,7% vs 1 Apr - 30 Apr 2025</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Rasio Konversi</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">2,35%</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 1,8 p.p. vs 1 Apr - 30 Apr 2025</span>
        </div>
      </div>

      {/* 7-Step Conversion Funnel Visualizer */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-600" /> Funnel Konversi 7-Langkah (E-Commerce / Lead Generation)
        </h3>
        <div className="funnel-container space-y-2">
          {[
            { step: "1. Sesi", val: "28.990", pct: "100%", width: "100%" },
            { step: "2. Lihat Halaman Produk", val: "12.465", pct: "43,0%", width: "85%" },
            { step: "3. Tambah ke Keranjang", val: "5.680", pct: "19,6%", width: "68%" },
            { step: "4. Mulai Checkout", val: "3.920", pct: "13,5%", width: "52%" },
            { step: "5. Isi Informasi", val: "3.330", pct: "11,5%", width: "42%" },
            { step: "6. Pilih Metode Pembayaran", val: "2.900", pct: "10,0%", width: "34%" },
            { step: "7. Pembelian / Submit Form", val: "3.245", pct: "11,2%", width: "28%" },
          ].map((item, idx) => (
            <div key={idx} className="funnel-step-bar" style={{ width: item.width }}>
              <span>{item.step} ({item.val})</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">{item.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

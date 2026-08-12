"use client";

import React from "react";
import { Sparkles, Bot, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";

export function AiInsightView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Robot Mascot Header Banner */}
      <div className="robot-mascot-banner flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-200" />
            <h2 className="text-lg font-extrabold text-slate-900">AI Insight & Wawasan Otomatis</h2>
            <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full">AI Powered</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Wawasan cerdas yang menggabungkan data Search Console & Analytics untuk membantu Anda tumbuh lebih cepat.
          </p>
        </div>
        <div className="robot-3d-graphic shrink-0">
          <Bot className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* 4 Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Pertumbuhan Terbaik */}
        <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-2">
          <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Pertumbuhan Terbaik
          </p>
          <p className="text-xs text-emerald-900 leading-snug">Halaman blog &quot;pipa hdpe&quot; mendorong lonjakan trafik organik terbesar.</p>
          <div className="text-xs font-bold text-emerald-700 flex justify-between pt-1">
            <span>Klik: +2.180 (▲ 68,0%)</span>
          </div>
        </div>

        {/* Card 2: Performa Menurun */}
        <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 space-y-2">
          <p className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-rose-600 rotate-180" /> Performa Menurun
          </p>
          <p className="text-xs text-rose-900 leading-snug">Beberapa halaman produk kehilangan peringkat untuk kata kunci transaksi.</p>
          <div className="text-xs font-bold text-rose-700 flex justify-between pt-1">
            <span>Klik: -1.230 (▼ 13,5%)</span>
          </div>
        </div>

        {/* Card 3: Anomaly Detected */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 space-y-2">
          <p className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Anomaly Detected
          </p>
          <p className="text-xs text-amber-900 leading-snug">Lonjakan impresi tidak diikuti klik pada beberapa query informational.</p>
          <div className="text-xs font-bold text-amber-700 pt-1">
            Query: &quot;pipa hdpe&quot; (Perlu optimasi CTR)
          </div>
        </div>

        {/* Card 4: Conversion Highlight */}
        <div className="bg-purple-50/80 rounded-2xl p-4 border border-purple-200 space-y-2">
          <p className="text-xs font-extrabold text-purple-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" /> Conversion Highlight
          </p>
          <p className="text-xs text-purple-900 leading-snug">Halaman produk &quot;Talang Air&quot; memiliki konversi di atas rata-rata.</p>
          <div className="text-xs font-bold text-purple-700 pt-1">
            Rasio Konversi: 3,48% (vs rerata 2,35%)
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Lightbulb, CheckSquare, Sparkles, Zap, ArrowRight } from "lucide-react";

export function RecommendationsView({ data }: { data: any }) {
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCompletedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Top 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Rekomendasi</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">36</p>
          <p className="text-[10px] text-purple-600 font-bold">+8 dari periode lalu</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Prioritas Tinggi</p>
          <p className="text-2xl font-extrabold text-rose-600 tabular-nums">11</p>
          <p className="text-[10px] text-rose-600 font-bold">31% dari total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Quick Wins</p>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">9</p>
          <p className="text-[10px] text-emerald-600 font-bold">25% dari total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Dampak Tinggi</p>
          <p className="text-2xl font-extrabold text-indigo-600 tabular-nums">14</p>
          <p className="text-[10px] text-indigo-600 font-bold">39% dari total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Perlu Dikerjakan</p>
          <p className="text-2xl font-extrabold text-amber-600 tabular-nums">20</p>
          <p className="text-[10px] text-amber-600 font-bold">56% dari total</p>
        </div>
      </div>

      {/* 2x2 Effort vs Impact Matrix Grid & Quick Wins Checklist Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peta Prioritas (2x2 Matrix) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" /> Peta Prioritas (Effort vs Impact)
            </h3>
            <span className="text-[11px] text-slate-400">Fokus pada dampak tinggi terlebih dahulu</span>
          </div>

          <div className="matrix-2x2">
            {/* Quadrant 1: Quick Wins (High Impact, Low Effort) */}
            <div className="matrix-quadrant quadrant-quick-wins">
              <div>
                <p className="font-extrabold text-xs">🚀 Quick Wins (Lakukan Sekarang)</p>
                <p className="text-[11px] opacity-80 mt-1">Dampak tinggi dengan usaha rendah. Hasil cepat.</p>
              </div>
              <p className="text-2xl font-black">9</p>
            </div>

            {/* Quadrant 2: Strategic (High Impact, High Effort) */}
            <div className="matrix-quadrant quadrant-strategic">
              <div>
                <p className="font-extrabold text-xs">🎯 Proyek Strategis (Rencanakan)</p>
                <p className="text-[11px] opacity-80 mt-1">Dampak tinggi, butuh usaha lebih. Pertumbuhan jangka panjang.</p>
              </div>
              <p className="text-2xl font-black">14</p>
            </div>

            {/* Quadrant 3: Minor Fixes (Low Impact, Low Effort) */}
            <div className="matrix-quadrant quadrant-minor">
              <div>
                <p className="font-extrabold text-xs">🌱 Perbaikan Ringan (Pertimbangkan)</p>
                <p className="text-[11px] opacity-80 mt-1">Dampak rendah, usaha rendah. Lakukan jika ada waktu.</p>
              </div>
              <p className="text-2xl font-black">6</p>
            </div>

            {/* Quadrant 4: Low Priority (Low Impact, High Effort) */}
            <div className="matrix-quadrant quadrant-low-priority">
              <div>
                <p className="font-extrabold text-xs">⏳ Low Priority (Prioritas Rendah)</p>
                <p className="text-[11px] opacity-80 mt-1">Dampak rendah, usaha tinggi. Tunda atau evaluasi kembali.</p>
              </div>
              <p className="text-2xl font-black">7</p>
            </div>
          </div>
        </div>

        {/* Quick Wins Checklist Panel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> Quick Wins Checklist
            </h3>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
              {Object.values(completedItems).filter(Boolean).length}/5 selesai
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { title: "Perbaiki meta description halaman utama", tag: "SEO", impact: "↑ CTR" },
              { title: "Optimalkan judul 'Talang Air'", tag: "Konten", impact: "↑ Trafik" },
              { title: "Perbaiki 3 halaman dengan Core Web Vitals buruk", tag: "SEO", impact: "↑ UX" },
              { title: "Tambahkan internal link ke halaman pilar", tag: "Konten", impact: "↑ Ranking" },
              { title: "Perbaiki halaman dengan bounce rate tinggi", tag: "Analytics", impact: "↑ Engage" },
            ].map((task, idx) => (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`checklist-item cursor-pointer ${completedItems[idx] ? "opacity-50 line-through bg-slate-50" : ""}`}
              >
                <input type="checkbox" checked={!!completedItems[idx]} onChange={() => {}} className="rounded text-purple-600 focus:ring-purple-500" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{task.title}</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded">{task.tag}</span>
                <span className="font-bold text-emerald-600 text-[10px]">{task.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

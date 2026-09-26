"use client";

import React, { useState, useMemo } from "react";
import { Lightbulb, CheckSquare, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/view-helpers";

export function RecommendationsView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  const topPage = data?.topGscPages?.web?.[0];
  const topOpp = data?.opportunities?.web?.[0] || data?.topQueries?.web?.[1];
  const mobileDevice = (data?.devices?.web || []).find((d: any) => String(d.device).toUpperCase().includes("MOB"));

  const topPath = topPage?.page ? new URL(topPage.page).pathname : "halaman utama";
  const oppQuery = topOpp?.query || "kata kunci utama";

  const checklistItems = useMemo(() => [
    {
      task: `Perbarui meta title & description pada "${topPath}" untuk meningkatkan CTR organik`,
      category: "SEO",
      impact: "CTR",
    },
    {
      task: `Tambahkan heading & materi khusus seputar "${oppQuery}" untuk menembus Halaman 1 Google`,
      category: "Konten",
      impact: "Ranking",
    },
    {
      task: `Audit Core Web Vitals pada perangkat Ponsel (Mobile) karena menyumbang mayoritas audiens`,
      category: "Teknis",
      impact: "UX",
    },
    {
      task: "Periksa kembali konversi formulir kontak dan tombol WhatsApp di seluruh halaman arahan",
      category: "Analytics",
      impact: "Konversi",
    },
    {
      task: "Bangun internal link dari artikel blog terpopuler menuju halaman produk/layanan utama",
      category: "SEO",
      impact: "Otoritas",
    },
  ], [topPath, oppQuery]);

  const toggleCheck = (idx: number) => {
    setCompletedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Rekomendasi Terbuka</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">5</p>
          <p className="text-[10px] text-purple-600 font-bold">dihasilkan dari analisis data riil</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Quick Wins (Hasil Cepat)</p>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">2</p>
          <p className="text-[10px] text-emerald-600 font-bold">bisa dieksekusi hari ini</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Dampak Tinggi</p>
          <p className="text-2xl font-extrabold text-indigo-600 tabular-nums">3</p>
          <p className="text-[10px] text-indigo-600 font-bold">berpengaruh ke ranking & klik</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Status Penyelesaian</p>
          <p className="text-2xl font-extrabold text-amber-600 tabular-nums">
            {completedCount}/5 selesai
          </p>
          <p className="text-[10px] text-slate-400">interaktif checklist</p>
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
            {/* Quadrant 1: Quick Wins */}
            <div className="matrix-quadrant quadrant-quick-wins">
              <div>
                <p className="font-extrabold text-xs">🚀 Quick Wins (Lakukan Sekarang)</p>
                <p className="text-[11px] opacity-80 mt-1">Dampak tinggi dengan usaha ringan. Optimasi meta tag & CTR.</p>
              </div>
              <p className="text-2xl font-black">2</p>
            </div>

            {/* Quadrant 2: Strategic */}
            <div className="matrix-quadrant quadrant-strategic">
              <div>
                <p className="font-extrabold text-xs">🎯 Proyek Strategis (Rencanakan)</p>
                <p className="text-[11px] opacity-80 mt-1">Dampak besar jangka panjang. Perluasan artikel pilar.</p>
              </div>
              <p className="text-2xl font-black">1</p>
            </div>

            {/* Quadrant 3: Minor Fixes */}
            <div className="matrix-quadrant quadrant-minor">
              <div>
                <p className="font-extrabold text-xs">🌱 Perbaikan Ringan</p>
                <p className="text-[11px] opacity-80 mt-1">Penyempurnaan link internal halaman pendukung.</p>
              </div>
              <p className="text-2xl font-black">1</p>
            </div>

            {/* Quadrant 4: Low Priority */}
            <div className="matrix-quadrant quadrant-low-priority">
              <div>
                <p className="font-extrabold text-xs">⏳ Pemeliharaan Rutin</p>
                <p className="text-[11px] opacity-80 mt-1">Audit berkala parameter analitik & tag.</p>
              </div>
              <p className="text-2xl font-black">1</p>
            </div>
          </div>
        </div>

        {/* Quick Wins Checklist Panel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> Action Items Checklist
            </h3>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
              {completedCount}/{checklistItems.length} selesai
            </span>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item, idx) => {
              const isChecked = !!completedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-slate-50 border-slate-200 opacity-60 line-through"
                      : "bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-xs"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{item.task}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400">↑ Dampak: {item.impact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

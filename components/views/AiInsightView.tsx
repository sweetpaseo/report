"use client";

import React from "react";
import { Sparkles, Bot, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
import { formatNumber, formatPercent, formatCompactNumber } from "@/lib/view-helpers";

export function AiInsightView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const websiteName = data?.website?.name || "Website";
  const comparisons = data?.comparisons || {};
  const clicks = comparisons["gsc.clicks"] || { current: 0, percent: null };
  const impressions = comparisons["gsc.impressions"] || { current: 0, percent: null };
  const users = comparisons["ga.active_users"] || { current: 0, percent: null };
  const ctr = comparisons["gsc.ctr"] || { current: 0, percent: null };

  const topQuery = data?.topQueries?.web?.[0];
  const topPage = data?.topGscPages?.web?.[0];
  const topCountry = data?.countries?.web?.[0];
  const anomalies = data?.anomalies || [];
  const analystNotes = data?.analystNotes || [];
  const insights = data?.insights || [];

  return (
    <div className="space-y-6">
      {/* Robot Mascot Header Banner */}
      <div className="robot-mascot-banner flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-200" />
            <h2 className="text-lg font-extrabold text-slate-900">AI Insight & Wawasan Otomatis: {websiteName}</h2>
            <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full">Analisis Riil</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Wawasan cerdas yang digabungkan otomatis dari data Google Search Console & Google Analytics 4 untuk periode aktif.
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
          <p className="text-xs text-emerald-900 leading-snug">
            {clicks.percent !== null && clicks.percent > 0
              ? `Klik organik naik ${formatPercent(clicks.percent)} dibanding periode sebelumnya.`
              : `Kata kunci utama "${topQuery?.query || 'inti'}" menghasilkan ${formatNumber(topQuery?.clicks || 0)} klik.`}
          </p>
          <div className="text-xs font-bold text-emerald-700 flex justify-between pt-1">
            <span>Total Klik: {formatNumber(clicks.current)}</span>
          </div>
        </div>

        {/* Card 2: Performa Menurun / Evaluasi */}
        <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 space-y-2">
          <p className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-600" /> Perlu Evaluasi
          </p>
          <p className="text-xs text-rose-900 leading-snug">
            {anomalies.length > 0
              ? anomalies[0].text
              : `Perhatikan posisi rata-rata kata kunci sekunder yang masih berada di luar halaman 1.`}
          </p>
          <div className="text-xs font-bold text-rose-700 flex justify-between pt-1">
            <span>CTR: {formatPercent((ctr.current || 0) * 100, 2)}</span>
          </div>
        </div>

        {/* Card 3: Anomaly / Potensi CTR */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 space-y-2">
          <p className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Peluang Optimasi CTR
          </p>
          <p className="text-xs text-amber-900 leading-snug">
            Tayangan mencapai {formatCompactNumber(impressions.current)}. Judul dan meta description yang memikat akan melipatgandakan klik.
          </p>
          <div className="text-xs font-bold text-amber-700 pt-1">
            Impresi: {formatNumber(impressions.current)}
          </div>
        </div>

        {/* Card 4: Sorotan Halaman & Audiens */}
        <div className="bg-purple-50/80 rounded-2xl p-4 border border-purple-200 space-y-2">
          <p className="text-xs font-extrabold text-purple-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" /> Sorotan Konten Utama
          </p>
          <p className="text-xs text-purple-900 leading-snug truncate" title={topPage?.page}>
            Halaman &quot;{topPage?.page ? new URL(topPage.page).pathname : 'utama'}&quot; menjadi magnet trafik utama website.
          </p>
          <div className="text-xs font-bold text-purple-700 pt-1">
            Menyumbang {formatNumber(topPage?.clicks || 0)} klik
          </div>
        </div>
      </div>

      {/* Catatan Analis Bisnis */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-600" /> Catatan Analis & Rekomendasi Strategis
        </h3>
        <div className="space-y-3">
          {analystNotes.length > 0 ? (
            analystNotes.map((note: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
              Performa keseluruhan stabil. Pertahankan kontinuitas publikasi dan pemantauan berkala.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

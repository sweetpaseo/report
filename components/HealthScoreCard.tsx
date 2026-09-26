"use client";

import React, { useMemo } from "react";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/view-helpers";
import { InfoTooltip } from "@/components/InfoTooltip";

export function HealthScoreCard({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const comparisons = data?.comparisons || {};
  const clicksComp = comparisons["gsc.clicks"] || { current: 0, percent: null };
  const impComp = comparisons["gsc.impressions"] || { current: 0, percent: null };
  const ctrComp = comparisons["gsc.ctr"] || { current: 0, percent: null };
  const usersComp = comparisons["ga.active_users"] || { current: 0, percent: null };

  const periodLabel = data?.selected?.period_label || "Periode Aktif";
  const prevPeriodLabel = (data?.comparePeriod || data?.previous)?.period_label;
  const websiteName = data?.website?.name || "Website";

  // Calculate composite Health Score 0-100
  const { score, status, statusColor, strokeColor, bulletPoints } = useMemo(() => {
    let s = 75; // base

    // 1. Clicks growth
    const cPct = clicksComp.percent;
    if (cPct !== null) {
      if (cPct >= 15) s += 12;
      else if (cPct > 0) s += 6;
      else if (cPct <= -15) s -= 12;
      else if (cPct < 0) s -= 6;
    }

    // 2. Impressions growth
    const iPct = impComp.percent;
    if (iPct !== null) {
      if (iPct >= 10) s += 5;
      else if (iPct < -10) s -= 5;
    }

    // 3. CTR
    const ctrVal = (data?.metrics?.["gsc.ctr"] || 0) * 100;
    if (ctrVal >= 3.0) s += 5;
    else if (ctrVal < 1.0) s -= 5;

    // 4. Mobile share & engagement
    const totalMob = (data?.devices?.web || []).find((d: any) => String(d.device).toUpperCase().includes("MOB"))?.clicks || 0;
    const totalDevClicks = (data?.devices?.web || []).reduce((sum: number, d: any) => sum + (d.clicks || 0), 0) || 1;
    const mobShare = Math.round((totalMob / totalDevClicks) * 100);

    const finalScore = Math.min(98, Math.max(45, Math.round(s)));

    let stat = "Kondisi Sehat & Stabil";
    let color = "text-indigo-600 bg-indigo-50 border-indigo-200";
    let stroke = "#6366f1";

    if (finalScore >= 85) {
      stat = "Sangat Prima & Bertumbuh Cepat";
      color = "text-emerald-700 bg-emerald-50 border-emerald-200";
      stroke = "#10b981";
    } else if (finalScore < 70) {
      stat = "Perlu Perhatian & Optimasi";
      color = "text-amber-700 bg-amber-50 border-amber-200";
      stroke = "#f59e0b";
    }

    // 3 Executive Business Points
    const b1 = cPct !== null
      ? `${cPct >= 0 ? "Kunjungan naik" : "Kunjungan turun"} ${Math.abs(cPct).toFixed(1)}% dengan total ${formatNumber(clicksComp.current)} klik ${prevPeriodLabel ? `dibanding ${prevPeriodLabel}` : ""}.`
      : `Website menghasilkan ${formatNumber(clicksComp.current)} pengunjung potensial dari pencarian Google.`;

    const b2 = `Sebanyak ${mobShare}% pengunjung datang lewat smartphone (HP). Pengalaman pengguna di layar ponsel menjadi kunci utama.`;

    const topOpp = data?.opportunities?.web?.[0]?.query || data?.topQueries?.web?.[0]?.query;
    const b3 = topOpp
      ? `Peluang terbesar: kata kunci "${topOpp}" berpotensi melipatgandakan omset bila kontennya terus diperbarui.`
      : "Rutin perbarui informasi produk dan artikel blog agar posisi peringkat Google terus naik.";

    return {
      score: finalScore,
      status: stat,
      statusColor: color,
      strokeColor: stroke,
      bulletPoints: [b1, b2, b3],
    };
  }, [clicksComp, impComp, data, prevPeriodLabel]);

  return (
    <div className="bg-linear-to-br from-white via-indigo-50/20 to-slate-50 rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Score & Status */}
        <div className="flex items-center gap-4">
          {/* Circular Score Badge */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
                stroke={strokeColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-900 leading-none">{score}</span>
              <span className="text-[9px] font-extrabold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Skor Kesehatan Website
              </span>
              <InfoTooltip
                term="Skor Kesehatan Website"
                explanation="Nilai akumulasi (1–100) yang mengukur performa website Anda dari laju pertumbuhan kunjungan, daya tarik di hasil pencarian Google, dan keramahan bagi pengguna HP."
              />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              {websiteName}: <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block ml-1 ${statusColor}`}>{status}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Laporan performa periode <strong className="text-slate-800">{periodLabel}</strong>
            </p>
          </div>
        </div>

        {/* Right: Quick Highlights */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Total Klik: <strong className="text-slate-900">{formatNumber(clicksComp.current)}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Total Tayang: <strong className="text-slate-900">{formatNumber(impComp.current)}</strong>
          </div>
        </div>
      </div>

      {/* 3 Executive Summary Points (Bahasa Bisnis untuk Bos / Pemilik) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
        {bulletPoints.map((point, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-white/80 border border-slate-200/70 shadow-2xs flex items-start gap-2.5 text-xs text-slate-700"
          >
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <p className="leading-snug font-medium text-slate-800">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

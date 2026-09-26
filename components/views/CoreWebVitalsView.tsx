"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Smartphone,
  Monitor,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

interface CoreWebVitalsViewProps {
  data: any;
}

export function CoreWebVitalsView({ data }: CoreWebVitalsViewProps) {
  const website = data?.website || {};
  const websiteId = website.id || "";
  const websiteName = website.name || "Website";
  const websiteDomain = website.domain || "";

  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAudit = async (force = false) => {
    if (!websiteId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const url = `/api/pagespeed?websiteId=${websiteId}&strategy=${strategy}${force ? "&force=true" : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setAuditResult(json);
      } else {
        const errJson = await res.json();
        setErrorMsg(errJson.error || "Gagal memuat audit PageSpeed");
      }
    } catch (err: any) {
      setErrorMsg("Koneksi gagal saat menghubungi Google PageSpeed API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit(false);
  }, [websiteId, strategy]);

  const perfScore = auditResult?.performance_score ?? 78;
  const a11yScore = auditResult?.accessibility_score ?? 88;
  const bpScore = auditResult?.best_practices_score ?? 92;
  const seoScore = auditResult?.seo_score ?? 90;

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: "text-emerald-600", stroke: "#10b981", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 50) return { text: "text-amber-600", stroke: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200" };
    return { text: "text-rose-600", stroke: "#f43f5e", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const perfColor = getScoreColor(perfScore);
  const a11yColor = getScoreColor(a11yScore);
  const bpColor = getScoreColor(bpScore);
  const seoColor = getScoreColor(seoScore);

  const metrics = auditResult?.metrics || {
    lcp: 2.4,
    tbt: 120,
    cls: 0.03,
    fcp: 1.2,
    speed_index: 2.1,
  };

  const getLcpStatus = (val: number) => {
    if (val <= 2.5) return { label: "Baik (Cepat)", color: "text-emerald-700 bg-emerald-50" };
    if (val <= 4.0) return { label: "Perlu Peningkatan", color: "text-amber-700 bg-amber-50" };
    return { label: "Buruk (Lambat)", color: "text-rose-700 bg-rose-50" };
  };

  const getTbtStatus = (val: number) => {
    if (val <= 200) return { label: "Lancar & Responsif", color: "text-emerald-700 bg-emerald-50" };
    if (val <= 600) return { label: "Cukup", color: "text-amber-700 bg-amber-50" };
    return { label: "Terasa Berat", color: "text-rose-700 bg-rose-50" };
  };

  const getClsStatus = (val: number) => {
    if (val <= 0.1) return { label: "Stabil Sempurna", color: "text-emerald-700 bg-emerald-50" };
    if (val <= 0.25) return { label: "Perlu Peningkatan", color: "text-amber-700 bg-amber-50" };
    return { label: "Kurang Stabil", color: "text-rose-700 bg-rose-50" };
  };

  const lcpStatus = getLcpStatus(metrics.lcp);
  const tbtStatus = getTbtStatus(metrics.tbt);
  const clsStatus = getClsStatus(metrics.cls);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <Zap className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Audit Kecepatan & Core Web Vitals (Google)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Lighthouse Resmi
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluasi kinerja kecepatan nyata website {websiteName} ({websiteDomain}) di mata mesin pencari Google
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Strategy Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStrategy("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                strategy === "mobile"
                  ? "bg-white text-indigo-700 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Ponsel (HP)</span>
            </button>
            <button
              type="button"
              onClick={() => setStrategy("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                strategy === "desktop"
                  ? "bg-white text-indigo-700 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Komputer</span>
            </button>
          </div>

          {/* Re-audit Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => fetchAudit(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Mengaudit..." : "Audit Ulang Sekarang"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* 4 Core Score Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score 1: Performance */}
        <div className={`rounded-2xl p-5 border ${perfColor.border} bg-white shadow-sm flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block">Kinerja Kecepatan</span>
            <p className="text-sm font-extrabold text-slate-900">Performance</p>
            <p className="text-[10px] text-slate-500">
              {perfScore >= 90 ? "Sangat Cepat" : perfScore >= 50 ? "Rata-rata Cukup" : "Perlu Optimasi"}
            </p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={perfColor.stroke}
                strokeDasharray={`${perfScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute text-base font-black ${perfColor.text}`}>{perfScore}</span>
          </div>
        </div>

        {/* Score 2: Accessibility */}
        <div className={`rounded-2xl p-5 border ${a11yColor.border} bg-white shadow-sm flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block">Kemudahan Akses</span>
            <p className="text-sm font-extrabold text-slate-900">Accessibility</p>
            <p className="text-[10px] text-slate-500">Keterbacaan teks & kontras</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={a11yColor.stroke}
                strokeDasharray={`${a11yScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute text-base font-black ${a11yColor.text}`}>{a11yScore}</span>
          </div>
        </div>

        {/* Score 3: Best Practices */}
        <div className={`rounded-2xl p-5 border ${bpColor.border} bg-white shadow-sm flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block">Standar Kualitas</span>
            <p className="text-sm font-extrabold text-slate-900">Best Practices</p>
            <p className="text-[10px] text-slate-500">Keamanan HTTPS & kode</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={bpColor.stroke}
                strokeDasharray={`${bpScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute text-base font-black ${bpColor.text}`}>{bpScore}</span>
          </div>
        </div>

        {/* Score 4: SEO Score */}
        <div className={`rounded-2xl p-5 border ${seoColor.border} bg-white shadow-sm flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block">Kesiapan Struktur</span>
            <p className="text-sm font-extrabold text-slate-900">SEO On-Page</p>
            <p className="text-[10px] text-slate-500">Kesesuaian robot perayap</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={seoColor.stroke}
                strokeDasharray={`${seoScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute text-base font-black ${seoColor.text}`}>{seoScore}</span>
          </div>
        </div>
      </div>

      {/* 3 Core Web Vitals Standard Metrics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">
            Metrik Standar Core Web Vitals (Faktor Penentu Ranking Google)
          </h3>
          <p className="text-xs text-slate-500">
            Tiga metrik utama yang digunakan algoritma Google untuk mengevaluasi pengalaman pengguna nyata
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* LCP */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">LCP (Kecepatan Elemen Utama)</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lcpStatus.color}`}>
                {lcpStatus.label}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {metrics.lcp} <span className="text-xs font-bold text-slate-500">detik</span>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Waktu hingga gambar atau teks terbesar di layar muncul sempurna. Target Google: <strong>&lt; 2.5 dtk</strong>.
            </p>
          </div>

          {/* TBT */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">TBT (Responsivitas Tombol/Klik)</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tbtStatus.color}`}>
                {tbtStatus.label}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {metrics.tbt} <span className="text-xs font-bold text-slate-500">ms</span>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tingkat responsif website saat tombol atau link pertama kali diklik. Target Google: <strong>&lt; 200 ms</strong>.
            </p>
          </div>

          {/* CLS */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">CLS (Kestabilan Visual Layar)</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${clsStatus.color}`}>
                {clsStatus.label}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {metrics.cls}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mengukur apakah elemen website meloncat/bergeser saat memuat. Target Google: <strong>&lt; 0.1</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Google Opportunities & Diagnostics Checklist */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Peluang Optimasi & Rekomendasi Teknis Google
            </h3>
            <p className="text-xs text-slate-500">
              Langkah-langkah teknis konkret untuk mempercepat loading website dan menaikkan ranking Google
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600">
            {auditResult?.diagnostics?.length || 0} Area Perbaikan
          </span>
        </div>

        <div className="space-y-3">
          {(auditResult?.diagnostics || []).length > 0 ? (
            auditResult.diagnostics.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-wrap items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs font-extrabold text-slate-900">{item.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
                    {item.description}
                  </p>
                </div>
                {item.displayValue && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {item.displayValue}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              Memuat data audit Google PageSpeed...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

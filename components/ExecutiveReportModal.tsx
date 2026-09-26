"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Share2,
  Check,
  Globe,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Award,
  Sparkles,
  Download,
} from "lucide-react";
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
  formatDateLabel,
  getCountryDisplay,
} from "@/lib/view-helpers";

interface ExecutiveReportModalProps {
  data: any;
  isComparing?: boolean;
  onClose: () => void;
}

export function ExecutiveReportModal({
  data,
  isComparing = true,
  onClose,
}: ExecutiveReportModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const website = data?.website || {};
  const websiteName = website.name || "Website";
  const websiteDomain = website.domain || "";
  const periodLabel = data?.selected?.period_label || "Periode Aktif";
  const prevPeriodLabel = (data?.comparePeriod || data?.previous)?.period_label;

  const comparisons = data?.comparisons || {};
  const gscClicks = comparisons["gsc.clicks"] || { current: 0, previous: 0, percent: null };
  const gscImpressions = comparisons["gsc.impressions"] || { current: 0, previous: 0, percent: null };
  const gscCtr = comparisons["gsc.ctr"] || { current: 0, previous: 0, percent: null };
  const gscPos = comparisons["gsc.average_position"] || { current: 0, previous: 0, percent: null };
  const gaUsers = comparisons["ga.active_users"] || { current: 0, previous: 0, percent: null };
  const gaSessions = comparisons["ga.sessions"] || { current: 0, previous: 0, percent: null };
  const gaConversion = comparisons["ga.chat_conversion_rate"] || { current: 0, previous: 0, percent: null };

  const topPages = (data?.topGscPages?.web || []).slice(0, 10);
  const topQueries = (data?.topQueries?.web || []).slice(0, 10);
  const devices = data?.devices?.web || [];

  // Health Score Calculation
  let healthScore = 70;
  if ((gscClicks.percent || 0) > 0) healthScore += 10;
  if ((gaUsers.percent || 0) > 0) healthScore += 10;
  if ((gscPos.current || 0) > 0 && (gscPos.current || 0) <= 15) healthScore += 10;
  healthScore = Math.min(100, Math.max(30, healthScore));

  const healthStatus =
    healthScore >= 80
      ? { label: "Sangat Prima", color: "text-emerald-700 bg-emerald-50 border-emerald-300" }
      : healthScore >= 60
      ? { label: "Sehat & Stabil", color: "text-amber-700 bg-amber-50 border-amber-300" }
      : { label: "Perlu Evaluasi", color: "text-rose-700 bg-rose-50 border-rose-300" };

  // ROI Estimation
  const cpc = 2500; // Rp 2.500
  const adSavings = Math.round((gscClicks.current || 0) * cpc);
  const estimatedDeals = Math.max(0, Math.round((gscClicks.current || 0) * 0.05 * 0.15));
  const estimatedRevenue = estimatedDeals * 350000;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyClientLink = () => {
    const token = website.public_token || "";
    const clientUrl = token
      ? `${window.location.origin}/report/${token}`
      : window.location.href;

    navigator.clipboard.writeText(clientUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto print:border-none print:shadow-none print:rounded-none print:my-0">
        {/* Modal Top Control Bar (Hidden when Printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-sm tracking-wide">
              Pratinjau Dokumen Laporan Eksekutif A4 Resmi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyClientLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/10"
              title="Salin tautan laporan yang dapat dibuka oleh klien / bos tanpa perlu login"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Tersalin!" : "Salin Link Klien"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-md shadow-indigo-600/30"
              title="Cetak atau Simpan sebagai PDF dokumen ini"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-2"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 sm:p-12 space-y-8 print:p-0 print:space-y-6 text-slate-900 bg-white">
          {/* Document Header & Kop */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  CONFIDENTIAL EXECUTIVE REPORT
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Google Search & Analytics Certified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                LAPORAN KINERJA & KESEHATAN WEBSITE
              </h1>
              <p className="text-sm font-bold text-slate-600">
                Entitas: <strong className="text-slate-900 font-extrabold">{websiteName}</strong> ({websiteDomain})
              </p>
            </div>

            <div className="text-right space-y-1 sm:border-l sm:border-slate-200 sm:pl-6 text-xs">
              <p className="text-slate-400 font-medium">Periode Evaluasi:</p>
              <p className="font-extrabold text-slate-900 text-sm">{periodLabel}</p>
              {isComparing && prevPeriodLabel && (
                <p className="text-[11px] text-amber-700 font-semibold">
                  Pembanding: vs {prevPeriodLabel}
                </p>
              )}
              <p className="text-[10px] text-slate-400 pt-1">
                Diterbitkan pada: {currentDateFormatted}
              </p>
            </div>
          </div>

          {/* Section 1: Health Score & Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Indeks Kesehatan Website
              </p>
              <div className="w-24 h-24 rounded-full border-4 border-indigo-600 flex items-center justify-center bg-white shadow-inner">
                <span className="text-3xl font-black text-slate-900">{healthScore}</span>
                <span className="text-xs text-slate-400 font-bold">/100</span>
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${healthStatus.color}`}>
                Status: {healthStatus.label}
              </span>
            </div>

            <div className="md:col-span-2 space-y-3">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rangkuman Evaluasi Eksekutif</span>
              </p>
              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Daya Tarik Kunjungan Organik:</strong> Website berhasil mengumpulkan{" "}
                    <strong>{formatNumber(gscClicks.current)} klik</strong> dari total{" "}
                    <strong>{formatCompactNumber(gscImpressions.current)} penayangan</strong> di Google.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Efisiensi Anggaran Promosi:</strong> Trafik organik ini memberikan estimasi penghematan biaya iklan Google Ads setara{" "}
                    <strong>{formatRupiah(adSavings)}</strong> selama periode ini.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peluang Pertumbuhan Bisnis:</strong> Potensi perolehan omset bisnis dari pencari aktif Google diproyeksikan bernilai{" "}
                    <strong>{formatRupiah(estimatedRevenue)}</strong>.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Core KPI Performance Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Tabel Kinerja Indikator Utama (Key Performance Indicators)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-extrabold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Metrik Kinerja</th>
                    <th className="py-2.5 px-3">Sumber Data</th>
                    <th className="py-2.5 px-3 text-right">Nilai Periode Ini</th>
                    {isComparing && prevPeriodLabel && (
                      <>
                        <th className="py-2.5 px-3 text-right text-amber-800">Periode Lalu</th>
                        <th className="py-2.5 px-3 text-center">Tren Perubahan</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Total Klik Organik</td>
                    <td className="py-2.5 px-3 text-slate-500">Google Search</td>
                    <td className="py-2.5 px-3 text-right font-black text-indigo-700">
                      {formatNumber(gscClicks.current)}
                    </td>
                    {isComparing && prevPeriodLabel && (
                      <>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                          {formatNumber(gscClicks.previous || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {gscClicks.percent !== null ? (
                            <span className={gscClicks.percent >= 0 ? "text-emerald-600" : "text-rose-600"}>
                              {gscClicks.percent >= 0 ? "+" : ""}{formatPercent(gscClicks.percent)}
                            </span>
                          ) : "-"}
                        </td>
                      </>
                    )}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Total Penayangan (Impresi)</td>
                    <td className="py-2.5 px-3 text-slate-500">Google Search</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatCompactNumber(gscImpressions.current)}
                    </td>
                    {isComparing && prevPeriodLabel && (
                      <>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                          {formatCompactNumber(gscImpressions.previous || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {gscImpressions.percent !== null ? (
                            <span className={gscImpressions.percent >= 0 ? "text-emerald-600" : "text-rose-600"}>
                              {gscImpressions.percent >= 0 ? "+" : ""}{formatPercent(gscImpressions.percent)}
                            </span>
                          ) : "-"}
                        </td>
                      </>
                    )}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Rasio Klik Tayang (CTR)</td>
                    <td className="py-2.5 px-3 text-slate-500">Google Search</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatPercent((gscCtr.current || 0) * 100, 2)}
                    </td>
                    {isComparing && prevPeriodLabel && (
                      <>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                          {formatPercent((gscCtr.previous || 0) * 100, 2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {gscCtr.percent !== null ? (
                            <span className={gscCtr.percent >= 0 ? "text-emerald-600" : "text-rose-600"}>
                              {gscCtr.percent >= 0 ? "+" : ""}{formatPercent(gscCtr.percent)}
                            </span>
                          ) : "-"}
                        </td>
                      </>
                    )}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Posisi Rata-rata di Google</td>
                    <td className="py-2.5 px-3 text-slate-500">Google Search</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatPosition(gscPos.current)}
                    </td>
                    {isComparing && prevPeriodLabel && (
                      <>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                          {formatPosition(gscPos.previous)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {gscPos.percent !== null ? (
                            <span className={gscPos.percent <= 0 ? "text-emerald-600" : "text-rose-600"}>
                              {gscPos.percent <= 0 ? "Naik" : "Turun"}
                            </span>
                          ) : "-"}
                        </td>
                      </>
                    )}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Pengguna Aktif Website</td>
                    <td className="py-2.5 px-3 text-slate-500">Google Analytics 4</td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-700">
                      {formatNumber(gaUsers.current)}
                    </td>
                    {isComparing && prevPeriodLabel && (
                      <>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                          {formatNumber(gaUsers.previous || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {gaUsers.percent !== null ? (
                            <span className={gaUsers.percent >= 0 ? "text-emerald-600" : "text-rose-600"}>
                              {gaUsers.percent >= 0 ? "+" : ""}{formatPercent(gaUsers.percent)}
                            </span>
                          ) : "-"}
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Two Columns (Top 5 Pages & Top 5 Queries) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top 5 Pages */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Top Halaman Paling Banyak Dikunjungi
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">Halaman</th>
                      <th className="py-2 px-2.5 text-right">Klik</th>
                      <th className="py-2 px-2.5 text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topPages.slice(0, 5).map((p: any, idx: number) => {
                      let path = p.page;
                      try { path = new URL(p.page).pathname || "/"; } catch {}
                      return (
                        <tr key={idx}>
                          <td className="py-1.5 px-2.5 font-mono text-slate-800 truncate max-w-[180px]">
                            {path}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                            {formatNumber(p.clicks)}
                          </td>
                          <td className="py-1.5 px-2.5 text-right text-slate-600">
                            {formatPercent((p.ctr || 0) * 100)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 Queries */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Top Kata Kunci Pencari di Google
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">Kata Kunci</th>
                      <th className="py-2 px-2.5 text-right">Klik</th>
                      <th className="py-2 px-2.5 text-center">Posisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topQueries.slice(0, 5).map((q: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2.5 font-medium text-slate-800 truncate max-w-[180px]">
                          {q.query}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                          {formatNumber(q.clicks)}
                        </td>
                        <td className="py-1.5 px-2.5 text-center font-bold text-indigo-700">
                          #{formatPosition(q.averagePosition)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 4: Strategic Recommendations */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
              Rekomendasi Langkah Strategis Periode Selanjutnya
            </h4>
            <ul className="text-xs text-indigo-900 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Fokus pada Peluang Emas:</strong> Prioritaskan penguatan konten pada kata kunci di posisi 11–20 untuk mendorongnya masuk ke Halaman 1 Google.
              </li>
              <li>
                <strong>Optimasi Call-to-Action (CTA):</strong> Pasang tombol WhatsApp mengambang (*floating button*) yang responsif pada halaman dengan klik tertinggi untuk memaksimalkan konversi transaksi.
              </li>
              <li>
                <strong>Konsistensi Pembaruan:</strong> Pertahankan penambahan artikel informatif secara teratur agar reputasi domain di mata Google terus menguat.
              </li>
            </ul>
          </div>

          {/* Section 5: Signature Approval Blocks */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-14">
              <p className="font-bold text-slate-600">Disiapkan Oleh:</p>
              <div className="border-t border-slate-400 mx-12 pt-2">
                <p className="font-extrabold text-slate-900">Tim Analis Web & SEO</p>
                <p className="text-[10px] text-slate-500">Website Health System</p>
              </div>
            </div>

            <div className="space-y-14">
              <p className="font-bold text-slate-600">Ditinjau & Disetujui Oleh:</p>
              <div className="border-t border-slate-400 mx-12 pt-2">
                <p className="font-extrabold text-slate-900">Pimpinan / Klien</p>
                <p className="text-[10px] text-slate-500">{websiteName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

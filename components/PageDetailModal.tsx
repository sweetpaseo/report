"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Search,
  MousePointer,
  Eye,
  TrendingUp,
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
} from "lucide-react";
import {
  formatNumber,
  formatPercent,
  formatPosition,
  formatCompactNumber,
} from "@/lib/view-helpers";

interface PageDetailModalProps {
  page: any;
  allQueries?: any[];
  devices?: any[];
  periodLabel?: string;
  prevPeriodLabel?: string;
  isComparing?: boolean;
  onClose: () => void;
}

export function PageDetailModal({
  page,
  allQueries = [],
  devices = [],
  periodLabel = "Periode Terpilih",
  prevPeriodLabel,
  isComparing = false,
  onClose,
}: PageDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!page) return null;

  let pathname = page.page;
  try {
    const u = new URL(page.page);
    pathname = u.pathname || "/";
  } catch {}

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(page.page);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find relevant queries for this specific page by matching slug keywords
  const matchedQueries = useMemo(() => {
    const slugWords = pathname
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 2);

    if (slugWords.length === 0) return allQueries.slice(0, 8);

    const matches = allQueries.filter((q: any) => {
      const qText = (q.query || "").toLowerCase();
      return slugWords.some((sw: string) => qText.includes(sw));
    });

    if (matches.length > 0) return matches;
    return allQueries.slice(0, 6);
  }, [pathname, allQueries]);

  const clicks = page.clicks || 0;
  const impressions = page.impressions || 0;
  const ctr = page.ctr || 0;
  const pos = page.averagePosition || 0;

  // SEO Health Diagnosis for this page
  const seoDiagnosis = useMemo(() => {
    if (clicks > 50 && pos <= 5) {
      return {
        badge: "Halaman Bintang (Star Performer)",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
        message: "Halaman ini memiliki performa prima di Google dengan peringkat teratas. Pertahankan keakuratan konten dan pastikan call-to-action (tombol WhatsApp/kontak) jelas terlihat agar pengunjung langsung terkonversi menjadi pembeli.",
      };
    }
    if (impressions > 100 && ctr < 0.03) {
      return {
        badge: "Peluang Optimasi CTR",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        message: "Halaman ini sering muncul di Google (impresi tinggi), tetapi jarang diklik orang. Judul artikel (Title Tag) atau deskripsinya kemungkinan kurang menggugah rasa penasaran audiens. Buat judul yang lebih menarik minat klik!",
      };
    }
    if (pos > 10 && pos <= 20) {
      return {
        badge: "Potensial Halaman 1",
        badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
        message: "Halaman ini berada di halaman ke-2 Google (posisi 11–20). Sedikit penambahan konten, penataan heading H2/H3, dan internal link dari halaman lain berpeluang besar mendongkraknya langsung ke halaman pertama!",
      };
    }
    return {
      badge: "Halaman Bertumbuh",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
      message: "Halaman ini aktif terindeks di mesin pencari Google. Rutin perbarui informasi dan tambahkan visual pendukung agar peringkat dan waktu baca audiens meningkat.",
    };
  }, [clicks, impressions, ctr, pos]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Bedah Detail Halaman
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${seoDiagnosis.badgeColor}`}>
                {seoDiagnosis.badge}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 font-mono truncate" title={page.page}>
              {pathname}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors shadow-2xs"
              title="Salin tautan URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={page.page}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
              title="Buka halaman di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-400">Total Klik</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                {formatNumber(clicks)}
              </p>
              {isComparing && prevPeriodLabel && page.clicksDiff !== undefined && (
                <span className={`text-[10px] font-bold ${page.clicksDiff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {page.clicksDiff >= 0 ? `+${page.clicksDiff}` : page.clicksDiff} vs lalu
                </span>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-400">Total Tayang</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                {formatCompactNumber(impressions)}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">di hasil Google</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-400">Rasio Klik (CTR)</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                {formatPercent(ctr * 100)}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">persentase tayang jadi klik</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-400">Peringkat Rata-rata</p>
              <p className="text-xl font-extrabold text-indigo-600 mt-0.5 tabular-nums">
                {formatPosition(pos)}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">
                {pos <= 10 && pos > 0 ? "Halaman 1 Google" : "Halaman 2+ Google"}
              </span>
            </div>
          </div>

          {/* AI Guidance Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-900">Analisis Kinerja & Saran Tindakan:</p>
              <p className="text-xs text-indigo-950 leading-relaxed font-normal">
                {seoDiagnosis.message}
              </p>
            </div>
          </div>

          {/* Related Queries Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" /> Kata Kunci Utama Pemicu Halaman Ini
              </h3>
              <span className="text-[11px] text-slate-400">
                {matchedQueries.length} query terdeteksi
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left data-table">
                <thead className="bg-slate-50">
                  <tr>
                    <th>Kata Kunci (Query)</th>
                    <th className="right">Klik</th>
                    <th className="right">Tayang</th>
                    <th className="right">CTR</th>
                    <th className="center">Posisi</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedQueries.map((q: any, idx: number) => {
                    const qPos = q.averagePosition || 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="font-semibold text-slate-900">{q.query}</td>
                        <td className="right font-bold text-slate-900">{formatNumber(q.clicks)}</td>
                        <td className="right text-slate-600">{formatNumber(q.impressions)}</td>
                        <td className="right text-slate-600">{formatPercent(q.ctr * 100)}</td>
                        <td className="center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            qPos <= 10 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            Pos {formatPosition(qPos)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">
            Data berasal dari Google Search Console periode <strong className="text-slate-800">{periodLabel}</strong>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

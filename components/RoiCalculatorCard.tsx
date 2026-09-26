"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Settings2, HelpCircle, Check, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/view-helpers";
import { InfoTooltip } from "@/components/InfoTooltip";

interface RoiCalculatorCardProps {
  websiteId: string;
  websiteName: string;
  organicClicks: number;
  periodLabel: string;
}

export function RoiCalculatorCard({
  websiteId,
  websiteName,
  organicClicks,
  periodLabel,
}: RoiCalculatorCardProps) {
  // Default values
  const [cpc, setCpc] = useState(2500); // Rp 2.500 per click in Google Ads
  const [convRate, setConvRate] = useState(15); // 15% WA conversion rate
  const [aov, setAov] = useState(350000); // Rp 350.000 Average Order Value
  const [showSettings, setShowSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from localStorage per website
  useEffect(() => {
    if (!websiteId) return;
    try {
      const stored = localStorage.getItem(`roi_settings_${websiteId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.cpc) setCpc(parsed.cpc);
        if (parsed.convRate) setConvRate(parsed.convRate);
        if (parsed.aov) setAov(parsed.aov);
      }
    } catch {}
  }, [websiteId]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        `roi_settings_${websiteId}`,
        JSON.stringify({ cpc, convRate, aov })
      );
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setShowSettings(false);
      }, 1000);
    } catch {}
  };

  // Calculations
  // 1. Google Ads Cost Savings = Clicks * CPC
  const adSavings = Math.round(organicClicks * cpc);

  // 2. Estimated Inquiries (e.g., 5% of visitors contact via WA/phone)
  const inquiryRate = 0.05;
  const estimatedInquiries = Math.max(1, Math.round(organicClicks * inquiryRate));

  // 3. Estimated Deals = Inquiries * Closing Rate
  const estimatedDeals = Math.max(0, Math.round(estimatedInquiries * (convRate / 100)));

  // 4. Estimated Revenue Opportunity = Deals * Average Order Value
  const estimatedRevenue = estimatedDeals * aov;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-emerald-500/20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Estimasi Nilai Bisnis & Penghematan Iklan
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ROI Organik
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                Konversi traffic organik Google menjadi estimasi nilai rupiah nyata bagi {websiteName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors border border-white/10 shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showSettings ? "Tutup Parameter" : "Sesuaikan Asumsi"}</span>
          </button>
        </div>

        {/* Settings Popdown */}
        {showSettings && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10 space-y-3"
          >
            <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Sesuaikan Asumsi Model Bisnis Anda:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Biaya Iklan Google Ads (CPC Rata-rata)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cpc}
                    onChange={(e) => setCpc(Number(e.target.value))}
                    step="500"
                    min="500"
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Biaya jika Anda pasang Google Ads berbayar</p>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Rata-rata Nilai Order / Transaksi (AOV)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={aov}
                    onChange={(e) => setAov(Number(e.target.value))}
                    step="50000"
                    min="10000"
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Rata-rata nominal belanja 1 pelanggan</p>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Rasio Closing Konsultasi WhatsApp (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={convRate}
                    onChange={(e) => setConvRate(Number(e.target.value))}
                    step="1"
                    min="1"
                    max="100"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Persentase chat WA yang deal/membeli</p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <span>Simpan Parameter</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 3 Big Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Metric 1: Ad Savings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-200">Penghematan Iklan Google Ads</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200">
                Cost Saved
              </span>
            </div>
            <p className="text-2xl font-black text-white tracking-tight tabular-nums">
              {formatRupiah(adSavings)}
            </p>
            <p className="text-[10px] text-emerald-200/80 leading-relaxed">
              Biaya yang harus Anda bayar ke Google jika {formatNumber(organicClicks)} klik ini diperoleh dari Google Ads (Rp {formatNumber(cpc)}/klik).
            </p>
          </div>

          {/* Metric 2: Estimated Revenue Opportunity */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-teal-200">Estimasi Potensi Omset Bisnis</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-200">
                Peluang Omset
              </span>
            </div>
            <p className="text-2xl font-black text-white tracking-tight tabular-nums">
              {formatRupiah(estimatedRevenue)}
            </p>
            <p className="text-[10px] text-teal-200/80 leading-relaxed">
              Proyeksi dari estimasi {estimatedDeals} transaksi deal (@ {formatRupiah(aov)}) dari pengunjung pencari Google pada {periodLabel}.
            </p>
          </div>

          {/* Metric 3: Total Organic Business Impact */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/30 rounded-xl p-4 border border-emerald-400/30 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-100">Efisiensi Investasi Website</p>
              <TrendingUp className="w-4 h-4 text-emerald-300" />
            </div>
            <p className="text-2xl font-black text-emerald-300 tracking-tight tabular-nums">
              +{formatNumber(organicClicks)} Pengunjung
            </p>
            <p className="text-[10px] text-emerald-100/80 leading-relaxed">
              Traffic organik bebas biaya per klik, memberikan aliran calon pembeli secara stabil 24 jam non-stop tanpa biaya tayang harian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

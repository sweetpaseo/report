"use client";

import React, { useState } from "react";
import { Sparkline } from "@/components/sparkline";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Search,
  LineChart,
} from "lucide-react";

interface OverviewViewProps {
  data: any;
  onSelectTab: (tab: any) => void;
}

export function OverviewView({ data, onSelectTab }: OverviewViewProps) {
  const comparisons = data?.comparisons || {};
  const gscClicks = comparisons["gsc.clicks"] || { current: 18629, percent: 32.5 };
  const gscImpressions = comparisons["gsc.impressions"] || { current: 1020000, percent: 18.6 };
  const gaUsers = comparisons["ga.active_users"] || { current: 23540, percent: 27.1 };
  const gaSessions = comparisons["ga.sessions"] || { current: 28990, percent: 23.4 };
  const gaConversion = comparisons["ga.chat_conversion_rate"] || { current: 2.35, percent: 15.8 };

  const topQueries = data?.topQueries?.web || [];
  const topGscPages = data?.topGscPages?.web || [];
  const channels = data?.channels || [];
  const events = data?.events || [];

  return (
    <div className="space-y-6">
      {/* Top 5 KPI Cards Grid with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* KPI 1: Total Klik */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <MousePointer className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Total Klik (Google)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {gscClicks.current?.toLocaleString("id-ID") || "18.629"}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{gscClicks.percent ? `${gscClicks.percent.toFixed(1)}%` : "32.5%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[12, 14, 18, 15, 22, 25, 28, 32, 35, 38]} strokeColor="#8b5cf6" />
          </div>
        </div>

        {/* KPI 2: Total Tayang */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Eye className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Total Tayang (Google)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {gscImpressions.current ? `${(gscImpressions.current / 1000000).toFixed(2)} jt` : "1,02 jt"}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{gscImpressions.percent ? `${gscImpressions.percent.toFixed(1)}%` : "18.6%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[40, 42, 45, 43, 48, 52, 55, 58, 60, 64]} strokeColor="#6366f1" />
          </div>
        </div>

        {/* KPI 3: Total Pengguna */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Total Pengguna (GA)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {gaUsers.current?.toLocaleString("id-ID") || "23.540"}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{gaUsers.percent ? `${gaUsers.percent.toFixed(1)}%` : "27.1%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[15, 18, 17, 21, 25, 23, 28, 31, 34, 36]} strokeColor="#3b82f6" />
          </div>
        </div>

        {/* KPI 4: Sesi GA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Sesi (GA)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {gaSessions.current?.toLocaleString("id-ID") || "28.990"}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{gaSessions.percent ? `${gaSessions.percent.toFixed(1)}%` : "23.4%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[20, 22, 24, 23, 27, 29, 31, 35, 38, 40]} strokeColor="#0284c7" />
          </div>
        </div>

        {/* KPI 5: Rasio Konversi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Rasio Konversi (GA)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {gaConversion.current ? `${gaConversion.current}%` : "2,35%"}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{gaConversion.percent ? `${gaConversion.percent.toFixed(1)}%` : "15.8%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[1.8, 1.9, 2.0, 2.1, 2.2, 2.1, 2.3, 2.35, 2.4, 2.45]} strokeColor="#10b981" />
          </div>
        </div>
      </div>

      {/* AI Insight Mascot Banner Card */}
      <div className="robot-mascot-banner flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-200" />
            <h2 className="text-lg font-extrabold text-slate-900">Insight Otomatis</h2>
            <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full">Baru</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 pt-1">
            <div className="space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" /> Ringkasan Periode Ini
              </p>
              <p className="text-slate-600 leading-relaxed">
                Performa website Anda meningkat! Klik naik 32,5% dan pengguna naik 27,1% dibanding periode sebelumnya.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-600" /> Kenapa Ini Penting?
              </p>
              <p className="text-slate-600 leading-relaxed">
                Peningkatan trafik dan klik berarti lebih banyak calon pelanggan menemukan Anda di Google Search.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> Yang Disarankan
              </p>
              <p className="text-slate-600 leading-relaxed">
                Perkuat konten pipa HDPE & SNI dengan FAQ dan video, serta optimalkan internal link ke halaman produk.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="robot-3d-graphic">
            <Bot className="w-12 h-12 text-white" />
          </div>
          <button
            onClick={() => onSelectTab("ai_insight")}
            className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Lihat semua insight <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Performance Line Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Search Performance Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" /> Performa di Google Search
              </h3>
            </div>
            <button onClick={() => onSelectTab("search_performance")} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              Lihat detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 bg-slate-50/50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1 text-purple-600"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Klik</span>
              <span className="flex items-center gap-1 text-sky-500"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Tayang</span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-1 pt-4">
              {[40, 45, 55, 60, 75, 80, 70, 85, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-indigo-500/20 rounded-t" style={{ height: `${h}%` }}>
                    <div className="w-full bg-purple-600 rounded-t" style={{ height: `${h * 0.6}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">{i * 3 + 1} Mei</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Analytics Performance Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <LineChart className="w-4 h-4 text-indigo-600" /> Performa di Google Analytics
              </h3>
            </div>
            <button onClick={() => onSelectTab("analytics_performance")} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              Lihat detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 bg-slate-50/50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1 text-blue-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Pengguna</span>
              <span className="flex items-center gap-1 text-emerald-500"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sesi</span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-1 pt-4">
              {[35, 42, 48, 52, 68, 74, 82, 88, 92, 98].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-blue-500/20 rounded-t" style={{ height: `${h}%` }}>
                    <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${h * 0.75}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">{i * 3 + 1} Mei</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Section 1: Halaman Teratas, Query Teratas, Performa Perangkat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Pages Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Halaman Teratas (Google Search)</h4>
            <button onClick={() => onSelectTab("pages")} className="text-[11px] font-bold text-indigo-600">Lihat semua</button>
          </div>
          <div className="space-y-2">
            {[
              { path: "/pipa-hdpe", clicks: "3.245", ctr: "20,0%", pos: "1.2" },
              { path: "/pipa-ppr", clicks: "2.180", ctr: "20,1%", pos: "2.3" },
              { path: "/talang-air-pvc", clicks: "1.856", ctr: "22,0%", pos: "2.3" },
              { path: "/pipa-u-pvc", clicks: "1.402", ctr: "22,9%", pos: "2.4" },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                <span className="font-mono text-slate-800 truncate max-w-[120px]">{row.path}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{row.clicks}</span>
                  <span className="pos-badge pos-badge-green">{row.pos}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Queries Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Query Teratas (Google Search)</h4>
            <button onClick={() => onSelectTab("queries")} className="text-[11px] font-bold text-indigo-600">Lihat semua</button>
          </div>
          <div className="space-y-2">
            {[
              { query: "pipa hdpe sni", clicks: "1.245", ctr: "68,0%", pos: "1" },
              { query: "pipa ppr sni", clicks: "987", ctr: "41,3%", pos: "2" },
              { query: "talang air pvc", clicks: "876", ctr: "22,5%", pos: "3" },
              { query: "harga pipa hdpe", clicks: "543", ctr: "9,2%", pos: "5" },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                <span className="font-semibold text-slate-800 truncate max-w-[130px]">{row.query}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{row.clicks}</span>
                  <span className="pos-badge pos-badge-green">{row.pos}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Performance Donut Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Performa Perangkat (Analytics)</h4>
            <button onClick={() => onSelectTab("devices")} className="text-[11px] font-bold text-indigo-600">Lihat detail</button>
          </div>
          <div className="flex items-center justify-around py-2">
            <div className="w-24 h-24 rounded-full border-8 border-indigo-600 border-t-emerald-500 border-r-amber-400 flex items-center justify-center font-extrabold text-xs text-slate-700">
              Mobile 68.7%
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Mobile: 68,7%</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Desktop: 28,3%</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Tablet: 3,0%</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center">Mobile menjadi sumber trafik utama Anda.</p>
        </div>
      </div>
    </div>
  );
}

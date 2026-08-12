"use client";

import React, { useState } from "react";
import { Sparkline } from "@/components/sparkline";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Users,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Search,
  LineChart as LineChartIcon,
} from "lucide-react";

const gscChartData = [
  { date: "1 Mei", klik: 850, tayang: 42000 },
  { date: "4 Mei", klik: 920, tayang: 45000 },
  { date: "8 Mei", klik: 1100, tayang: 48000 },
  { date: "11 Mei", klik: 1050, tayang: 46000 },
  { date: "15 Mei", klik: 1250, tayang: 56200 },
  { date: "18 Mei", klik: 1180, tayang: 54000 },
  { date: "22 Mei", klik: 1350, tayang: 58000 },
  { date: "25 Mei", klik: 1420, tayang: 62000 },
  { date: "28 Mei", klik: 1550, tayang: 65000 },
  { date: "31 Mei", klik: 1680, tayang: 68000 },
];

const gaChartData = [
  { date: "1 Mei", pengguna: 720, sesi: 950 },
  { date: "4 Mei", pengguna: 780, sesi: 1020 },
  { date: "8 Mei", pengguna: 850, sesi: 1100 },
  { date: "11 Mei", pengguna: 820, sesi: 1080 },
  { date: "15 Mei", pengguna: 910, sesi: 1180 },
  { date: "18 Mei", pengguna: 950, sesi: 1240 },
  { date: "22 Mei", pengguna: 1020, sesi: 1310 },
  { date: "25 Mei", pengguna: 1100, sesi: 1420 },
  { date: "28 Mei", pengguna: 1180, sesi: 1510 },
  { date: "31 Mei", pengguna: 1250, sesi: 1620 },
];

const deviceData = [
  { name: "Mobile", value: 68.7, color: "#6366f1" },
  { name: "Desktop", value: 28.3, color: "#10b981" },
  { name: "Tablet", value: 3.0, color: "#f59e0b" },
];

export function OverviewView({ data, onSelectTab }: { data: any; onSelectTab: (tab: any) => void }) {
  const comparisons = data?.comparisons || {};
  const gscClicks = comparisons["gsc.clicks"] || { current: 18629, percent: 32.5 };
  const gscImpressions = comparisons["gsc.impressions"] || { current: 1020000, percent: 18.6 };
  const gaUsers = comparisons["ga.active_users"] || { current: 23540, percent: 27.1 };
  const gaSessions = comparisons["ga.sessions"] || { current: 28990, percent: 23.4 };
  const gaConversion = comparisons["ga.chat_conversion_rate"] || { current: 2.35, percent: 15.8 };

  return (
    <div className="space-y-6">
      {/* Top 5 KPI Cards Grid with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* KPI 1: Total Klik */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
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
                <span>{gscClicks.percent ? `${gscClicks.percent.toFixed(1)}%` : "32,5%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[12, 14, 18, 15, 22, 25, 28, 32, 35, 38]} strokeColor="#8b5cf6" />
          </div>
        </div>

        {/* KPI 2: Total Tayang */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Eye className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Total Tayang (Google)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">1,02 jt</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{gscImpressions.percent ? `${gscImpressions.percent.toFixed(1)}%` : "18,6%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[40, 42, 45, 43, 48, 52, 55, 58, 60, 64]} strokeColor="#6366f1" />
          </div>
        </div>

        {/* KPI 3: Total Pengguna */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
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
                <span>{gaUsers.percent ? `${gaUsers.percent.toFixed(1)}%` : "27,1%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[15, 18, 17, 21, 25, 23, 28, 31, 34, 36]} strokeColor="#3b82f6" />
          </div>
        </div>

        {/* KPI 4: Sesi GA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
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
                <span>{gaSessions.percent ? `${gaSessions.percent.toFixed(1)}%` : "23,4%"}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[20, 22, 24, 23, 27, 29, 31, 35, 38, 40]} strokeColor="#0284c7" />
          </div>
        </div>

        {/* KPI 5: Rasio Konversi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Rasio Konversi (GA)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">2,35%</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>15,8%</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs 1 Apr - 30 Apr 2025</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[1.8, 1.9, 2.0, 2.1, 2.2, 2.1, 2.3, 2.35, 2.4, 2.45]} strokeColor="#10b981" />
          </div>
        </div>
      </div>

      {/* AI Mascot Card with Animated Pulse Graphic */}
      <div className="robot-mascot-banner flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-200 animate-spin" style={{ animationDuration: "6s" }} />
            <h2 className="text-lg font-extrabold text-slate-900">Insight Otomatis</h2>
            <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full animate-pulse">Baru</span>
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
          <div className="robot-3d-graphic animate-bounce" style={{ animationDuration: "3s" }}>
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

      {/* Main Performance Charts Grid (Interactive Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Search Performance Recharts Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" /> Performa di Google Search (GSC)
            </h3>
            <button onClick={() => onSelectTab("search_performance")} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              Lihat detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gscChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKlik" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Area type="monotone" dataKey="klik" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorKlik)" name="Klik" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Google Analytics Performance Recharts Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-indigo-600" /> Performa di Google Analytics (GA4)
            </h3>
            <button onClick={() => onSelectTab("analytics_performance")} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              Lihat detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPengguna" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSesi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Area type="monotone" dataKey="pengguna" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPengguna)" name="Pengguna" />
                <Area type="monotone" dataKey="sesi" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSesi)" name="Sesi" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Section 1: Halaman, Query, and Interactive Animated Device Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Pages Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Halaman Teratas (Google Search)</h4>
            <button onClick={() => onSelectTab("pages")} className="text-[11px] font-bold text-indigo-600">Lihat semua</button>
          </div>
          <div className="space-y-2">
            {[
              { path: "/pipa-hdpe", clicks: "3.245", pos: "1.2" },
              { path: "/pipa-ppr", clicks: "2.180", pos: "2.3" },
              { path: "/talang-air-pvc", clicks: "1.856", pos: "2.3" },
              { path: "/pipa-u-pvc", clicks: "1.402", pos: "2.4" },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs hover:bg-slate-100 transition-colors">
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
              { query: "pipa hdpe sni", clicks: "1.245", pos: "1" },
              { query: "pipa ppr sni", clicks: "987", pos: "2" },
              { query: "talang air pvc", clicks: "876", pos: "3" },
              { query: "harga pipa hdpe", clicks: "543", pos: "5" },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs hover:bg-slate-100 transition-colors">
                <span className="font-semibold text-slate-800 truncate max-w-[130px]">{row.query}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{row.clicks}</span>
                  <span className="pos-badge pos-badge-green">{row.pos}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Device Donut Recharts Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Performa Perangkat (Analytics)</h4>
            <button onClick={() => onSelectTab("devices")} className="text-[11px] font-bold text-indigo-600">Lihat detail</button>
          </div>

          <div className="h-40 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-bold pt-1">
            <span className="text-indigo-600">● Mobile 68,7%</span>
            <span className="text-emerald-600">● Desktop 28,3%</span>
            <span className="text-amber-500">● Tablet 3,0%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

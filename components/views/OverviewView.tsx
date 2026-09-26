"use client";

import React from "react";
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
  MousePointer,
  Eye,
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
import {
  formatDateLabel,
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
} from "@/lib/view-helpers";

export function OverviewView({
  data,
  onSelectTab,
  isComparing = true,
}: {
  data: any;
  onSelectTab: (tab: any) => void;
  isComparing?: boolean;
}) {
  const comparisons = data?.comparisons || {};
  const gscClicks = comparisons["gsc.clicks"] || { current: 0, percent: null };
  const gscImpressions = comparisons["gsc.impressions"] || { current: 0, percent: null };
  const gaUsers = comparisons["ga.active_users"] || { current: 0, percent: null };
  const gaSessions = comparisons["ga.sessions"] || { current: 0, percent: null };
  const gaConversion = comparisons["ga.chat_conversion_rate"] || { current: 0, percent: null };

  const periodLabel = data?.selected?.period_label || "Periode Terpilih";
  const prevPeriodLabel = (data?.comparePeriod || data?.previous)?.period_label;
  const vsText = isComparing && prevPeriodLabel ? `vs ${prevPeriodLabel}` : "Periode ini";

  // Trends
  const gscDaily = data?.trends?.gscWeb || [];
  const gscChartData = gscDaily.map((r: any) => ({
    date: formatDateLabel(r.date),
    klik: r.clicks || 0,
    tayang: r.impressions || 0,
    klikBandingkan: r.clicksCompare,
    tayangBandingkan: r.impressionsCompare,
  }));

  const gaDaily = data?.trends?.ga || [];
  const gaChartData = gaDaily.map((r: any) => ({
    date: formatDateLabel(r.date),
    pengguna: r.activeUsers || 0,
    sesi: r.newUsers || r.activeUsers || 0,
    penggunaBandingkan: r.activeUsersCompare,
  }));

  // Sparkline arrays
  const clicksSpark = gscDaily.length > 0 ? gscDaily.map((r: any) => r.clicks || 0) : [0, 0];
  const impressionsSpark = gscDaily.length > 0 ? gscDaily.map((r: any) => r.impressions || 0) : [0, 0];
  const usersSpark = gaDaily.length > 0 ? gaDaily.map((r: any) => r.activeUsers || 0) : [0, 0];
  const sessionsSpark = gaDaily.length > 0 ? gaDaily.map((r: any) => r.newUsers || r.activeUsers || 0) : [0, 0];

  // Top Pages & Queries
  const topPages = (data?.topGscPages?.web || []).slice(0, 5);
  const topQueries = (data?.topQueries?.web || []).slice(0, 5);

  // Devices Donut
  const rawDevices = data?.devices?.web || [];
  const totalDevClicks = rawDevices.reduce((sum: number, d: any) => sum + (d.clicks || 0), 0) || 1;
  const deviceColors: Record<string, string> = { MOBILE: "#6366f1", DESKTOP: "#10b981", TABLET: "#f59e0b" };
  const deviceData = rawDevices.length > 0
    ? rawDevices.map((d: any) => {
        const devName = String(d.device).toUpperCase();
        return {
          name: devName === "MOBILE" ? "Mobile" : devName === "DESKTOP" ? "Desktop" : "Tablet",
          value: Math.round(((d.clicks || 0) / totalDevClicks) * 1000) / 10,
          rawClicks: d.clicks || 0,
          color: deviceColors[devName] || "#6366f1",
        };
      })
    : [
        { name: "Mobile", value: 70, color: "#6366f1" },
        { name: "Desktop", value: 30, color: "#10b981" },
      ];

  const websiteName = data?.website?.name || "Website";

  // Dynamic AI Insight text
  const primaryInsight = data?.insights?.[0] || `Performa ${websiteName} menunjukkan total ${formatNumber(gscClicks.current)} klik organik pada ${periodLabel}.`;
  const actionSuggest = data?.anomalies?.[0]?.text || data?.analystNotes?.[0] || "Pertahankan publikasi konten berkualitas dan optimasi halaman dengan impresi tinggi.";

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
                {formatNumber(gscClicks.current)}
              </span>
              {gscClicks.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${gscClicks.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {gscClicks.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{formatPercent(Math.abs(gscClicks.percent))}</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{vsText}</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={clicksSpark} strokeColor="#8b5cf6" />
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
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {formatCompactNumber(gscImpressions.current)}
              </span>
              {gscImpressions.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${gscImpressions.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {gscImpressions.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{formatPercent(Math.abs(gscImpressions.percent))}</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{vsText}</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={impressionsSpark} strokeColor="#6366f1" />
          </div>
        </div>

        {/* KPI 3: Total Pengguna (GA) */}
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
                {formatNumber(gaUsers.current)}
              </span>
              {gaUsers.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${gaUsers.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {gaUsers.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{formatPercent(Math.abs(gaUsers.percent))}</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{vsText}</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={usersSpark} strokeColor="#3b82f6" />
          </div>
        </div>

        {/* KPI 4: Sesi (GA) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Sesi (GA)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {formatNumber(gaSessions.current)}
              </span>
              {gaSessions.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${gaSessions.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {gaSessions.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{formatPercent(Math.abs(gaSessions.percent))}</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{vsText}</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={sessionsSpark} strokeColor="#10b981" />
          </div>
        </div>

        {/* KPI 5: Rasio Konversi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Rasio Konversi (GA)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {formatPercent(gaConversion.current, 2)}
              </span>
              {gaConversion.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${gaConversion.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {gaConversion.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{formatPercent(Math.abs(gaConversion.percent))}</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{vsText}</p>
          </div>
          <div className="h-8 pt-1">
            <Sparkline values={[1.5, 1.8, 2.0, 2.2, gaConversion.current || 2.0]} strokeColor="#f59e0b" />
          </div>
        </div>
      </div>

      {/* AI Mascot Banner */}
      <div className="robot-mascot-banner flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-200 animate-spin" style={{ animationDuration: "6s" }} />
            <h2 className="text-lg font-extrabold text-slate-900">Insight Otomatis: {websiteName}</h2>
            <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full animate-pulse">Live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 pt-1">
            <div className="space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" /> Ringkasan Periode Ini
              </p>
              <p className="text-slate-600 leading-relaxed">
                {primaryInsight}
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-600" /> Kenapa Ini Penting?
              </p>
              <p className="text-slate-600 leading-relaxed">
                Peningkatan visibilitas pada Google Search mendatangkan audiens organik dengan niat beli tinggi tanpa biaya iklan per klik.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> Yang Disarankan
              </p>
              <p className="text-slate-600 leading-relaxed">
                {actionSuggest}
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
            {gscChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gscChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKlik" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="klik" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKlik)" name={`Klik (${periodLabel})`} />
                  {isComparing && prevPeriodLabel && (
                    <Area type="monotone" dataKey="klikBandingkan" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" fill="none" name={`Klik (${prevPeriodLabel})`} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data harian Google Search untuk periode ini.
              </div>
            )}
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
            {gaChartData.length > 0 ? (
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
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="pengguna" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPengguna)" name={`Pengguna (${periodLabel})`} />
                  <Area type="monotone" dataKey="sesi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSesi)" name="Sesi" />
                  {isComparing && prevPeriodLabel && (
                    <Area type="monotone" dataKey="penggunaBandingkan" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" fill="none" name={`Pengguna (${prevPeriodLabel})`} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data harian Google Analytics untuk periode ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Section: Halaman, Query, and Interactive Device Donut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Pages Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Halaman Teratas (Google Search)</h4>
            <button onClick={() => onSelectTab("pages")} className="text-[11px] font-bold text-indigo-600">Lihat semua</button>
          </div>
          <div className="space-y-2">
            {topPages.length > 0 ? (
              topPages.map((row: any, idx: number) => {
                let displayPath = row.page;
                try {
                  const u = new URL(row.page);
                  displayPath = u.pathname || "/";
                } catch {}
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs hover:bg-slate-100 transition-colors">
                    <span className="font-mono text-slate-800 truncate max-w-[140px]" title={row.page}>{displayPath}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{formatNumber(row.clicks)} klik</span>
                      <span className="pos-badge pos-badge-green">{formatPercent(row.ctr * 100)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data halaman.</p>
            )}
          </div>
        </div>

        {/* Top Queries Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Query Teratas (Google Search)</h4>
            <button onClick={() => onSelectTab("queries")} className="text-[11px] font-bold text-indigo-600">Lihat semua</button>
          </div>
          <div className="space-y-2">
            {topQueries.length > 0 ? (
              topQueries.map((row: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={row.query}>{row.query}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{formatNumber(row.clicks)} klik</span>
                    <span className="pos-badge pos-badge-green">Pos {formatPosition(row.averagePosition)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data query.</p>
            )}
          </div>
        </div>

        {/* Interactive Device Donut Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs">Performa Perangkat</h4>
            <button onClick={() => onSelectTab("devices")} className="text-[11px] font-bold text-indigo-600">Lihat detail</button>
          </div>

          <div className="h-40 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                  {deviceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${formatNumber(item?.payload?.rawClicks)} klik)`,
                    name,
                  ]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-bold pt-1">
            {deviceData.map((d: any, idx: number) => (
              <span key={idx} style={{ color: d.color }}>
                ● {d.name} {d.value}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

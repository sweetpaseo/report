"use client";

import React, { useMemo } from "react";
import { Users, Clock, Eye, TrendingUp, TrendingDown, Target, Sparkles, Share2 } from "lucide-react";
import { Sparkline } from "@/components/sparkline";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  formatDateLabel,
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatDuration,
} from "@/lib/view-helpers";

export function AnalyticsPerformanceView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const comparisons = data?.comparisons || {};
  const activeUsers = comparisons["ga.active_users"] || { current: 0, percent: null };
  const sessions = comparisons["ga.sessions"] || { current: 0, percent: null };
  const newUsers = comparisons["ga.new_users"] || { current: 0, percent: null };
  const pageViews = comparisons["ga.page_views"] || { current: 0, percent: null };
  const avgTime = data?.metrics?.["ga.average_engagement_seconds"] || 0;
  const conversionRate = comparisons["ga.chat_conversion_rate"] || { current: 0, percent: null };

  const periodLabel = data?.selected?.period_label || "Periode Terpilih";
  const prevPeriodLabel = (data?.comparePeriod || data?.previous)?.period_label;

  const gaDaily = data?.trends?.ga || [];
  const channels = data?.channels || [];
  const topPages = data?.topPages || [];

  const trendData = useMemo(() => {
    return gaDaily.map((r: any) => ({
      date: formatDateLabel(r.date),
      pengguna: r.activeUsers || 0,
      sesi: r.newUsers || r.activeUsers || 0,
      penggunaBandingkan: r.activeUsersCompare,
    }));
  }, [gaDaily]);

  const channelColors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-6">
      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
        {/* Card 1: Pengguna */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Pengguna Aktif</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
            {formatNumber(activeUsers.current)}
          </p>
          {activeUsers.percent !== null && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${activeUsers.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {activeUsers.percent >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(activeUsers.percent))}
            </span>
          )}
        </div>

        {/* Card 2: Sesi */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Total Sesi</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
            {formatNumber(sessions.current)}
          </p>
          {sessions.percent !== null && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${sessions.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {sessions.percent >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(sessions.percent))}
            </span>
          )}
        </div>

        {/* Card 3: Pengguna Baru */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Pengguna Baru</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
            {formatNumber(newUsers.current)}
          </p>
          {newUsers.percent !== null && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${newUsers.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {newUsers.percent >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(newUsers.percent))}
            </span>
          )}
        </div>

        {/* Card 4: Rata-rata Waktu */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Rata-rata Waktu</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
            {formatDuration(avgTime)}
          </p>
          <span className="text-[10px] font-bold text-slate-400">per sesi aktif</span>
        </div>

        {/* Card 5: Tayangan Halaman */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Tayangan Halaman</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
            {formatNumber(pageViews.current)}
          </p>
          {pageViews.percent !== null && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${pageViews.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {pageViews.percent >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(pageViews.percent))}
            </span>
          )}
        </div>

        {/* Card 6: Rasio Konversi */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Rasio Konversi</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
            {formatPercent(conversionRate.current, 2)}
          </p>
          {conversionRate.percent !== null && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${conversionRate.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {conversionRate.percent >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(conversionRate.percent))}
            </span>
          )}
        </div>
      </div>

      {/* Main Analytics Trends & Channel Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tren Pengguna & Sesi Recharts Card */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Tren Pengguna & Sesi Harian (GA4)</h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span> Pengguna
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Sesi
              </span>
            </div>
          </div>

          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGaUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorGaSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="pengguna" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGaUsers)" name={`Pengguna (${periodLabel})`} />
                  <Area type="monotone" dataKey="sesi" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGaSessions)" name="Sesi" />
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

        {/* Saluran Akuisisi Trafik (Top Channels) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" /> Saluran Akuisisi (Channels)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Distribusi sesi berdasarkan channel group</p>
          </div>

          <div className="space-y-3 my-auto">
            {channels.length > 0 ? (
              channels.slice(0, 5).map((ch: any, idx: number) => {
                const totalSessions = sessions.current || 1;
                const pct = Math.round(((ch.sessions || 0) / totalSessions) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{ch.channel}</span>
                      <span className="text-slate-600 font-bold">{formatNumber(ch.sessions)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(5, pct))}%`,
                          backgroundColor: channelColors[idx % channelColors.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada data channel.</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Total Channel: <strong>{channels.length}</strong></span>
            <span>Total Sesi: <strong>{formatNumber(sessions.current)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

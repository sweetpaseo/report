"use client";

import React from "react";
import { Users, Clock, Eye, TrendingUp, Sparkles, Filter, ArrowRight } from "lucide-react";
import { Sparkline } from "@/components/sparkline";

export function AnalyticsPerformanceView({ data }: { data: any }) {
  const comparisons = data?.comparisons || {};
  const users = comparisons["ga.active_users"] || { current: 23540, percent: 27.1 };
  const sessions = comparisons["ga.sessions"] || { current: 28990, percent: 23.4 };

  return (
    <div className="space-y-6">
      {/* 6 KPI Cards with Sparklines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400">Pengguna</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">23.540</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 27,1%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[10, 15, 20, 18, 25, 28]} strokeColor="#8b5cf6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400">Sesi</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">28.990</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 23,4%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[12, 16, 19, 22, 26, 30]} strokeColor="#6366f1" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400">Engagement Rate</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">62,7%</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 8,6%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[55, 58, 60, 61, 62, 62.7]} strokeColor="#3b82f6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400">Rata-rata Waktu</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">01:42</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 15,0%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[80, 85, 90, 95, 98, 102]} strokeColor="#0284c7" />
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400">Tayangan Halaman</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">56.200</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 18,8%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[40, 44, 48, 50, 53, 56.2]} strokeColor="#10b981" />
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400">Rasio Konversi</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">2,35%</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 15,8%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[1.9, 2.0, 2.1, 2.2, 2.3, 2.35]} strokeColor="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Main Analytics Trends & User Funnel Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tren Pengguna & Sesi */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Tren Pengguna & Sesi (Analytics)</h3>
            <select className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <option>Harian</option>
              <option>Mingguan</option>
              <option>Bulanan</option>
            </select>
          </div>
          <div className="h-60 bg-slate-50/50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1 text-purple-600"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Pengguna</span>
              <span className="flex items-center gap-1 text-sky-500"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Sesi</span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-1 pt-4">
              {[30, 38, 45, 52, 60, 72, 80, 85, 90, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-sky-500/20 rounded-t" style={{ height: `${h}%` }}>
                    <div className="w-full bg-purple-600 rounded-t" style={{ height: `${h * 0.7}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">{i * 3 + 1} Mei</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Perjalanan Pengguna Funnel Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Perjalanan Pengguna (Funnel)</h3>
          <div className="space-y-2 py-2">
            {[
              { label: "Pengguna", val: "23.540", drop: "100%", width: "100%", bg: "bg-purple-600" },
              { label: "Melihat Halaman", val: "56.200", drop: "-29.6%", width: "80%", bg: "bg-indigo-600" },
              { label: "Sesi Terlibat", val: "18.710", drop: "-23.4%", width: "60%", bg: "bg-blue-500" },
              { label: "Konversi", val: "8.210", drop: "-56.1%", width: "40%", bg: "bg-sky-500" },
              { label: "Tujuan Tercapai", val: "5.630", drop: "23.9%", width: "25%", bg: "bg-emerald-500" },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>{step.label}</span>
                  <span>{step.val}</span>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                  <div className={`h-full ${step.bg} transition-all duration-500`} style={{ width: step.width }}></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 text-center bg-purple-50 p-2 rounded-xl">
            5.630 sesi berhasil mencapai tujuan. Rasio konversi: <b>23,9%</b>
          </p>
        </div>
      </div>
    </div>
  );
}

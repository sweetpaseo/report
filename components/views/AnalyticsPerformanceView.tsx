"use client";

import React from "react";
import { Users, Clock, Eye, TrendingUp, Sparkles, Filter, ArrowRight } from "lucide-react";
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

const analyticsTrendData = [
  { date: "15 Mei", pengguna: 720, sesi: 1125 },
  { date: "18 Mei", pengguna: 810, sesi: 1240 },
  { date: "21 Mei", pengguna: 950, sesi: 1450 },
  { date: "24 Mei", pengguna: 890, sesi: 1380 },
  { date: "27 Mei", pengguna: 1050, sesi: 1560 },
  { date: "31 Mei", pengguna: 1180, sesi: 1680 },
];

const channelDonutData = [
  { name: "Organic Search", value: 68.1, color: "#6366f1" },
  { name: "Direct", value: 16.2, color: "#3b82f6" },
  { name: "Referral", value: 7.6, color: "#10b981" },
  { name: "Social", value: 5.1, color: "#f59e0b" },
  { name: "Paid Search", value: 3.0, color: "#ec4899" },
];

export function AnalyticsPerformanceView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* 6 KPI Cards with Sparklines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Pengguna</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">23.540</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 27,1%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[10, 15, 20, 18, 25, 28]} strokeColor="#8b5cf6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Sesi</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">28.990</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 23,4%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[12, 16, 19, 22, 26, 30]} strokeColor="#6366f1" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Engagement Rate</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">62,7%</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 8,6%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[55, 58, 60, 61, 62, 62.7]} strokeColor="#3b82f6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Rata-rata Waktu</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">01:42</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 15,0%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[80, 85, 90, 95, 98, 102]} strokeColor="#0284c7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Tayangan Halaman</p>
          <p className="text-lg font-extrabold text-slate-900 tabular-nums">56.200</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 18,8%</span>
          <div className="h-6 pt-1">
            <Sparkline values={[40, 44, 48, 50, 53, 56.2]} strokeColor="#10b981" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
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
        {/* Tren Pengguna & Sesi Recharts Card */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Tren Pengguna & Sesi (Analytics)</h3>
            <select className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <option>Harian</option>
              <option>Mingguan</option>
              <option>Bulanan</option>
            </select>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPengguna" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSesi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Area type="monotone" dataKey="pengguna" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPengguna)" name="Pengguna" />
                <Area type="monotone" dataKey="sesi" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSesi)" name="Sesi" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Perjalanan Pengguna Funnel Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Perjalanan Pengguna (Funnel)</h3>
          <div className="space-y-2 py-2">
            {[
              { label: "Pengguna", val: "23.540", width: "100%", bg: "bg-purple-600" },
              { label: "Melihat Halaman", val: "56.200", width: "80%", bg: "bg-indigo-600" },
              { label: "Sesi Terlibat", val: "18.710", width: "60%", bg: "bg-blue-500" },
              { label: "Konversi", val: "8.210", width: "40%", bg: "bg-sky-500" },
              { label: "Tujuan Tercapai", val: "5.630", width: "25%", bg: "bg-emerald-500" },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>{step.label}</span>
                  <span>{step.val}</span>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                  <div className={`h-full ${step.bg} transition-all duration-500 hover:brightness-110`} style={{ width: step.width }}></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 text-center bg-purple-50 p-2 rounded-xl border border-purple-100">
            5.630 sesi berhasil mencapai tujuan. Rasio konversi: <b>23,9%</b>
          </p>
        </div>
      </div>
    </div>
  );
}

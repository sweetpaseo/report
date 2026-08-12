"use client";

import React, { useState } from "react";
import { Search, TrendingUp, Filter, Download, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Sparkline } from "@/components/sparkline";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const comparisonChartData = [
  { date: "15 Mei", currentKlik: 420, prevKlik: 380, currentTayang: 48000, prevTayang: 42000 },
  { date: "18 Mei", currentKlik: 510, prevKlik: 410, currentTayang: 52000, prevTayang: 45000 },
  { date: "21 Mei", currentKlik: 480, prevKlik: 430, currentTayang: 50000, prevTayang: 44000 },
  { date: "24 Mei", currentKlik: 620, prevKlik: 460, currentTayang: 58000, prevTayang: 47000 },
  { date: "27 Mei", currentKlik: 590, prevKlik: 490, currentTayang: 56000, prevTayang: 49000 },
  { date: "31 Mei", currentKlik: 710, prevKlik: 520, currentTayang: 68000, prevTayang: 51000 },
];

const positionMovementData = [
  { name: "Naik", value: 57, color: "#10b981" },
  { name: "Stabil", value: 26, color: "#f59e0b" },
  { name: "Turun", value: 17, color: "#ef4444" },
];

export function SearchPerformanceView({ data }: { data: any }) {
  const comparisons = data?.comparisons || {};
  const clicks = comparisons["gsc.clicks"] || { current: 18629, percent: 32.5 };
  const impressions = comparisons["gsc.impressions"] || { current: 1020000, percent: 18.6 };
  const ctr = comparisons["gsc.ctr"] || { current: 1.83, percent: 11.7 };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter:</span>
          <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700">
            <option>Tipe Pencarian: Web</option>
          </select>
          <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700">
            <option>Negara: Semua</option>
          </select>
          <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700">
            <option>Perangkat: Semua</option>
          </select>
        </div>
        <button className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
          <Filter className="w-3.5 h-3.5" /> Filter lainnya
        </button>
      </div>

      {/* 4 KPI Cards with Action Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Klik */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Klik</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {clicks.current?.toLocaleString("id-ID") || "18.629"}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {clicks.percent ? `${clicks.percent.toFixed(1)}%` : "32,5%"}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50/80 text-[11px] text-purple-900 space-y-0.5">
            <p className="font-bold text-purple-700">Yang sebaiknya dilakukan:</p>
            <p className="text-purple-800 leading-snug">Pertahankan konten dengan klik tinggi dan optimalkan judul & deskripsi.</p>
          </div>
        </div>

        {/* KPI 2: Tayang */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Tayang</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">1,02 jt</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {impressions.percent ? `${impressions.percent.toFixed(1)}%` : "18,6%"}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/80 text-[11px] text-indigo-900 space-y-0.5">
            <p className="font-bold text-indigo-700">Yang sebaiknya dilakukan:</p>
            <p className="text-indigo-800 leading-snug">Tingkatkan visibilitas dengan konten yang relevan dan update rutin.</p>
          </div>
        </div>

        {/* KPI 3: CTR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400">CTR</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">1,83%</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {ctr.percent ? `${ctr.percent.toFixed(1)}%` : "11,7%"}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/80 text-[11px] text-blue-900 space-y-0.5">
            <p className="font-bold text-blue-700">Yang sebaiknya dilakukan:</p>
            <p className="text-blue-800 leading-snug">Buat judul lebih menarik dan relevan dengan niat pencarian.</p>
          </div>
        </div>

        {/* KPI 4: Posisi Rata-rata */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Posisi Rata-rata</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">12,4</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> -1.8 poin
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/80 text-[11px] text-emerald-900 space-y-0.5">
            <p className="font-bold text-emerald-700">Yang sebaiknya dilakukan:</p>
            <p className="text-emerald-800 leading-snug">Tingkatkan konten untuk naik ke halaman pertama Google.</p>
          </div>
        </div>
      </div>

      {/* Main Comparison Line Chart Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-sm">Performa dari Waktu ke Waktu (Komparasi Periode)</h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-purple-600 font-bold">● Klik Saat Ini</span>
            <span className="text-purple-300 font-bold">--- Klik Lalu</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Line type="monotone" dataKey="currentKlik" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} name="Klik Periode Ini" />
              <Line type="monotone" dataKey="prevKlik" stroke="#c084fc" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Klik Periode Lalu" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Position Movement Gauge & Query Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Position Movement Gauge Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <h4 className="font-extrabold text-slate-900 text-xs">Pergerakan Posisi Kata Kunci</h4>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={positionMovementData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {positionMovementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-bold text-center">
            <span className="text-emerald-600">57% Naik</span>
            <span className="text-amber-500">26% Stabil</span>
            <span className="text-rose-500">17% Turun</span>
          </div>
        </div>

        {/* Query Table with Sparklines */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Performa Query Organik</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left data-table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th className="right">Klik</th>
                  <th className="right">Tayang</th>
                  <th className="right">CTR</th>
                  <th className="center">Posisi</th>
                  <th>Landing Page</th>
                  <th className="right">Tren Harian</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { query: "pipa hdpe", clicks: "3.245", imp: "16.200", ctr: "20.0%", pos: "1.2", page: "/pipa-hdpe" },
                  { query: "pipa ppr", clicks: "2.180", imp: "10.850", ctr: "20.1%", pos: "2.3", page: "/pipa-ppr" },
                  { query: "fitting pipa ppr", clicks: "1.856", imp: "8.540", ctr: "21.7%", pos: "2.1", page: "/fitting-pipa-ppr" },
                  { query: "pipa pvc", clicks: "1.402", imp: "6.120", ctr: "22.9%", pos: "2.4", page: "/pipa-pvc" },
                  { query: "pipa galvanis", clicks: "1.203", imp: "9.100", ctr: "13.2%", pos: "3.1", page: "/pipa-galvanis" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="font-semibold text-slate-900">{row.query}</td>
                    <td className="right font-bold text-slate-800">{row.clicks}</td>
                    <td className="right text-slate-600">{row.imp}</td>
                    <td className="right text-slate-600">{row.ctr}</td>
                    <td className="text-center"><span className="pos-badge pos-badge-green">{row.pos}</span></td>
                    <td className="font-mono text-slate-500">{row.page}</td>
                    <td className="right w-24">
                      <div className="h-6">
                        <Sparkline values={[10, 15, 12, 18, 22, 20, 25]} strokeColor="#6366f1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

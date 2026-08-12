"use client";

import React from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, XCircle, Filter } from "lucide-react";
import { Sparkline } from "@/components/sparkline";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const impactDonutData = [
  { name: "Tinggi", value: 38.1, color: "#ef4444" },
  { name: "Sedang", value: 45.2, color: "#f59e0b" },
  { name: "Rendah", value: 16.7, color: "#3b82f6" },
];

export function NotificationsIssuesView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* 5 KPI Cards for Issues */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Total Isu Terbuka</p>
          <p className="text-xl font-extrabold text-slate-900 tabular-nums">42</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 31,3% vs 1 Apr - 30 Apr 2025</span>
          <div className="h-6 pt-1">
            <Sparkline values={[30, 32, 35, 38, 40, 42]} strokeColor="#8b5cf6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Isu Kritis</p>
          <p className="text-xl font-extrabold text-rose-600 tabular-nums">8</p>
          <span className="text-[10px] font-bold text-rose-600">▲ 14,3% vs 1 Apr - 30 Apr 2025</span>
          <div className="h-6 pt-1">
            <Sparkline values={[6, 7, 7, 8, 8, 8]} strokeColor="#ef4444" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Isu Peringatan</p>
          <p className="text-xl font-extrabold text-amber-600 tabular-nums">21</p>
          <span className="text-[10px] font-bold text-amber-600">▲ 23,5% vs 1 Apr - 30 Apr 2025</span>
          <div className="h-6 pt-1">
            <Sparkline values={[15, 17, 18, 19, 20, 21]} strokeColor="#f59e0b" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Isu Informasi</p>
          <p className="text-xl font-extrabold text-sky-600 tabular-nums">13</p>
          <span className="text-[10px] font-bold text-sky-600">▲ 18,2% vs 1 Apr - 30 Apr 2025</span>
          <div className="h-6 pt-1">
            <Sparkline values={[10, 11, 11, 12, 13, 13]} strokeColor="#0284c7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400">Isu Selesai</p>
          <p className="text-xl font-extrabold text-emerald-600 tabular-nums">37</p>
          <span className="text-[10px] font-bold text-emerald-600">▲ 26,5% vs 1 Apr - 30 Apr 2025</span>
          <div className="h-6 pt-1">
            <Sparkline values={[25, 28, 30, 32, 35, 37]} strokeColor="#10b981" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ringkasan Dampak Donut Recharts Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <h4 className="font-extrabold text-slate-900 text-xs">Ringkasan Dampak Isu</h4>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={impactDonutData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {impactDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-bold text-center">
            <span className="text-rose-600">Tinggi 38,1%</span>
            <span className="text-amber-500">Sedang 45,2%</span>
            <span className="text-blue-500">Rendah 16,7%</span>
          </div>
        </div>

        {/* Issues Table */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Daftar Isu Teknis & Notifikasi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left data-table">
              <thead>
                <tr>
                  <th>Isu</th>
                  <th>Kategori</th>
                  <th className="center">Tingkat</th>
                  <th className="center">Dampak</th>
                  <th className="center">Status</th>
                  <th>Terakhir Terjadi</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: "404 Page Not Found", category: "Crawling & Indexing", level: "Kritis", impact: "Tinggi", status: "Terbuka", time: "31 Mei 2025, 09:12" },
                  { title: "Halaman Duplikat", category: "Konten", level: "Peringatan", impact: "Sedang", status: "Dalam Proses", time: "30 Mei 2025, 15:48" },
                  { title: "Core Web Vitals: LCP Buruk", category: "Pengalaman Halaman", level: "Kritis", impact: "Tinggi", status: "Terbuka", time: "30 Mei 2025, 11:22" },
                  { title: "Meta Description Terlalu Pendek", category: "On-Page SEO", level: "Peringatan", impact: "Rendah", status: "Terbuka", time: "29 Mei 2025, 10:05" },
                  { title: "Server Error (5xx)", category: "Teknis", level: "Kritis", impact: "Tinggi", status: "Terbuka", time: "28 Mei 2025, 14:11" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="font-bold text-slate-900">{row.title}</td>
                    <td className="text-slate-600">{row.category}</td>
                    <td className="text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${row.level === "Kritis" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                        {row.level}
                      </span>
                    </td>
                    <td className="text-center font-semibold text-slate-700">{row.impact}</td>
                    <td className="text-center">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded-full">
                        {row.status}
                      </span>
                    </td>
                    <td className="text-slate-500 font-mono">{row.time}</td>
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

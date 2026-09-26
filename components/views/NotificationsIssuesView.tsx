"use client";

import React, { useMemo } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatNumber } from "@/lib/view-helpers";

export function NotificationsIssuesView({ data }: { data: any }) {
  const anomalies = data?.anomalies || [];
  const dataQuality = data?.dataQuality || [];

  const items = useMemo(() => {
    const list: Array<{
      title: string;
      category: string;
      level: "Kritis" | "Peringatan" | "Informasi" | "Normal";
      impact: "Tinggi" | "Sedang" | "Rendah";
      status: string;
      time: string;
    }> = [];

    // Add anomalies
    anomalies.forEach((a: any) => {
      list.push({
        title: a.text,
        category: "Tren Performa",
        level: a.severity === "critical" ? "Kritis" : a.severity === "warning" ? "Peringatan" : "Informasi",
        impact: a.severity === "critical" ? "Tinggi" : "Sedang",
        status: "Perlu Evaluasi",
        time: "Periode ini",
      });
    });

    // Add data quality
    dataQuality.forEach((q: any) => {
      list.push({
        title: `${q.label}: ${q.detail}`,
        category: "Konektivitas API",
        level: q.status === "ok" ? "Normal" : q.status === "warning" ? "Peringatan" : "Kritis",
        impact: q.status === "ok" ? "Rendah" : "Tinggi",
        status: q.status === "ok" ? "Tersambung" : "Perlu Ditinjau",
        time: "Realtime",
      });
    });

    if (list.length === 0) {
      list.push({
        title: "Seluruh integrasi API Search Console dan GA4 berjalan normal tanpa anomali kritis.",
        category: "Kesehatan Sistem",
        level: "Normal",
        impact: "Rendah",
        status: "Normal",
        time: "Hari ini",
      });
    }

    return list;
  }, [anomalies, dataQuality]);

  const criticalCount = items.filter((i) => i.level === "Kritis").length;
  const warningCount = items.filter((i) => i.level === "Peringatan").length;
  const normalCount = items.filter((i) => i.level === "Normal" || i.level === "Informasi").length;

  const donutData = [
    { name: "Kritis", value: criticalCount || 0, color: "#ef4444" },
    { name: "Peringatan", value: warningCount || 0, color: "#f59e0b" },
    { name: "Normal / Info", value: normalCount || 1, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Total Status & Notifikasi</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {items.length}
          </p>
          <span className="text-[10px] font-bold text-indigo-600">pemeriksaan sistem otomatis</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Isu Kritis</p>
          <p className="text-2xl font-extrabold text-rose-600 tabular-nums">
            {criticalCount}
          </p>
          <span className="text-[10px] font-bold text-rose-600">memerlukan tindakan segera</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Peringatan (Warning)</p>
          <p className="text-2xl font-extrabold text-amber-600 tabular-nums">
            {warningCount}
          </p>
          <span className="text-[10px] font-bold text-amber-600">indikasi penurunan atau peluang</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Kondisi Normal</p>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {normalCount}
          </p>
          <span className="text-[10px] font-bold text-emerald-600">berjalan dengan baik</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ringkasan Dampak Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs">Distribusi Tingkat Isu</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Berdasarkan pemantauan kesehatan data</p>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-bold text-center">
            <span className="text-rose-600">{criticalCount} Kritis</span>
            <span className="text-amber-500">{warningCount} Warning</span>
            <span className="text-emerald-600">{normalCount} Normal</span>
          </div>
        </div>

        {/* Issues Table */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Daftar Isu Teknis & Notifikasi Sistem</h3>
            <span className="text-[11px] text-slate-400">Status realtime</span>
          </div>

          <div className="overflow-x-auto max-h-80 custom-scrollbar">
            <table className="w-full text-xs text-left data-table">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th>Notifikasi / Isu</th>
                  <th>Kategori</th>
                  <th className="center">Tingkat</th>
                  <th className="center">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="font-semibold text-slate-800 max-w-sm truncate" title={row.title}>
                      {row.title}
                    </td>
                    <td className="text-slate-500">{row.category}</td>
                    <td className="text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.level === "Kritis"
                          ? "bg-rose-100 text-rose-800"
                          : row.level === "Peringatan"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {row.level}
                      </span>
                    </td>
                    <td className="text-center text-slate-600 font-medium">{row.status}</td>
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

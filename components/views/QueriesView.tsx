"use client";

import React, { useMemo } from "react";
import { KeyRound, TrendingUp, Sparkles, HelpCircle, ArrowRight, Zap } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
} from "@/lib/view-helpers";

export function QueriesView({ data }: { data: any }) {
  const rawQueries = data?.topQueries?.web || [];
  const opportunities = data?.opportunities?.web || [];
  const websiteName = (data?.website?.name || "").toLowerCase();
  const websiteDomain = (data?.website?.domain || "").toLowerCase();

  // Branded vs Non-Branded Calculation
  const { brandedCount, nonBrandedCount, brandedPct, nonBrandedPct } = useMemo(() => {
    if (rawQueries.length === 0) {
      return { brandedCount: 0, nonBrandedCount: 0, brandedPct: 0, nonBrandedPct: 100 };
    }
    const keywords = websiteName.split(/\s+/).filter((w: string) => w.length > 2);
    const domainKeywords = websiteDomain.split(".")[0];
    if (domainKeywords && domainKeywords.length > 2) keywords.push(domainKeywords);

    let branded = 0;
    rawQueries.forEach((q: any) => {
      const qText = (q.query || "").toLowerCase();
      const isBranded = keywords.some((k: string) => qText.includes(k));
      if (isBranded) branded++;
    });

    const nonBranded = rawQueries.length - branded;
    const bPct = Math.round((branded / rawQueries.length) * 100);
    return {
      brandedCount: branded,
      nonBrandedCount: nonBranded,
      brandedPct: bPct,
      nonBrandedPct: 100 - bPct,
    };
  }, [rawQueries, websiteName, websiteDomain]);

  const brandedChartData = [
    { name: "Non-Branded", value: nonBrandedPct, count: nonBrandedCount, color: "#6366f1" },
    { name: "Branded", value: brandedPct, count: brandedCount, color: "#10b981" },
  ];

  // Top 10 Share
  const totalClicks = rawQueries.reduce((sum: number, q: any) => sum + (q.clicks || 0), 0) || 1;
  const top10Clicks = rawQueries.slice(0, 10).reduce((sum: number, q: any) => sum + (q.clicks || 0), 0);
  const top10Share = Math.round((top10Clicks / totalClicks) * 100);

  // Fallback opportunities if empty: queries with pos 4-20
  const oppList = useMemo(() => {
    if (opportunities.length > 0) return opportunities;
    return rawQueries.filter((q: any) => (q.averagePosition || 0) >= 4 && (q.averagePosition || 0) <= 20).slice(0, 6);
  }, [opportunities, rawQueries]);

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Total Query Terindeks</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatNumber(rawQueries.length)}
          </p>
          <span className="text-[10px] font-bold text-indigo-600">kata kunci aktif di Google</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Kontribusi Top 10 Query</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {top10Share}%
          </p>
          <span className="text-[10px] font-bold text-emerald-600">dari total trafik organik</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Porsi Non-Branded</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {nonBrandedPct}%
          </p>
          <span className="text-[10px] font-bold text-slate-500">pencarian generik/kategori</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Peluang Emas Terdeteksi</p>
          <p className="text-2xl font-extrabold text-indigo-600 tabular-nums">
            {formatNumber(oppList.length)}
          </p>
          <span className="text-[10px] font-bold text-indigo-600">query di posisi 4–20</span>
        </div>
      </div>

      {/* Query Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branded vs Non-Branded Recharts Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-900">Branded vs Non-Branded</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Rasio pencarian nama merek vs kata kunci layanan</p>
          </div>

          <div className="h-36 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={brandedChartData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                  {brandedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item?.payload?.count} query)`,
                    name,
                  ]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs font-bold flex justify-around pt-1">
            <span className="text-indigo-600">Non-Branded: {nonBrandedPct}%</span>
            <span className="text-emerald-600">Branded: {brandedPct}%</span>
          </div>
        </div>

        {/* Top 5 Queries Summary */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-900">Kata Kunci Utama Penyumbang Trafik</p>
            <span className="text-[11px] text-slate-400">Top 5 teratas</span>
          </div>

          <div className="space-y-2">
            {rawQueries.slice(0, 5).map((q: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-900">{q.query}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">{formatNumber(q.impressions)} tayang</span>
                  <span className="font-extrabold text-indigo-600">{formatNumber(q.clicks)} klik</span>
                  <span className="pos-badge pos-badge-green">Pos {formatPosition(q.averagePosition)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peluang Emas: Query Dekat Halaman Pertama */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-200" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Peluang Emas: Query Dekat Halaman Pertama (Posisi 4–20)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Query ini sudah menghasilkan impresi tinggi di Google. Sedikit optimasi konten & meta title akan mengangkatnya ke peringkat teratas.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Query</th>
                <th className="center">Posisi Saat Ini</th>
                <th className="right">Tayang</th>
                <th className="right">CTR</th>
                <th className="center">Potensi Dampak</th>
                <th>Rekomendasi Aksi</th>
              </tr>
            </thead>
            <tbody>
              {oppList.length > 0 ? (
                oppList.map((row: any, idx: number) => {
                  const pos = row.averagePosition || 0;
                  const isHighImpact = (row.impressions || 0) >= 50;

                  return (
                    <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                      <td className="font-bold text-slate-900">{row.query}</td>
                      <td className="text-center font-extrabold text-amber-600">
                        {formatPosition(row.averagePosition)}
                      </td>
                      <td className="right text-slate-700">{formatNumber(row.impressions)}</td>
                      <td className="right text-slate-600">{formatPercent((row.ctr || 0) * 100)}</td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHighImpact ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {isHighImpact ? "Tinggi" : "Sedang"}
                        </span>
                      </td>
                      <td className="text-slate-600">
                        Optimalkan heading (H2/H3) dan meta description agar relevan dengan niat pencarian kata kunci ini.
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    Belum ada kata kunci di posisi 4–20 yang terdeteksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

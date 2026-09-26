"use client";

import React, { useMemo } from "react";
import { Globe, TrendingUp, Sparkles, MapPin } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
  getCountryDisplay,
} from "@/lib/view-helpers";

export function CountriesView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const rawCountries = data?.countries?.web || [];
  const topCities = data?.topCities || [];

  // Group and sort countries
  const sortedCountries = useMemo(() => {
    return [...rawCountries].sort((a: any, b: any) => (b.clicks || 0) - (a.clicks || 0) || (b.impressions || 0) - (a.impressions || 0));
  }, [rawCountries]);

  const totalClicks = sortedCountries.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0) || 1;
  const topCountry = sortedCountries[0];
  const topCountryInfo = topCountry ? getCountryDisplay(topCountry.name) : { name: "Indonesia", flag: "🇮🇩" };
  const topCountryPct = topCountry ? Math.round(((topCountry.clicks || 0) / totalClicks) * 100) : 100;

  const topCity = topCities[0];

  // Top 5 Countries for Bar Chart
  const top5BarData = useMemo(() => {
    const colors = ["#6366f1", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"];
    return sortedCountries.slice(0, 6).map((c: any, idx: number) => {
      const display = getCountryDisplay(c.name);
      return {
        name: `${display.flag} ${display.name}`,
        klik: c.clicks || 0,
        tayang: c.impressions || 0,
        color: colors[idx % colors.length],
      };
    });
  }, [sortedCountries]);

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Kontribusi Terbesar</p>
          <p className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>{topCountryInfo.flag}</span>
            <span>{topCountryInfo.name}</span>
          </p>
          <p className="text-xs font-bold text-purple-600">
            {formatNumber(topCountry?.clicks || 0)} klik ({topCountryPct}%)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Total Negara Terjangkau</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatNumber(sortedCountries.length)}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold">negara di Google Search</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Total Klik Semua Negara</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums text-indigo-600">
            {formatNumber(totalClicks)}
          </p>
          <p className="text-[10px] text-slate-400">periode laporan aktif</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Kota Terpopuler (GA4)</p>
          <p className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">{topCity?.city || "Kota Utama"}</span>
          </p>
          <p className="text-xs font-bold text-emerald-600">
            {topCity ? `${formatNumber(topCity.activeUsers)} pengguna` : "Data pengguna aktif"}
          </p>
        </div>
      </div>

      {/* Top Countries BarChart & Geographic Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Countries Horizontal Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Negara Teratas (Klik GSC)
            </h3>
            <span className="text-[11px] text-slate-400">Top negara pengunjung</span>
          </div>

          <div className="h-64">
            {top5BarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top5BarData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${formatNumber(val)} klik`, "Klik"]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "11px" }}
                  />
                  <Bar dataKey="klik" radius={[0, 6, 6, 0]}>
                    {top5BarData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data negara untuk periode ini.
              </div>
            )}
          </div>
        </div>

        {/* Top Cities (GA4) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" /> Distribusi Kota Pengguna (GA4)
            </h3>
            <span className="text-[11px] text-slate-400">Berdasarkan lokasi sesi aktif</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {topCities.length > 0 ? (
              topCities.map((city: any, idx: number) => {
                const totalUsers = topCities.reduce((sum: number, c: any) => sum + (c.activeUsers || 0), 0) || 1;
                const pct = Math.round(((city.activeUsers || 0) / totalUsers) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs hover:bg-slate-100 transition-colors">
                    <span className="font-semibold text-slate-800">{city.city || "(not set)"}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{formatNumber(city.activeUsers)} pengguna</span>
                      <span className="text-slate-500 font-medium text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">Belum ada data geolokasi kota pada GA4.</p>
            )}
          </div>
        </div>
      </div>

      {/* Complete Country Data Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Rincian Lengkap Seluruh Negara (GSC)</h3>
        <div className="overflow-x-auto max-h-80 custom-scrollbar">
          <table className="w-full text-xs text-left data-table">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th>Negara</th>
                <th className="right">Klik</th>
                <th className="right">Tayangan</th>
                <th className="right">CTR</th>
                <th className="center">Posisi Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.length > 0 ? (
                sortedCountries.map((row: any, idx: number) => {
                  const display = getCountryDisplay(row.name);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-sm">{display.flag}</span>
                        <span>{display.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">({row.name})</span>
                      </td>
                      <td className="right font-extrabold text-slate-900">{formatNumber(row.clicks)}</td>
                      <td className="right text-slate-600">{formatNumber(row.impressions)}</td>
                      <td className="right text-slate-600">{formatPercent((row.ctr || 0) * 100)}</td>
                      <td className="text-center">
                        <span className="pos-badge pos-badge-green">{formatPosition(row.averagePosition)}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    Belum ada data negara.
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

"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Smartphone,
  Globe,
  HelpCircle,
} from "lucide-react";
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
import {
  formatDateLabel,
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
  getCountryDisplay,
} from "@/lib/view-helpers";

export function SearchPerformanceView({ data }: { data: any }) {
  const comparisons = data?.comparisons || {};
  const clicks = comparisons["gsc.clicks"] || { current: 0, percent: null };
  const impressions = comparisons["gsc.impressions"] || { current: 0, percent: null };
  const ctr = comparisons["gsc.ctr"] || { current: 0, percent: null };
  const avgPos = comparisons["gsc.average_position"] || { current: 0, percent: null };

  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  const rawQueries = data?.topQueries?.web || [];
  const gscDaily = data?.trends?.gscWeb || [];

  // Filtered queries
  const filteredQueries = useMemo(() => {
    return rawQueries.filter((q: any) => {
      if (searchQuery && !q.query.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (positionFilter === "top10" && (q.averagePosition > 10 || q.averagePosition <= 0)) {
        return false;
      }
      if (positionFilter === "p11_20" && (q.averagePosition <= 10 || q.averagePosition > 20)) {
        return false;
      }
      if (positionFilter === "gt20" && q.averagePosition <= 20) {
        return false;
      }
      return true;
    });
  }, [rawQueries, searchQuery, positionFilter]);

  // Position Movement / Tier Distribution Donut
  const positionDistribution = useMemo(() => {
    let top10 = 0;
    let page2 = 0;
    let page3plus = 0;

    rawQueries.forEach((q: any) => {
      const pos = q.averagePosition || 0;
      if (pos <= 10) top10++;
      else if (pos <= 20) page2++;
      else page3plus++;
    });

    const total = rawQueries.length || 1;
    return [
      { name: "Halaman 1 (1–10)", count: top10, value: Math.round((top10 / total) * 100), color: "#10b981" },
      { name: "Halaman 2 (11–20)", count: page2, value: Math.round((page2 / total) * 100), color: "#f59e0b" },
      { name: "Halaman 3+ (>20)", count: page3plus, value: Math.round((page3plus / total) * 100), color: "#6366f1" },
    ];
  }, [rawQueries]);

  // Trend Chart data
  const trendChartData = useMemo(() => {
    return gscDaily.map((r: any) => ({
      date: formatDateLabel(r.date),
      klik: r.clicks || 0,
      tayang: r.impressions || 0,
      ctr: Math.round((r.ctr || 0) * 1000) / 10,
    }));
  }, [gscDaily]);

  return (
    <div className="space-y-6">
      {/* Interactive Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* Search keyword input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 transition-colors w-44 md:w-56"
            />
          </div>

          {/* Position tier filter */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Semua Peringkat</option>
            <option value="top10">Halaman 1 (Pos 1–10)</option>
            <option value="p11_20">Peluang Emas (Pos 11–20)</option>
            <option value="gt20">Halaman 3+ (Pos &gt; 20)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Menampilkan <strong className="text-slate-800">{filteredQueries.length}</strong> dari {rawQueries.length} query
        </div>
      </div>

      {/* 4 KPI Cards with Action Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Klik */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Total Klik</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatNumber(clicks.current)}
              </span>
              {clicks.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${clicks.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {clicks.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(Math.abs(clicks.percent))}
                </span>
              )}
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
            <p className="text-[11px] font-bold text-slate-400">Total Tayang</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatCompactNumber(impressions.current)}
              </span>
              {impressions.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${impressions.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {impressions.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(Math.abs(impressions.percent))}
                </span>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/80 text-[11px] text-indigo-900 space-y-0.5">
            <p className="font-bold text-indigo-700">Yang sebaiknya dilakukan:</p>
            <p className="text-indigo-800 leading-snug">Tingkatkan visibilitas dengan konten yang relevan dan update berkala.</p>
          </div>
        </div>

        {/* KPI 3: CTR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400">CTR (Rasio Klik-Tayang)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatPercent((ctr.current || 0) * 100, 2)}
              </span>
              {ctr.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${ctr.percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {ctr.percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(Math.abs(ctr.percent))}
                </span>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50/80 text-[11px] text-teal-900 space-y-0.5">
            <p className="font-bold text-teal-700">Yang sebaiknya dilakukan:</p>
            <p className="text-teal-800 leading-snug">Buat meta title lebih memikat dan relevan dengan maksud pencarian pengguna.</p>
          </div>
        </div>

        {/* KPI 4: Posisi Rata-rata */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400">Posisi Rata-rata</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatPosition(avgPos.current)}
              </span>
              {avgPos.percent !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${avgPos.percent <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {avgPos.percent <= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(Math.abs(avgPos.percent))}
                </span>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/80 text-[11px] text-emerald-900 space-y-0.5">
            <p className="font-bold text-emerald-700">Yang sebaiknya dilakukan:</p>
            <p className="text-emerald-800 leading-snug">Targetkan kata kunci di posisi 11–20 agar lekas menembus halaman pertama Google.</p>
          </div>
        </div>
      </div>

      {/* Main Trend Line Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Tren Klik & Tayang Harian Organik (GSC)</h3>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span> Klik
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-3 h-3 rounded-full bg-purple-400"></span> Tayang
            </span>
          </div>
        </div>

        <div className="h-64">
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" hide />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Line yAxisId="left" type="monotone" dataKey="klik" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} name="Klik" />
                <Line yAxisId="right" type="monotone" dataKey="tayang" stroke="#c084fc" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Tayangan" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data tren harian untuk periode ini.
            </div>
          )}
        </div>
      </div>

      {/* Position Movement Gauge & Query Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Position Movement Gauge Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs">Distribusi Peringkat Kata Kunci</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Berdasarkan data {rawQueries.length} query terindeks</p>
          </div>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={positionDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {positionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item?.payload?.count} query)`,
                    name,
                  ]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-bold text-center">
            {positionDistribution.map((item, idx) => (
              <span key={idx} style={{ color: item.color }}>
                {item.value}% {item.name.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Query Table with Sparklines */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">Performa Query Organik</h3>
            <span className="text-[11px] text-slate-400">Urut berdasarkan tayang terbanyak</span>
          </div>

          <div className="overflow-x-auto max-h-96 custom-scrollbar">
            <table className="w-full text-xs text-left data-table">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th>Query</th>
                  <th className="right">Klik</th>
                  <th className="right">Tayang</th>
                  <th className="right">CTR</th>
                  <th className="center">Posisi</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.length > 0 ? (
                  filteredQueries.map((row: any, idx: number) => {
                    const pos = row.averagePosition || 0;
                    const posBadgeClass =
                      pos <= 3
                        ? "pos-badge pos-badge-green"
                        : pos <= 10
                        ? "pos-badge pos-badge-yellow"
                        : "pos-badge pos-badge-gray";

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="font-semibold text-slate-900 max-w-xs truncate" title={row.query}>
                          {row.query}
                        </td>
                        <td className="right font-bold text-slate-800">{formatNumber(row.clicks)}</td>
                        <td className="right text-slate-600">{formatNumber(row.impressions)}</td>
                        <td className="right text-slate-600">{formatPercent(row.ctr * 100)}</td>
                        <td className="text-center">
                          <span className={posBadgeClass}>{formatPosition(row.averagePosition)}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      Tidak ada query yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

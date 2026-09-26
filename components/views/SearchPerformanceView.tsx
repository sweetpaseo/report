"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Smartphone,
  Globe,
  HelpCircle,
  Star,
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
  exportTableToCsv,
} from "@/lib/view-helpers";
import { TablePagination } from "@/components/TablePagination";
import { InfoTooltip } from "@/components/InfoTooltip";

export function SearchPerformanceView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const comparisons = data?.comparisons || {};
  const clicks = comparisons["gsc.clicks"] || { current: 0, percent: null };
  const impressions = comparisons["gsc.impressions"] || { current: 0, percent: null };
  const ctr = comparisons["gsc.ctr"] || { current: 0, percent: null };
  const avgPos = comparisons["gsc.average_position"] || { current: 0, percent: null };

  const periodLabel = data?.selected?.period_label || "Periode Terpilih";
  const prevPeriodLabel = (data?.comparePeriod || data?.previous)?.period_label;

  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  // Sorting state (default: clicks descending)
  type SortField = "query" | "clicks" | "previousClicks" | "clicksDiff" | "impressions" | "ctr" | "averagePosition";
  const [sortField, setSortField] = useState<SortField>("clicks");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "averagePosition" ? "asc" : "desc");
    }
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pinned Keywords Watchlist
  const websiteId = data?.website?.id || "";
  const [pinnedQueries, setPinnedQueries] = useState<string[]>([]);

  useEffect(() => {
    if (!websiteId) return;
    try {
      const stored = localStorage.getItem(`pinned_queries_${websiteId}`);
      if (stored) setPinnedQueries(JSON.parse(stored));
    } catch {}
  }, [websiteId]);

  const togglePinQuery = (query: string) => {
    const isPinned = pinnedQueries.some((q) => q.toLowerCase() === query.toLowerCase());
    const updated = isPinned
      ? pinnedQueries.filter((q) => q.toLowerCase() !== query.toLowerCase())
      : [...pinnedQueries, query];
    setPinnedQueries(updated);
    try {
      localStorage.setItem(`pinned_queries_${websiteId}`, JSON.stringify(updated));
    } catch {}
  };

  const rawQueries = data?.topQueries?.web || [];
  const gscDaily = data?.trends?.gscWeb || [];

  // Filtered & Sorted queries (Default: Klik terbanyak menuju terkecil)
  const filteredQueries = useMemo(() => {
    const list = rawQueries.filter((q: any) => {
      if (searchQuery && !q.query.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (positionFilter === "pinned") {
        return pinnedQueries.some((k) => k.toLowerCase() === q.query.toLowerCase());
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

    return [...list].sort((a: any, b: any) => {
      let diff = 0;
      if (sortField === "query") {
        diff = a.query.localeCompare(b.query);
      } else if (sortField === "clicks") {
        diff = (b.clicks || 0) - (a.clicks || 0);
        if (diff === 0) diff = (b.impressions || 0) - (a.impressions || 0);
        return sortDirection === "desc" ? diff : -diff;
      } else if (sortField === "previousClicks") {
        diff = (a.previousClicks || 0) - (b.previousClicks || 0);
      } else if (sortField === "clicksDiff") {
        diff = (a.clicksDiff || 0) - (b.clicksDiff || 0);
      } else if (sortField === "impressions") {
        diff = (a.impressions || 0) - (b.impressions || 0);
      } else if (sortField === "ctr") {
        diff = (a.ctr || 0) - (b.ctr || 0);
      } else if (sortField === "averagePosition") {
        diff = (a.averagePosition || 999) - (b.averagePosition || 999);
      }
      return sortDirection === "asc" ? diff : -diff;
    });
  }, [rawQueries, searchQuery, positionFilter, pinnedQueries, sortField, sortDirection]);

  // Paged queries for display
  const pagedQueries = useMemo(() => {
    if (pageSize === 0) return filteredQueries;
    const start = (currentPage - 1) * pageSize;
    return filteredQueries.slice(start, start + pageSize);
  }, [filteredQueries, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      "Kata Kunci (Query)",
      `Klik (${periodLabel})`,
      ...(isComparing && prevPeriodLabel ? [`Klik (${prevPeriodLabel})`, "Selisih"] : []),
      "Tayang",
      "CTR (%)",
      "Posisi Rata-rata",
    ];
    const rows = filteredQueries.map((row: any) => [
      row.query,
      row.clicks || 0,
      ...(isComparing && prevPeriodLabel ? [row.previousClicks || 0, row.clicksDiff || 0] : []),
      row.impressions || 0,
      (row.ctr * 100).toFixed(2),
      (row.averagePosition || 0).toFixed(1),
    ]);
    exportTableToCsv(`analisis-query-${periodLabel.replace(/\s+/g, "_")}`, headers, rows);
  };

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
      klikBandingkan: r.clicksCompare,
      tayangBandingkan: r.impressionsCompare,
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 transition-colors w-44 md:w-56"
            />
          </div>

          {/* Position tier filter */}
          <select
            value={positionFilter}
            onChange={(e) => {
              setPositionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Semua Peringkat</option>
            <option value="pinned">⭐ Kata Kunci Dipantau ({pinnedQueries.length})</option>
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
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400">Total Klik</p>
              <InfoTooltip
                term="Total Klik Organik"
                explanation="Berapa kali pengguna Google mengklik tautan website Anda dari hasil penelusuran gratis (bukan iklan)."
                example="Makin tinggi klik, makin banyak pengunjung potensial yang datang."
              />
            </div>
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
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400">Total Tayang</p>
              <InfoTooltip
                term="Total Tayang (Impresi)"
                explanation="Berapa kali website Anda muncul di layar pengguna saat mereka mencari sesuatu di Google."
                example="1.000 tayang artinya situs Anda sudah dilihat 1.000 kali di hasil pencarian."
              />
            </div>
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
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400">CTR (Rasio Klik-Tayang)</p>
              <InfoTooltip
                term="CTR (Click-Through Rate)"
                explanation="Persentase pengguna yang memutuskan mengklik website Anda setelah melihatnya di Google (Klik ÷ Tayang × 100%)."
                example="Jika tayang 100 kali dan diklik 5 kali, maka CTR adalah 5%."
              />
            </div>
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
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400">Posisi Rata-rata</p>
              <InfoTooltip
                term="Posisi Rata-rata di Google"
                explanation="Peringkat rata-rata kemunculan situs Anda di Google. Posisi 1–10 berada di Halaman Pertama Google."
                example="Posisi makin kecil angkanya makin bagus (Posisi 1 adalah peringkat teratas)."
              />
            </div>
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
                <Line yAxisId="left" type="monotone" dataKey="klik" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} name={`Klik (${periodLabel})`} />
                {isComparing && prevPeriodLabel && (
                  <Line yAxisId="left" type="monotone" dataKey="klikBandingkan" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} name={`Klik (${prevPeriodLabel})`} />
                )}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Performa Query Organik</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Urut berdasarkan: <span className="font-bold text-indigo-700">{
                  sortField === "clicks" ? "Klik" :
                  sortField === "impressions" ? "Tayang" :
                  sortField === "ctr" ? "CTR" :
                  sortField === "averagePosition" ? "Posisi Rata-rata" :
                  sortField === "clicksDiff" ? "Selisih Klik" :
                  sortField === "previousClicks" ? "Klik Periode Lalu" : "Kata Kunci"
                }</span> ({sortDirection === "desc" ? (sortField === "averagePosition" ? "Peringkat Terbawah" : "Terbanyak/Tertinggi") : (sortField === "averagePosition" ? "Peringkat Terbaik" : "Terkecil")})
              </p>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              💡 Klik judul kolom untuk mengubah urutan
            </span>
          </div>

          <div className="overflow-x-auto max-h-[480px] custom-scrollbar">
            <table className="w-full text-xs text-left data-table">
              <thead className="sticky top-0 bg-white shadow-xs">
                <tr>
                  <th onClick={() => handleSort("query")} className="cursor-pointer select-none hover:text-indigo-600 transition-colors">
                    <div className="inline-flex items-center gap-1">
                      <span>Query</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sortField === "query" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
                    </div>
                  </th>
                  <th onClick={() => handleSort("clicks")} className="right cursor-pointer select-none hover:text-indigo-600 transition-colors">
                    <div className="inline-flex items-center justify-end gap-1">
                      <span>Klik ({periodLabel})</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sortField === "clicks" ? (sortDirection === "desc" ? "▼" : "▲") : "↕"}</span>
                    </div>
                  </th>
                  {isComparing && prevPeriodLabel && (
                    <>
                      <th onClick={() => handleSort("previousClicks")} className="right text-amber-700 cursor-pointer select-none hover:text-amber-900 transition-colors">
                        <div className="inline-flex items-center justify-end gap-1">
                          <span>Klik ({prevPeriodLabel})</span>
                          <span className="text-[10px] text-amber-400 font-mono">{sortField === "previousClicks" ? (sortDirection === "desc" ? "▼" : "▲") : "↕"}</span>
                        </div>
                      </th>
                      <th onClick={() => handleSort("clicksDiff")} className="center cursor-pointer select-none hover:text-indigo-600 transition-colors">
                        <div className="inline-flex items-center justify-center gap-1">
                          <span>Selisih</span>
                          <span className="text-[10px] text-slate-400 font-mono">{sortField === "clicksDiff" ? (sortDirection === "desc" ? "▼" : "▲") : "↕"}</span>
                        </div>
                      </th>
                    </>
                  )}
                  <th onClick={() => handleSort("impressions")} className="right cursor-pointer select-none hover:text-indigo-600 transition-colors">
                    <div className="inline-flex items-center justify-end gap-1">
                      <span>Tayang</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sortField === "impressions" ? (sortDirection === "desc" ? "▼" : "▲") : "↕"}</span>
                      <InfoTooltip
                        term="Tayangan Query"
                        explanation="Berapa kali kata kunci ini menampilkan tautan situs Anda saat dicari oleh pengguna Google."
                      />
                    </div>
                  </th>
                  <th onClick={() => handleSort("ctr")} className="right cursor-pointer select-none hover:text-indigo-600 transition-colors">
                    <div className="inline-flex items-center justify-end gap-1">
                      <span>CTR</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sortField === "ctr" ? (sortDirection === "desc" ? "▼" : "▲") : "↕"}</span>
                      <InfoTooltip
                        term="CTR Query"
                        explanation="Rasio klik dibanding tayangan khusus untuk kata kunci ini."
                      />
                    </div>
                  </th>
                  <th onClick={() => handleSort("averagePosition")} className="center cursor-pointer select-none hover:text-indigo-600 transition-colors">
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>Posisi</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sortField === "averagePosition" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
                      <InfoTooltip
                        term="Peringkat Rata-rata"
                        explanation="Urutan rata-rata halaman Anda muncul di Google saat kata kunci ini diketikkan orang."
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedQueries.length > 0 ? (
                  pagedQueries.map((row: any, idx: number) => {
                    const pos = row.averagePosition || 0;
                    const posBadgeClass =
                      pos <= 3
                        ? "pos-badge pos-badge-green"
                        : pos <= 10
                        ? "pos-badge pos-badge-yellow"
                        : "pos-badge pos-badge-gray";

                    const isPinned = pinnedQueries.some(
                      (k) => k.toLowerCase() === (row.query || "").toLowerCase()
                    );

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="font-semibold text-slate-900 max-w-xs truncate" title={row.query}>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinQuery(row.query);
                              }}
                              className="text-slate-300 hover:text-amber-500 transition-colors p-0.5 cursor-pointer shrink-0"
                              title={isPinned ? "Hapus dari kata kunci dipantau" : "Tambahkan ke kata kunci dipantau"}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  isPinned ? "fill-amber-400 text-amber-500" : "text-slate-300"
                                }`}
                              />
                            </button>
                            <span className="truncate">{row.query}</span>
                          </div>
                        </td>
                        <td className="right font-bold text-slate-800">{formatNumber(row.clicks)}</td>
                        {isComparing && prevPeriodLabel && (
                          <>
                            <td className="right font-semibold text-amber-700">{formatNumber(row.previousClicks || 0)}</td>
                            <td className="text-center font-bold">
                              {(row.clicksDiff || 0) > 0 ? (
                                <span className="text-emerald-600">+{row.clicksDiff} ▲</span>
                              ) : (row.clicksDiff || 0) < 0 ? (
                                <span className="text-rose-600">{row.clicksDiff} ▼</span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>
                          </>
                        )}
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
                    <td colSpan={isComparing && prevPeriodLabel ? 7 : 5} className="text-center py-8 text-slate-400">
                      Tidak ada query yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination with CSV Download */}
          <TablePagination
            totalItems={filteredQueries.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            onExportCsv={handleExportCsv}
          />
        </div>
      </div>
    </div>
  );
}

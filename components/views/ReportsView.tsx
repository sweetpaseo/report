"use client";

import React, { useState, useMemo } from "react";
import { FileSpreadsheet, Download, Share2, Printer, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatNumber, formatPercent, formatPosition, getCountryDisplay } from "@/lib/view-helpers";
import { ExecutiveReportModal } from "@/components/ExecutiveReportModal";

export function ReportsView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [dimension, setDimension] = useState<"pages" | "queries" | "devices" | "countries">("pages");
  const [visualFormat, setVisualFormat] = useState<"table" | "bar" | "pie">("table");

  const topPages = data?.topGscPages?.web || [];
  const topQueries = data?.topQueries?.web || [];
  const devices = data?.devices?.web || [];
  const countries = data?.countries?.web || [];

  const periodLabel = data?.selected?.period_label || "Periode Aktif";
  const websiteName = data?.website?.name || "Website";

  // Data for current selected dimension
  const reportRows = useMemo(() => {
    if (dimension === "pages") {
      return topPages.slice(0, 10).map((p: any) => {
        let label = p.page;
        try { label = new URL(p.page).pathname || "/"; } catch {}
        return { name: label, clicks: p.clicks || 0, impressions: p.impressions || 0, ctr: p.ctr || 0 };
      });
    }
    if (dimension === "queries") {
      return topQueries.slice(0, 10).map((q: any) => ({
        name: q.query,
        clicks: q.clicks || 0,
        impressions: q.impressions || 0,
        ctr: q.ctr || 0,
        pos: q.averagePosition || 0,
      }));
    }
    if (dimension === "devices") {
      return devices.map((d: any) => ({
        name: String(d.device),
        clicks: d.clicks || 0,
        impressions: d.impressions || 0,
        ctr: d.ctr || 0,
        pos: d.averagePosition || 0,
      }));
    }
    if (dimension === "countries") {
      return countries.slice(0, 10).map((c: any) => {
        const info = getCountryDisplay(c.name);
        return {
          name: `${info.flag} ${info.name}`,
          clicks: c.clicks || 0,
          impressions: c.impressions || 0,
          ctr: c.ctr || 0,
          pos: c.averagePosition || 0,
        };
      });
    }
    return [];
  }, [dimension, topPages, topQueries, devices, countries]);

  const chartColors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Saved Reports Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Website Aktif</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold text-slate-900 truncate">{websiteName}</p>
            <p className="text-[10px] text-slate-400">{data?.website?.domain}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Periode Laporan</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold text-slate-900">{periodLabel}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Sinkronisasi Otomatis Aktif</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Format Cetak / Ekspor</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Laporan Resmi Eksekutif A4</p>
            <button
              type="button"
              onClick={() => setShowExecutiveModal(true)}
              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Buka Dokumen Resmi →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Status Database</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Tersinkronisasi Penuh</p>
            <p className="text-[10px] text-slate-400">Google Search & Analytics</p>
          </div>
        </div>
      </div>

      {/* Custom Report Builder Wizard */}
      <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-sm space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Penyusun Laporan Interaktif (Custom Report Builder)</h3>
            <p className="text-xs text-slate-500">Pilih dimensi dan format tampilan untuk melihat data riil secara instan.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowExecutiveModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 hover:from-purple-700 hover:to-indigo-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Dokumen Resmi A4 (PDF)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            {/* Step 1: Dimensi */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
                Pilih Dimensi Data
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: "pages", label: "Halaman (Pages)" },
                  { id: "queries", label: "Kata Kunci (Queries)" },
                  { id: "devices", label: "Perangkat (Devices)" },
                  { id: "countries", label: "Negara (Countries)" },
                ].map((dim) => (
                  <button
                    key={dim.id}
                    onClick={() => setDimension(dim.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      dimension === dim.id
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {dim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Format Visual */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                Pilih Format Visual
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: "table", label: "Tabel Rinci" },
                  { id: "bar", label: "Grafik Batang (Bar Chart)" },
                  { id: "pie", label: "Grafik Donut (Pie)" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setVisualFormat(fmt.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      visualFormat === fmt.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
              <p className="font-bold text-slate-800">Informasi Laporan:</p>
              <p>Website: <strong>{websiteName}</strong></p>
              <p>Periode: <strong>{periodLabel}</strong></p>
              <p>Jumlah Entri Dimensi: <strong>{reportRows.length} baris</strong></p>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs">
                Pratinjau Data Riil: {dimension.toUpperCase()}
              </h4>
              <span className="text-[10px] text-slate-400">Live preview</span>
            </div>

            {visualFormat === "table" && (
              <div className="overflow-x-auto max-h-72 custom-scrollbar bg-white rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left data-table">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th>Nama / Label</th>
                      <th className="right">Klik</th>
                      <th className="right">Tayangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.length > 0 ? (
                      reportRows.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="font-medium text-slate-800 max-w-xs truncate" title={r.name}>{r.name}</td>
                          <td className="right font-bold text-slate-900">{formatNumber(r.clicks)}</td>
                          <td className="right text-slate-600">{formatNumber(r.impressions)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-6 text-slate-400">Tidak ada data.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {visualFormat === "bar" && (
              <div className="h-64 bg-white p-3 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportRows.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(val: any) => [`${formatNumber(val)} klik`, "Klik"]} />
                    <Bar dataKey="clicks" radius={[0, 6, 6, 0]}>
                      {reportRows.slice(0, 6).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {visualFormat === "pie" && (
              <div className="h-64 bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={reportRows.slice(0, 5)} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="clicks">
                      {reportRows.slice(0, 5).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${formatNumber(val)} klik`, "Klik"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 text-[10px] font-bold text-slate-600">
                  {reportRows.slice(0, 4).map((r: any, idx: number) => (
                    <span key={idx} style={{ color: chartColors[idx % chartColors.length] }}>
                      ● {r.name.length > 15 ? r.name.slice(0, 15) + "…" : r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executive Official A4 Report Modal */}
      {showExecutiveModal && (
        <ExecutiveReportModal
          data={data}
          isComparing={isComparing}
          onClose={() => setShowExecutiveModal(false)}
        />
      )}
    </div>
  );
}

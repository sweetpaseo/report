"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, Share2, Plus, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from "recharts";

const previewData = [
  { name: "/pipa-hdpe", klik: 3245, tayang: 16200 },
  { name: "/pipa-ppr", klik: 2180, tayang: 10850 },
  { name: "/talang-air", klik: 1856, tayang: 8540 },
  { name: "/pipa-pvc", klik: 1402, tayang: 6120 },
];

export function ReportsView({ data }: { data: any }) {
  const [reportFormat, setReportFormat] = useState("Tabel");

  return (
    <div className="space-y-6">
      {/* Top 4 Saved Reports & Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Laporan Tersimpan</p>
          <div className="space-y-1.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Performa Bulanan Website</p>
            <p className="text-[10px] text-slate-400">Dibuat 28 Apr 2025 • Oleh Anda</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Jadwal Laporan</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Laporan Mingguan (Senin 09:00)</p>
            <p className="text-[10px] text-emerald-600 font-bold">Aktif Automasi Email</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Template Laporan</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Ringkasan Kinerja Website</p>
            <button className="text-[10px] font-bold text-indigo-600">Gunakan Template →</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-all">
          <p className="text-xs font-extrabold text-slate-900">Riwayat Ekspor</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Performa Bulanan (PDF)</p>
            <p className="text-[10px] text-slate-400">30 Apr 2025 • 09:12</p>
          </div>
        </div>
      </div>

      {/* 5-Step Custom Report Builder Wizard Panel */}
      <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Buat Laporan Khusus (Custom Report Builder)</h3>
            <p className="text-xs text-slate-500">Bangun laporan sesuai kebutuhan Anda dalam 5 langkah mudah.</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors">
            Pratinjau Laporan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Wizard Steps */}
          <div className="space-y-5">
            {/* Step 1 */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
                Pilih Dimensi (Data Utama)
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200">Halaman</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">Perangkat</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">Negara</span>
                <button className="px-3 py-1 border border-dashed border-slate-300 text-slate-500 rounded-lg font-bold">+ Tambah Dimensi</button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                Pilih Metrik (Data yang Diukur)
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200">Klik</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200">Tayang</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200">CTR</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">Posisi Rata-rata</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                Tambahkan Filter (Opsional)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
                  <option>Rentang: 1 Mei - 31 Mei 2025</option>
                </select>
                <select className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
                  <option>Negara: Semua</option>
                </select>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
                Pilih Format Visual
              </p>
              <div className="flex gap-2 text-xs">
                {["Tabel", "Line Chart", "Bar Chart", "Donut Chart"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setReportFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                      reportFormat === fmt ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Live Interactive Recharts Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <p className="text-xs font-extrabold text-slate-900">Ringkasan Laporan (Pratinjau Format: {reportFormat})</p>

            {reportFormat === "Tabel" && (
              <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                <table className="w-full text-xs text-left data-table">
                  <thead>
                    <tr>
                      <th>Halaman</th>
                      <th className="right">Klik</th>
                      <th className="right">Tayang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        <td className="font-mono text-slate-800">{row.name}</td>
                        <td className="right font-bold text-slate-900">{row.klik}</td>
                        <td className="right text-slate-600">{row.tayang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportFormat === "Line Chart" && (
              <div className="h-48 bg-white p-2 rounded-lg border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={previewData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="klik" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {reportFormat === "Bar Chart" && (
              <div className="h-48 bg-white p-2 rounded-lg border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={previewData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="klik" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {reportFormat === "Donut Chart" && (
              <div className="h-48 bg-white p-2 rounded-lg border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={previewData} dataKey="klik" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                      {previewData.map((_, i) => (
                        <Cell key={i} fill={["#8b5cf6", "#6366f1", "#3b82f6", "#10b981"][i % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

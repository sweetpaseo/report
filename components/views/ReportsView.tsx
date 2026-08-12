"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, Share2, Plus, CheckCircle2, Table, LineChart, BarChart2, PieChart } from "lucide-react";

export function ReportsView({ data }: { data: any }) {
  const [reportFormat, setReportFormat] = useState("Tabel");

  return (
    <div className="space-y-6">
      {/* Top 4 Saved Reports & Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-xs font-extrabold text-slate-900">Laporan Tersimpan</p>
          <div className="space-y-1.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Performa Bulanan Website</p>
            <p className="text-[10px] text-slate-400">Dibuat 28 Apr 2025 • Oleh Anda</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-xs font-extrabold text-slate-900">Jadwal Laporan</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Laporan Mingguan (Senin 09:00)</p>
            <p className="text-[10px] text-emerald-600 font-bold">Aktif Automasi Email</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-xs font-extrabold text-slate-900">Template Laporan</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Ringkasan Kinerja Website</p>
            <button className="text-[10px] font-bold text-indigo-600">Gunakan Template →</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
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
          <button className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700">
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
                    className={`px-3 py-1.5 rounded-xl font-bold border ${reportFormat === fmt ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Live Preview Table */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs font-extrabold text-slate-900">Ringkasan Laporan (Pratinjau)</p>
            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left data-table">
                <thead>
                  <tr>
                    <th>Halaman</th>
                    <th className="right">Klik</th>
                    <th className="right">Tayang</th>
                    <th className="right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-slate-800">/pipa-hdpe</td>
                    <td className="right font-bold">3.245</td>
                    <td className="right text-slate-600">16.200</td>
                    <td className="right text-slate-600">20,0%</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-slate-800">/pipa-ppr</td>
                    <td className="right font-bold">2.180</td>
                    <td className="right text-slate-600">10.850</td>
                    <td className="right text-slate-600">20,1%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

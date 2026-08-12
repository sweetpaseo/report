"use client";

import React from "react";
import { Smartphone, Monitor, Tablet, TrendingUp, Sparkles } from "lucide-react";
import { Sparkline } from "@/components/sparkline";

export function DevicesView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* 4 Device KPI Cards with mini sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">Porsi Trafik</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between"><span>Mobile</span> <span className="text-purple-600">68,7% ▲ 3,2%</span></div>
            <div className="flex justify-between text-slate-500"><span>Desktop</span> <span>28,3% ▼ 2,1%</span></div>
            <div className="flex justify-between text-slate-400"><span>Tablet</span> <span>3,0% ▼ 1,1%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">Porsi Klik</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between"><span>Mobile</span> <span className="text-purple-600">66,1% ▲ 2,9%</span></div>
            <div className="flex justify-between text-slate-500"><span>Desktop</span> <span>30,6% ▼ 1,8%</span></div>
            <div className="flex justify-between text-slate-400"><span>Tablet</span> <span>3,3% ▼ 1,1%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">Porsi Sesi</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between"><span>Mobile</span> <span className="text-purple-600">64,9% ▲ 2,6%</span></div>
            <div className="flex justify-between text-slate-500"><span>Desktop</span> <span>32,2% ▼ 1,6%</span></div>
            <div className="flex justify-between text-slate-400"><span>Tablet</span> <span>2,9% ▼ 1,0%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">Rasio Konversi</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between"><span>Desktop</span> <span className="text-emerald-600">3,45% ▲ 10,1%</span></div>
            <div className="flex justify-between text-slate-600"><span>Mobile</span> <span className="text-purple-600">2,10% ▲ 15,2%</span></div>
            <div className="flex justify-between text-slate-400"><span>Tablet</span> <span>1,45% ▲ 8,9%</span></div>
          </div>
        </div>
      </div>

      {/* Device Performance Comparison Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Perbandingan Performa per Perangkat</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Device</th>
                <th className="right">Klik</th>
                <th className="right">Tayang</th>
                <th className="right">Pengguna</th>
                <th className="right">Sesi</th>
                <th className="right">Engagement</th>
                <th className="right">Konversi</th>
                <th className="right">Rasio Konversi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" /> Mobile
                </td>
                <td className="right font-bold text-slate-900">15.560</td>
                <td className="right text-slate-600">188.920</td>
                <td className="right text-slate-600">16.168</td>
                <td className="right text-slate-600">19.320</td>
                <td className="right text-slate-600">68,2%</td>
                <td className="right text-slate-600">406</td>
                <td className="right font-bold text-purple-600">2,10%</td>
              </tr>
              <tr>
                <td className="font-bold text-slate-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-600" /> Desktop
                </td>
                <td className="right font-bold text-slate-900">7.190</td>
                <td className="right text-slate-600">104.560</td>
                <td className="right text-slate-600">6.652</td>
                <td className="right text-slate-600">9.550</td>
                <td className="right text-slate-600">72,5%</td>
                <td className="right text-slate-600">329</td>
                <td className="right font-bold text-emerald-600">3,45%</td>
              </tr>
              <tr>
                <td className="font-bold text-slate-900 flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-amber-500" /> Tablet
                </td>
                <td className="right font-bold text-slate-900">780</td>
                <td className="right text-slate-600">12.480</td>
                <td className="right text-slate-600">720</td>
                <td className="right text-slate-600">950</td>
                <td className="right text-slate-600">61,0%</td>
                <td className="right text-slate-600">14</td>
                <td className="right text-slate-600">1,45%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

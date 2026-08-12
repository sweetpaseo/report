"use client";

import React from "react";
import { Globe, TrendingUp, Sparkles, MapPin } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const topCountryBarData = [
  { name: "Indonesia 🇮🇩", klik: 32546, color: "#6366f1" },
  { name: "USA 🇺🇸", klik: 18241, color: "#3b82f6" },
  { name: "India 🇮🇳", klik: 9876, color: "#8b5cf6" },
  { name: "Singapura 🇸🇬", klik: 7214, color: "#10b981" },
  { name: "Malaysia 🇲🇾", klik: 6103, color: "#f59e0b" },
];

export function CountriesView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Kontribusi Terbesar</p>
          <p className="text-xl font-extrabold text-slate-900">Indonesia 🇮🇩</p>
          <p className="text-xs font-bold text-purple-600">32.546 klik (32,5%)</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Negara Aktif</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">87</p>
          <p className="text-[10px] text-emerald-600 font-bold">▲ 12 vs periode lalu</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Rasio Konversi Tertinggi</p>
          <p className="text-xl font-extrabold text-slate-900">Singapura 🇸🇬</p>
          <p className="text-xs font-bold text-emerald-600">4,85% rasio konversi</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Pertumbuhan Tertinggi</p>
          <p className="text-xl font-extrabold text-slate-900">Vietnam 🇻🇳</p>
          <p className="text-xs font-bold text-emerald-600">▲ 68,4% kenaikan klik</p>
        </div>
      </div>

      {/* Interactive World Heatmap & Top 5 Country Recharts BarChart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Performa Klik per Negara (Choropleth Heatmap)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Choropleth SVG Map Visualizer */}
          <div className="md:col-span-2 h-64 bg-indigo-50/40 rounded-xl border border-indigo-100 p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
            <Globe className="w-24 h-24 text-indigo-400 stroke-1 animate-spin" style={{ animationDuration: "30s" }} />
            <p className="text-xs font-bold text-indigo-900">Peta Dunia Interaktif (Google Search Console Geolocation)</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-2">
              <span>Rendah</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-600"></div>
              <span>Tinggi</span>
            </div>
          </div>

          {/* Top 5 Country Recharts Horizontal Bar Chart */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 h-64 flex flex-col justify-between">
            <p className="text-xs font-extrabold text-slate-900">Top 5 Negara (Klik)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCountryBarData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "11px" }} />
                  <Bar dataKey="klik" radius={[0, 6, 6, 0]}>
                    {topCountryBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Globe, TrendingUp, Sparkles, MapPin } from "lucide-react";

export function CountriesView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Kontribusi Terbesar</p>
          <p className="text-xl font-extrabold text-slate-900">Indonesia 🇮🇩</p>
          <p className="text-xs font-bold text-purple-600">32.546 klik (32,5%)</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Negara Aktif</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">87</p>
          <p className="text-[10px] text-emerald-600 font-bold">▲ 12 vs periode lalu</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Rasio Konversi Tertinggi</p>
          <p className="text-xl font-extrabold text-slate-900">Singapura 🇸🇬</p>
          <p className="text-xs font-bold text-emerald-600">4,85% rasio konversi</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Pertumbuhan Tertinggi</p>
          <p className="text-xl font-extrabold text-slate-900">Vietnam 🇻🇳</p>
          <p className="text-xs font-bold text-emerald-600">▲ 68,4% kenaikan klik</p>
        </div>
      </div>

      {/* Interactive World Map & Top 5 Countries Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Performa Klik per Negara (Choropleth Heatmap)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 h-64 bg-indigo-50/40 rounded-xl border border-indigo-100 p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
            <Globe className="w-24 h-24 text-indigo-300 stroke-1" />
            <p className="text-xs font-bold text-indigo-900">Peta Dunia Interaktif (Google Search Console Geolocation)</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-2">
              <span>Rendah</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-600"></div>
              <span>Tinggi</span>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-extrabold text-slate-900">Top 5 Negara Berdasarkan Klik</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold"><span>1. 🇮🇩 Indonesia</span> <span>32.546 (32,5%)</span></div>
              <div className="flex justify-between items-center"><span>2. 🇺🇸 Amerika Serikat</span> <span>18.241 (18,2%)</span></div>
              <div className="flex justify-between items-center"><span>3. 🇮🇳 India</span> <span>9.876 (9,8%)</span></div>
              <div className="flex justify-between items-center"><span>4. 🇸🇬 Singapura</span> <span>7.214 (7,2%)</span></div>
              <div className="flex justify-between items-center"><span>5. 🇲🇾 Malaysia</span> <span>6.103 (6,1%)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

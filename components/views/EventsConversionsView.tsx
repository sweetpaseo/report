"use client";

import React from "react";
import { Target, TrendingUp, CheckCircle2, Zap } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/view-helpers";

export function EventsConversionsView({ data }: { data: any }) {
  const events = data?.events || [];
  const totalEventCount = events.reduce((sum: number, e: any) => sum + (e.count || 0), 0);
  const totalKeyEvents = events.reduce((sum: number, e: any) => sum + (e.keyCount || 0), 0);
  const conversionRate = data?.metrics?.["ga.chat_conversion_rate"] || (totalEventCount > 0 ? (totalKeyEvents / totalEventCount) * 100 : 0);
  const topEvent = events[0];

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Total Event Terlacak</p>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatNumber(totalEventCount)}
          </p>
          <span className="text-[10px] font-bold text-indigo-600">{events.length} jenis interaksi GA4</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Key Events (Konversi)</p>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {formatNumber(totalKeyEvents)}
          </p>
          <span className="text-[10px] font-bold text-emerald-600">tindakan bernilai tinggi</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Rasio Konversi</p>
          <p className="text-2xl font-extrabold text-purple-600 tabular-nums">
            {formatPercent(conversionRate, 2)}
          </p>
          <span className="text-[10px] text-slate-400">dari aktivitas audiens</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1 hover:shadow-md transition-all">
          <p className="text-[11px] font-bold text-slate-400">Event Paling Sering Terjadi</p>
          <p className="text-lg font-extrabold text-slate-900 truncate" title={topEvent?.name}>
            {topEvent?.name || "-"}
          </p>
          <p className="text-[10px] text-slate-500">
            {topEvent ? `${formatNumber(topEvent.count)} kali` : "Belum ada event"}
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" /> Daftar Event & Interaksi Pengguna (GA4)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Seluruh tindakan pengguna yang dicatat oleh Google Analytics 4</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: <strong>{events.length} event</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Nama Event</th>
                <th className="right">Jumlah Eksekusi</th>
                <th className="right">Key Events (Konversi)</th>
                <th className="right">Kontribusi Total</th>
                <th className="center">Klasifikasi</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((ev: any, idx: number) => {
                  const pct = totalEventCount > 0 ? Math.round(((ev.count || 0) / totalEventCount) * 100) : 0;
                  const isKey = (ev.keyCount || 0) > 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="font-bold text-slate-900 font-mono">{ev.name}</td>
                      <td className="right font-extrabold text-slate-900">{formatNumber(ev.count)}</td>
                      <td className="right font-bold text-emerald-600">{formatNumber(ev.keyCount)}</td>
                      <td className="right text-slate-600">{pct}%</td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isKey ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }`}>
                          {isKey ? "Key Event ★" : "Standar"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Belum ada data event GA4 yang tercatat untuk periode ini.
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

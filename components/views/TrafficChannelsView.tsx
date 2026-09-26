"use client";

import React, { useMemo } from "react";
import { Share2, TrendingUp, Layers } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { formatNumber, formatPercent } from "@/lib/view-helpers";

export function TrafficChannelsView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const channels = data?.channels || [];
  const sourceMedium = data?.sourceMedium || [];
  const totalSessions = data?.metrics?.["ga.sessions"] || channels.reduce((sum: number, c: any) => sum + (c.sessions || 0), 0) || 1;

  const channelColors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

  const barData = useMemo(() => {
    return channels.map((c: any, idx: number) => ({
      name: c.channel,
      sesi: c.sessions || 0,
      penggunaBaru: c.newUsers || 0,
      color: channelColors[idx % channelColors.length],
    }));
  }, [channels]);

  return (
    <div className="space-y-6">
      {/* Channel Acquisition Bar Chart Recharts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600" /> Perbandingan Trafik per Channel (GA4)
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Total Sesi: <strong className="text-slate-800">{formatNumber(totalSessions)}</strong>
          </span>
        </div>

        <div className="h-64">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${formatNumber(val)} sesi`, "Sesi"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="sesi" radius={[8, 8, 0, 0]} name="Sesi">
                  {barData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data channel pada Google Analytics.
            </div>
          )}
        </div>
      </div>

      {/* Channel Table Data */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Rincian Performa Saluran Trafik (Channel Grouping)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Channel Grouping</th>
                <th className="right">Sesi</th>
                <th className="right">Porsi Sesi</th>
                <th className="right">Pengguna Baru</th>
              </tr>
            </thead>
            <tbody>
              {channels.length > 0 ? (
                channels.map((row: any, idx: number) => {
                  const pct = Math.round(((row.sessions || 0) / totalSessions) * 100);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="font-bold text-slate-900">{row.channel}</td>
                      <td className="right font-extrabold text-slate-900">{formatNumber(row.sessions)}</td>
                      <td className="right font-bold text-indigo-600">{pct}%</td>
                      <td className="right text-slate-600">{formatNumber(row.newUsers)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-400">
                    Belum ada data saluran trafik.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source / Medium Breakdown (if available) */}
      {sourceMedium.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" /> Sumber & Media Trafik (Source / Medium)
          </h3>
          <div className="overflow-x-auto max-h-60 custom-scrollbar">
            <table className="w-full text-xs text-left data-table">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th>Sumber / Media</th>
                  <th className="right">Sesi</th>
                  <th className="right">Pengguna Aktif</th>
                </tr>
              </thead>
              <tbody>
                {sourceMedium.map((sm: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="font-semibold text-slate-800">{sm.sourceMedium || "(direct) / (none)"}</td>
                    <td className="right font-bold text-slate-900">{formatNumber(sm.sessions)}</td>
                    <td className="right text-slate-600">{formatNumber(sm.activeUsers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

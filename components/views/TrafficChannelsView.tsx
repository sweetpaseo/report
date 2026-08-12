"use client";

import React from "react";
import { Share2, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const channelBarData = [
  { name: "Organic Search", sesi: 15240, color: "#6366f1" },
  { name: "Direct", sesi: 6580, color: "#3b82f6" },
  { name: "Referral", sesi: 4080, color: "#10b981" },
  { name: "Social", sesi: 2950, color: "#f59e0b" },
  { name: "Paid Search", sesi: 820, color: "#ec4899" },
];

export function TrafficChannelsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Channel Acquisition Bar Chart Recharts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-600" /> Perbandingan Trafik per Channel (GA4)
        </h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Bar dataKey="sesi" radius={[8, 8, 0, 0]} name="Sesi">
                {channelBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Rincian Performa Channel</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Channel Grouping</th>
                <th className="right">Sesi</th>
                <th className="right">Pengguna Baru</th>
                <th className="right">Engagement Rate</th>
                <th className="right">Konversi</th>
                <th className="right">Rasio Konversi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Organic Search", sessions: "15.240", newUsers: "11.200", eng: "68,1%", conv: "1.024", rate: "6,72%" },
                { name: "Direct", sessions: "6.580", newUsers: "4.890", eng: "72,4%", conv: "912", rate: "4,65%" },
                { name: "Referral", sessions: "4.080", newUsers: "3.120", eng: "64,2%", conv: "542", rate: "3,29%" },
                { name: "Social", sessions: "2.950", newUsers: "2.100", eng: "58,9%", conv: "312", rate: "2,24%" },
                { name: "Paid Search", sessions: "820", newUsers: "650", eng: "54,1%", conv: "153", rate: "1,86%" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="font-bold text-slate-900">{row.name}</td>
                  <td className="right font-bold text-slate-900">{row.sessions}</td>
                  <td className="right text-slate-600">{row.newUsers}</td>
                  <td className="right text-slate-600">{row.eng}</td>
                  <td className="right text-slate-600">{row.conv}</td>
                  <td className="right font-bold text-emerald-600">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Share2, TrendingUp } from "lucide-react";

export function TrafficChannelsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-600" /> Analisis Channel Trafik (GA4 Acquisition)
        </h3>
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
                <tr key={idx}>
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

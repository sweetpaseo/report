"use client";

import React, { useMemo } from "react";
import { Smartphone, Monitor, Tablet, TrendingUp, Sparkles } from "lucide-react";
import {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatPosition,
} from "@/lib/view-helpers";

export function DevicesView({
  data,
  isComparing = true,
}: {
  data: any;
  isComparing?: boolean;
}) {
  const rawDevices = data?.devices?.web || [];
  const deviceModels = data?.deviceModels || [];

  // Group and normalize device metrics
  const { mobile, desktop, tablet, totalClicks, totalImpressions } = useMemo(() => {
    let mob = { clicks: 0, impressions: 0, ctr: 0, posSum: 0, count: 0 };
    let dsk = { clicks: 0, impressions: 0, ctr: 0, posSum: 0, count: 0 };
    let tab = { clicks: 0, impressions: 0, ctr: 0, posSum: 0, count: 0 };

    rawDevices.forEach((d: any) => {
      const type = String(d.device).toUpperCase();
      const target = type.includes("MOB") ? mob : type.includes("DESK") ? dsk : tab;
      target.clicks += d.clicks || 0;
      target.impressions += d.impressions || 0;
      if (d.averagePosition) {
        target.posSum += (d.averagePosition || 0) * (d.impressions || 1);
        target.count += d.impressions || 1;
      }
    });

    const totC = mob.clicks + dsk.clicks + tab.clicks || 1;
    const totI = mob.impressions + dsk.impressions + tab.impressions || 1;

    return {
      mobile: {
        clicks: mob.clicks,
        impressions: mob.impressions,
        ctr: mob.impressions > 0 ? (mob.clicks / mob.impressions) * 100 : 0,
        avgPos: mob.count > 0 ? mob.posSum / mob.count : 0,
        shareClicks: Math.round((mob.clicks / totC) * 1000) / 10,
        shareImpressions: Math.round((mob.impressions / totI) * 1000) / 10,
      },
      desktop: {
        clicks: dsk.clicks,
        impressions: dsk.impressions,
        ctr: dsk.impressions > 0 ? (dsk.clicks / dsk.impressions) * 100 : 0,
        avgPos: dsk.count > 0 ? dsk.posSum / dsk.count : 0,
        shareClicks: Math.round((dsk.clicks / totC) * 1000) / 10,
        shareImpressions: Math.round((dsk.impressions / totI) * 1000) / 10,
      },
      tablet: {
        clicks: tab.clicks,
        impressions: tab.impressions,
        ctr: tab.impressions > 0 ? (tab.clicks / tab.impressions) * 100 : 0,
        avgPos: tab.count > 0 ? tab.posSum / tab.count : 0,
        shareClicks: Math.round((tab.clicks / totC) * 1000) / 10,
        shareImpressions: Math.round((tab.impressions / totI) * 1000) / 10,
      },
      totalClicks: totC,
      totalImpressions: totI,
    };
  }, [rawDevices]);

  return (
    <div className="space-y-6">
      {/* 4 Device KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Porsi Klik */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">Porsi Klik Organik</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-purple-600" /> Mobile</span>
              <span className="text-purple-600">{mobile.shareClicks}% ({formatNumber(mobile.clicks)})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-indigo-600" /> Desktop</span>
              <span>{desktop.shareClicks}% ({formatNumber(desktop.clicks)})</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-amber-500" /> Tablet</span>
              <span>{tablet.shareClicks}% ({formatNumber(tablet.clicks)})</span>
            </div>
          </div>
        </div>

        {/* Card 2: Porsi Tayangan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">Porsi Tayangan (Impresi)</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-purple-600" /> Mobile</span>
              <span className="text-purple-600">{mobile.shareImpressions}% ({formatCompactNumber(mobile.impressions)})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-indigo-600" /> Desktop</span>
              <span>{desktop.shareImpressions}% ({formatCompactNumber(desktop.impressions)})</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-amber-500" /> Tablet</span>
              <span>{tablet.shareImpressions}% ({formatCompactNumber(tablet.impressions)})</span>
            </div>
          </div>
        </div>

        {/* Card 3: CTR per Perangkat */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">CTR per Perangkat</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-purple-600" /> Mobile</span>
              <span className="text-purple-600">{formatPercent(mobile.ctr, 2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-indigo-600" /> Desktop</span>
              <span>{formatPercent(desktop.ctr, 2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-amber-500" /> Tablet</span>
              <span>{formatPercent(tablet.ctr, 2)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Posisi Rata-rata */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400">Posisi Rata-rata di Google</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-purple-600" /> Mobile</span>
              <span className="text-purple-600">{formatPosition(mobile.avgPos)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-indigo-600" /> Desktop</span>
              <span>{formatPosition(desktop.avgPos)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-amber-500" /> Tablet</span>
              <span>{formatPosition(tablet.avgPos)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Performance Comparison Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Perbandingan Performa per Perangkat (GSC)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left data-table">
            <thead>
              <tr>
                <th>Perangkat</th>
                <th className="right">Klik</th>
                <th className="right">Porsi Klik</th>
                <th className="right">Tayangan</th>
                <th className="right">Porsi Tayangan</th>
                <th className="right">CTR</th>
                <th className="center">Posisi Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" /> Ponsel (Mobile)
                </td>
                <td className="right font-extrabold text-slate-900">{formatNumber(mobile.clicks)}</td>
                <td className="right font-bold text-purple-600">{mobile.shareClicks}%</td>
                <td className="right text-slate-600">{formatNumber(mobile.impressions)}</td>
                <td className="right text-slate-600">{mobile.shareImpressions}%</td>
                <td className="right font-bold text-slate-800">{formatPercent(mobile.ctr, 2)}</td>
                <td className="text-center"><span className="pos-badge pos-badge-green">{formatPosition(mobile.avgPos)}</span></td>
              </tr>
              <tr>
                <td className="font-bold text-slate-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-600" /> Komputer (Desktop)
                </td>
                <td className="right font-extrabold text-slate-900">{formatNumber(desktop.clicks)}</td>
                <td className="right font-bold text-indigo-600">{desktop.shareClicks}%</td>
                <td className="right text-slate-600">{formatNumber(desktop.impressions)}</td>
                <td className="right text-slate-600">{desktop.shareImpressions}%</td>
                <td className="right font-bold text-slate-800">{formatPercent(desktop.ctr, 2)}</td>
                <td className="text-center"><span className="pos-badge pos-badge-green">{formatPosition(desktop.avgPos)}</span></td>
              </tr>
              <tr>
                <td className="font-bold text-slate-900 flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-amber-500" /> Tablet
                </td>
                <td className="right font-extrabold text-slate-900">{formatNumber(tablet.clicks)}</td>
                <td className="right font-bold text-amber-600">{tablet.shareClicks}%</td>
                <td className="right text-slate-600">{formatNumber(tablet.impressions)}</td>
                <td className="right text-slate-600">{tablet.shareImpressions}%</td>
                <td className="right font-bold text-slate-800">{formatPercent(tablet.ctr, 2)}</td>
                <td className="text-center"><span className="pos-badge pos-badge-yellow">{formatPosition(tablet.avgPos)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Device Models (if available from GA4) */}
      {deviceModels.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <h4 className="font-extrabold text-slate-900 text-xs">Model Perangkat Terpopuler (Google Analytics 4)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deviceModels.slice(0, 8).map((m: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-800 truncate" title={m.model}>{m.model || "Unknown"}</p>
                <p className="text-[11px] text-indigo-600 font-semibold">{formatNumber(m.activeUsers)} pengguna</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

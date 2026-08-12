"use client";

import React from "react";
import {
  LayoutDashboard,
  Search,
  LineChart,
  FileText,
  KeyRound,
  Smartphone,
  Globe,
  Share2,
  Target,
  Sparkles,
  Lightbulb,
  Bell,
  FileSpreadsheet,

  HelpCircle,
  Zap,
} from "lucide-react";

export type NavTabId =
  | "ringkasan"
  | "search_performance"
  | "analytics_performance"
  | "pages"
  | "queries"
  | "devices"
  | "countries"
  | "traffic_channels"
  | "events_conversions"
  | "ai_insight"
  | "rekomendasi"
  | "notifikasi_isu"
  | "laporan";

interface SidebarNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  issuesCount?: number;
}

export const NAV_ITEMS: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ringkasan", label: "Ringkasan", icon: LayoutDashboard },
  { id: "search_performance", label: "Search Performance", icon: Search },
  { id: "analytics_performance", label: "Analytics Performance", icon: LineChart },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "queries", label: "Queries", icon: KeyRound },
  { id: "devices", label: "Devices", icon: Smartphone },
  { id: "countries", label: "Countries", icon: Globe },
  { id: "traffic_channels", label: "Traffic Channels", icon: Share2 },
  { id: "events_conversions", label: "Events & Conversions", icon: Target },
  { id: "ai_insight", label: "AI Insight", icon: Sparkles },
  { id: "rekomendasi", label: "Rekomendasi", icon: Lightbulb },
  { id: "notifikasi_isu", label: "Notifikasi & Isu", icon: Bell },
  { id: "laporan", label: "Laporan", icon: FileSpreadsheet },
];

export function SidebarNav({ activeTab, onSelectTab, issuesCount = 42 }: SidebarNavProps) {
  return (
    <aside className="w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
          AcS
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-sm leading-tight">AI Creative Studio</h1>
          <p className="text-[11px] font-medium text-slate-400">Studio Analytics</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.id === "notifikasi_isu" && issuesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                  }`}
                >
                  {issuesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Widgets */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        {/* Help Banner */}
        <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100/80 text-left">
          <div className="flex items-center gap-2 mb-1 text-indigo-700 font-bold text-[11px]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Butuh bantuan?</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">Pelajari cara membaca laporan ini</p>
          <button className="w-full text-center py-1.5 bg-white text-indigo-600 rounded-lg text-[11px] font-bold border border-indigo-200 hover:bg-indigo-50 transition-colors">
            Buka Panduan
          </button>
        </div>

        {/* User / Admin Card */}
        <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              E
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">Erihome Team</p>
              <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Zap className="w-3 h-3 fill-amber-500" />
            <span>Pro</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React, { useState } from "react";
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
  MessageCircle,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  ShieldCheck,
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
  | "core_web_vitals"
  | "social_media"
  | "user_management"
  | "ai_insight"
  | "rekomendasi"
  | "notifikasi_isu"
  | "laporan";

interface SidebarNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  issuesCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  userRole?: string;
  canViewWebsiteHub?: boolean;
  userName?: string;
}

export const WEBSITE_SUB_ITEMS: {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "ringkasan", label: "Ringkasan", icon: LayoutDashboard },
  { id: "search_performance", label: "Search Performance", icon: Search },
  { id: "analytics_performance", label: "Analytics Performance", icon: LineChart },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "queries", label: "Queries", icon: KeyRound },
  { id: "devices", label: "Devices", icon: Smartphone },
  { id: "countries", label: "Countries", icon: Globe },
  { id: "traffic_channels", label: "Traffic Channels", icon: Share2 },
  { id: "events_conversions", label: "Events & Conversions", icon: Target },
  { id: "core_web_vitals", label: "Kecepatan & Vitals", icon: Zap },
  { id: "ai_insight", label: "AI Insight", icon: Sparkles },
  { id: "rekomendasi", label: "Rekomendasi", icon: Lightbulb },
  { id: "notifikasi_isu", label: "Notifikasi & Isu", icon: Bell },
  { id: "laporan", label: "Laporan", icon: FileSpreadsheet },
];

export const NAV_ITEMS: {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  ...WEBSITE_SUB_ITEMS,
  { id: "social_media", label: "Social Media Hub", icon: MessageCircle },
  { id: "user_management", label: "User & Hak Akses", icon: ShieldCheck },
];

export function SidebarNav({
  activeTab,
  onSelectTab,
  issuesCount = 42,
  isOpenMobile = false,
  onCloseMobile,
  userRole = "admin",
  canViewWebsiteHub = true,
  userName,
}: SidebarNavProps) {
  const isWebsiteActive = activeTab !== "social_media" && activeTab !== "user_management";
  const [websiteHubOpen, setWebsiteHubOpen] = useState(true);

  const handleItemClick = (id: NavTabId) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20 shrink-0">
            AcS
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-slate-900 text-xs leading-tight truncate">AI Creative Studio</h1>
            <p className="text-[10px] font-medium text-slate-400">Studio Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full"
            title={`Versi ${process.env.NEXT_PUBLIC_APP_VERSION || "0.2.1"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold text-emerald-700">v{process.env.NEXT_PUBLIC_APP_VERSION || "0.2.1"}</span>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        <p className="px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
          Menu Utama
        </p>

        {/* 1. MAIN MENU: Website Hub (Hanya jika memiliki akses) */}
        {canViewWebsiteHub && (
          <div className="space-y-1">
            <button
              onClick={() => {
                if (!isWebsiteActive) {
                  handleItemClick("ringkasan");
                  setWebsiteHubOpen(true);
                } else {
                  setWebsiteHubOpen((prev) => !prev);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isWebsiteActive
                  ? "bg-indigo-50/90 text-indigo-950 border border-indigo-200/80 shadow-sm"
                  : "text-slate-700 hover:bg-slate-100/80 border border-slate-200/60 bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isWebsiteActive ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="truncate block font-extrabold text-xs">Website Hub</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                {issuesCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">
                    {issuesCount}
                  </span>
                )}
                {websiteHubOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Sub Menus of Website Hub */}
            {websiteHubOpen && (
              <div className="ml-3 pl-2.5 border-l-2 border-indigo-100 space-y-0.5 pt-1 pb-1">
                {WEBSITE_SUB_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm font-bold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.id === "notifikasi_isu" && issuesCount > 0 && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                            isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {issuesCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. MAIN MENU: Social Media Hub */}
        <div>
          <button
            onClick={() => handleItemClick("social_media")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === "social_media"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-600"
                : "text-slate-700 hover:bg-slate-100/80 border border-slate-200/60 bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  activeTab === "social_media" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-left min-w-0">
                <span className="truncate block font-extrabold text-xs">Social Media Hub</span>
              </div>
            </div>
          </button>
        </div>

        {/* 3. ADMINISTRATION MENU: User & Hak Akses (Khusus Administrator) */}
        {userRole === "admin" && (
          <div className="pt-1">
            <button
              onClick={() => handleItemClick("user_management")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                activeTab === "user_management"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 border border-slate-900"
                  : "text-slate-700 hover:bg-slate-100/80 border border-slate-200/60 bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTab === "user_management" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="truncate block font-extrabold text-xs">User & Hak Akses</span>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-slate-200">
                Admin
              </span>
            </button>
          </div>
        )}
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

        {/* User / Staff Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
              userRole === "admin"
                ? "bg-amber-100 text-amber-800"
                : userRole === "client"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-indigo-100 text-indigo-700"
            }`}>
              {(userName || (userRole === "admin" ? "Admin" : userRole === "client" ? "Han" : "Staff")).charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                {userName || (userRole === "admin" ? "Erihome Admin" : userRole === "client" ? "Han" : "Staff User")}
              </p>
              <p className="text-[10px] text-slate-400 font-medium capitalize truncate">
                {userRole === "admin" ? "Administrator" : userRole === "client" ? "Pemeriksa Laporan" : "Staff Medsos"}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
            userRole === "admin"
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : userRole === "client"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-indigo-700 bg-indigo-50 border-indigo-200"
          }`}>
            <Zap className={`w-3 h-3 ${
              userRole === "admin"
                ? "fill-amber-500 text-amber-500"
                : userRole === "client"
                ? "fill-emerald-500 text-emerald-500"
                : "fill-indigo-500 text-indigo-500"
            }`} />
            <span>{userRole === "admin" ? "Admin" : userRole === "client" ? "Client" : "Staff"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and above only) */}
      <aside className="hidden lg:flex w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200 flex-col shrink-0 h-screen sticky top-0 z-30 select-none">
        {navContent}
      </aside>

      {/* Mobile Drawer Navigation (< lg) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative w-[285px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

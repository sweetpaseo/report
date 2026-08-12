"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav, NavTabId, NAV_ITEMS } from "./sidebar-nav";
import { OverviewView } from "./views/OverviewView";
import { SearchPerformanceView } from "./views/SearchPerformanceView";
import { AnalyticsPerformanceView } from "./views/AnalyticsPerformanceView";
import { PagesView } from "./views/PagesView";
import { QueriesView } from "./views/QueriesView";
import { DevicesView } from "./views/DevicesView";
import { CountriesView } from "./views/CountriesView";
import { TrafficChannelsView } from "./views/TrafficChannelsView";
import { EventsConversionsView } from "./views/EventsConversionsView";
import { AiInsightView } from "./views/AiInsightView";
import { RecommendationsView } from "./views/RecommendationsView";
import { NotificationsIssuesView } from "./views/NotificationsIssuesView";
import { ReportsView } from "./views/ReportsView";
import { BackupModal } from "./BackupModal";
import { GoogleApiModal } from "./GoogleApiModal";
import {
  Download,
  Calendar,
  Globe,
  Share2,
  Database,
  RefreshCw,
  LogOut,
  Sliders,
  Sparkles,
} from "lucide-react";

interface DashboardAppProps {
  initialWebsites?: any[];
  initialSelectedId?: string;
  initialData?: any;
  publicToken?: string;
  clientToken?: string;
  userRole?: string;
}

export function DashboardApp({
  initialWebsites = [],
  initialSelectedId = "",
  initialData = null,
  publicToken,
  clientToken,
}: DashboardAppProps) {
  const [activeTab, setActiveTab] = useState<NavTabId>("ringkasan");
  const [websites, setWebsites] = useState<any[]>(initialWebsites);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(
    initialSelectedId || (initialWebsites[0]?.id ?? "")
  );
  const [dashboardData, setDashboardData] = useState<any>(initialData);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showGoogleApiModal, setShowGoogleApiModal] = useState(false);
  const [isComparing, setIsComparing] = useState(true);

  const selectedWebsite = websites.find((w) => w.id === selectedWebsiteId) || websites[0];
  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeTab);

  // Fetch updated dashboard data when website or period changes
  const handleSelectWebsite = async (id: string) => {
    setSelectedWebsiteId(id);
    try {
      const res = await fetch(`/api/dashboard?websiteId=${id}`);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
      }
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        issuesCount={42}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        {/* Sticky Header Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {activeNavItem?.label || "Ringkasan"}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Ringkasan performa website Anda dari Google Search Console & Google Analytics
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Website Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={selectedWebsiteId}
                onChange={(e) => handleSelectWebsite(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.domain || w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-700">1 Mei – 31 Mei 2025</span>
            </div>

            {/* Compare Toggle */}
            <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-600">Bandingkan</span>
              <button
                onClick={() => setIsComparing(!isComparing)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  isComparing ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isComparing ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setActiveTab("laporan")}
              className="flex items-center gap-1.5 bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-xl shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Canvas */}
        <div className="p-8 max-w-[1440px] w-full mx-auto space-y-6 flex-1">
          {activeTab === "ringkasan" && (
            <OverviewView data={dashboardData} onSelectTab={(t) => setActiveTab(t)} />
          )}
          {activeTab === "search_performance" && (
            <SearchPerformanceView data={dashboardData} />
          )}
          {activeTab === "analytics_performance" && (
            <AnalyticsPerformanceView data={dashboardData} />
          )}
          {activeTab === "pages" && <PagesView data={dashboardData} />}
          {activeTab === "queries" && <QueriesView data={dashboardData} />}
          {activeTab === "devices" && <DevicesView data={dashboardData} />}
          {activeTab === "countries" && <CountriesView data={dashboardData} />}
          {activeTab === "traffic_channels" && <TrafficChannelsView data={dashboardData} />}
          {activeTab === "events_conversions" && (
            <EventsConversionsView data={dashboardData} />
          )}
          {activeTab === "ai_insight" && <AiInsightView data={dashboardData} />}
          {activeTab === "rekomendasi" && <RecommendationsView data={dashboardData} />}
          {activeTab === "notifikasi_isu" && (
            <NotificationsIssuesView data={dashboardData} />
          )}
          {activeTab === "laporan" && <ReportsView data={dashboardData} />}
        </div>
      </main>

      {/* Modals */}
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onSuccess={() => setShowBackupModal(false)}
      />
      {selectedWebsite && (
        <GoogleApiModal
          website={selectedWebsite}
          isOpen={showGoogleApiModal}
          onClose={() => setShowGoogleApiModal(false)}
          onSuccess={() => setShowGoogleApiModal(false)}
        />
      )}
    </div>
  );
}

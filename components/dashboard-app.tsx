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

  // Fetch updated dashboard data when website or period changes
  const handleSelectWebsite = async (id: string, periodId?: string) => {
    setSelectedWebsiteId(id);
    try {
      const url = periodId
        ? `/api/dashboard?websiteId=${id}&periodId=${periodId}`
        : `/api/dashboard?websiteId=${id}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
      }
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    }
  };

  // Auto-load websites and dashboard data on mount
  useEffect(() => {
    async function loadInitialData() {
      if (publicToken) {
        try {
          const res = await fetch(`/api/public/report/${publicToken}`);
          if (res.ok) {
            const json = await res.json();
            setDashboardData(json);
            if (json.website) {
              setWebsites([json.website]);
              setSelectedWebsiteId(json.website.id);
            }
          }
        } catch (err) {
          console.error("Gagal memuat laporan publik:", err);
        }
        return;
      }

      if (clientToken) {
        try {
          const res = await fetch(`/api/public/client/${clientToken}`);
          if (res.ok) {
            const json = await res.json();
            const clientSites = json.websites || [];
            setWebsites(clientSites);
            if (clientSites.length > 0) {
              const firstId = clientSites[0].id;
              setSelectedWebsiteId(firstId);
              const firstToken = clientSites[0].public_token;
              if (firstToken) {
                const repRes = await fetch(`/api/public/report/${firstToken}`);
                if (repRes.ok) setDashboardData(await repRes.json());
              }
            }
          }
        } catch (err) {
          console.error("Gagal memuat data client:", err);
        }
        return;
      }

      // Admin mode: fetch from /api/websites
      try {
        const res = await fetch("/api/websites");
        if (res.ok) {
          const json = await res.json();
          const siteList = json.websites || [];
          setWebsites(siteList);
          if (siteList.length > 0) {
            const targetId = selectedWebsiteId || siteList[0].id;
            setSelectedWebsiteId(targetId);
            const dashRes = await fetch(`/api/dashboard?websiteId=${targetId}`);
            if (dashRes.ok) {
              setDashboardData(await dashRes.json());
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat daftar website:", err);
      }
    }

    loadInitialData();
  }, [publicToken, clientToken]);

  const selectedWebsite = websites.find((w) => w.id === selectedWebsiteId) || websites[0];
  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeTab);

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
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{activeNavItem?.label || "Ringkasan"}</span>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                v{process.env.NEXT_PUBLIC_APP_VERSION || "0.1.2"}
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Ringkasan performa website Anda dari Google Search Console & Google Analytics
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Website Selector */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm hover:border-indigo-300 transition-colors">
              <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                value={selectedWebsiteId}
                onChange={(e) => handleSelectWebsite(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer pr-1 text-xs"
              >
                {websites.length > 0 ? (
                  websites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name ? `${w.name} (${w.domain})` : w.domain}
                    </option>
                  ))
                ) : (
                  <option value="">Memuat website...</option>
                )}
              </select>
            </div>

            {/* Date Range Picker / Period Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {dashboardData?.periods && dashboardData.periods.length > 0 ? (
                <select
                  value={dashboardData.selected?.id || ""}
                  onChange={(e) => {
                    if (selectedWebsiteId) {
                      handleSelectWebsite(selectedWebsiteId, e.target.value);
                    }
                  }}
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
                >
                  {dashboardData.periods.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.period_label || `${p.period_start} – ${p.period_end}`}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-bold text-slate-700">
                  {dashboardData?.selected?.period_label || "1 Mei – 31 Mei 2025"}
                </span>
              )}
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

            {/* Tarik Data Google API Button */}
            {selectedWebsite && (
              <button
                onClick={() => setShowGoogleApiModal(true)}
                title="Tarik data terbaru dari Google Search Console & Google Analytics API"
                className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tarik Data Google</span>
              </button>
            )}

            {/* Backup Button */}
            <button
              onClick={() => setShowBackupModal(true)}
              title="Backup data kredensial & konfigurasi database"
              className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Backup</span>
            </button>

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
          onSuccess={async () => {
            setShowGoogleApiModal(false);
            try {
              const res = await fetch("/api/websites");
              if (res.ok) {
                const json = await res.json();
                if (json.websites) setWebsites(json.websites);
              }
            } catch (e) {}
            if (selectedWebsiteId) {
              handleSelectWebsite(selectedWebsiteId);
            }
          }}
        />
      )}
    </div>
  );
}

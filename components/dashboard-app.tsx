"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SidebarNav, NavTabId, NAV_ITEMS } from "./sidebar-nav";
import { OverviewView } from "./views/OverviewView";
import { CoreWebVitalsView } from "./views/CoreWebVitalsView";
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
import { ExecutiveReportModal } from "./ExecutiveReportModal";
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
  FileText,
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
  const [showExecutiveReportModal, setShowExecutiveReportModal] = useState(false);
  const [isComparing, setIsComparing] = useState(true);
  const [comparePeriodId, setComparePeriodId] = useState<string>(
    initialData?.comparePeriod?.id || initialData?.previous?.id || ""
  );

  type QuickRange = "all" | "30d" | "14d" | "7d";
  const [quickRange, setQuickRange] = useState<QuickRange>("all");

  // Re-calculate active metrics and trends based on quick range filter
  const activeDashboardData = useMemo(() => {
    if (!dashboardData || quickRange === "all") return dashboardData;

    const days = quickRange === "7d" ? 7 : quickRange === "14d" ? 14 : 30;

    const origGsc = dashboardData.trends?.gscWeb || [];
    const origGa = dashboardData.trends?.ga || [];

    const slicedGsc = origGsc.slice(-days);
    const slicedGa = origGa.slice(-days);

    if (slicedGsc.length === 0 && slicedGa.length === 0) return dashboardData;

    const totalClicks = slicedGsc.reduce((acc: number, d: any) => acc + (Number(d.clicks) || 0), 0);
    const totalImpressions = slicedGsc.reduce((acc: number, d: any) => acc + (Number(d.impressions) || 0), 0);
    const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

    let avgPos = 0;
    if (slicedGsc.length > 0) {
      let weightSum = 0;
      let posSum = 0;
      for (const d of slicedGsc) {
        const imp = Number(d.impressions) || 0;
        const pos = Number(d.averagePosition || d.position) || 0;
        if (imp > 0 && pos > 0) {
          posSum += pos * imp;
          weightSum += imp;
        }
      }
      avgPos = weightSum > 0 ? posSum / weightSum : (slicedGsc.reduce((acc: number, d: any) => acc + (Number(d.averagePosition || d.position) || 0), 0) / slicedGsc.length);
    }

    const totalUsers = slicedGa.reduce((acc: number, d: any) => acc + (Number(d.activeUsers || d.users) || 0), 0);
    const totalSessions = slicedGa.reduce((acc: number, d: any) => acc + (Number(d.sessions) || 0), 0);
    const totalNewUsers = slicedGa.reduce((acc: number, d: any) => acc + (Number(d.newUsers) || 0), 0);

    return {
      ...dashboardData,
      metrics: {
        ...dashboardData.metrics,
        "gsc.clicks": totalClicks || dashboardData.metrics?.["gsc.clicks"],
        "gsc.impressions": totalImpressions || dashboardData.metrics?.["gsc.impressions"],
        "gsc.ctr": totalImpressions > 0 ? ctr : dashboardData.metrics?.["gsc.ctr"],
        "gsc.average_position": avgPos || dashboardData.metrics?.["gsc.average_position"],
        "ga.users": totalUsers || dashboardData.metrics?.["ga.users"],
        "ga.sessions": totalSessions || dashboardData.metrics?.["ga.sessions"],
        "ga.new_users": totalNewUsers || dashboardData.metrics?.["ga.new_users"],
      },
      trends: {
        ...dashboardData.trends,
        gscWeb: slicedGsc,
        ga: slicedGa,
      },
    };
  }, [dashboardData, quickRange]);

  // Fetch updated dashboard data when website or period changes
  const handleSelectWebsite = async (
    id: string,
    periodId?: string,
    cmpId?: string,
    cmpActive?: boolean
  ) => {
    setSelectedWebsiteId(id);
    try {
      const activeCmp = cmpActive !== undefined ? cmpActive : isComparing;
      const targetCmpId = cmpId !== undefined ? cmpId : comparePeriodId;
      let url = `/api/dashboard?websiteId=${id}`;
      if (periodId) url += `&periodId=${periodId}`;
      if (activeCmp && targetCmpId) url += `&comparePeriodId=${targetCmpId}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
        if (json.comparePeriod?.id) {
          setComparePeriodId(json.comparePeriod.id);
        }
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
        issuesCount={(dashboardData?.anomalies?.length || 0) + (dashboardData?.dataQuality?.filter((q: any) => q.status !== 'ok').length || 0)}
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

            {/* Quick Range Presets (Bulan Penuh, 30 Hari, 14 Hari, 7 Hari) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {(
                [
                  { id: "all", label: "Bulan Penuh" },
                  { id: "30d", label: "30 Hari" },
                  { id: "14d", label: "14 Hari" },
                  { id: "7d", label: "7 Hari" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setQuickRange(preset.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    quickRange === preset.id
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Compare Toggle & Comparison Period Selector */}
            <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-600">Bandingkan</span>
              <button
                onClick={() => {
                  const nextCmp = !isComparing;
                  setIsComparing(nextCmp);
                  if (selectedWebsiteId) {
                    handleSelectWebsite(selectedWebsiteId, dashboardData?.selected?.id, comparePeriodId, nextCmp);
                  }
                }}
                title={isComparing ? "Nonaktifkan perbandingan" : "Aktifkan perbandingan antar periode"}
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

              {isComparing && dashboardData?.periods && dashboardData.periods.length > 1 && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                  <span className="text-[11px] font-bold text-slate-500">vs</span>
                  <select
                    value={dashboardData?.comparePeriod?.id || comparePeriodId}
                    onChange={(e) => {
                      const nextCmpId = e.target.value;
                      setComparePeriodId(nextCmpId);
                      if (selectedWebsiteId) {
                        handleSelectWebsite(selectedWebsiteId, dashboardData?.selected?.id, nextCmpId, true);
                      }
                    }}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 font-bold text-indigo-700 outline-none cursor-pointer text-xs shadow-xs"
                  >
                    {dashboardData.periods
                      .filter((p: any) => p.id !== dashboardData.selected?.id)
                      .map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.period_label || `${p.period_start} – ${p.period_end}`}
                        </option>
                      ))}
                  </select>
                </div>
              )}
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

            {/* Executive PDF Report Button */}
            <button
              onClick={() => setShowExecutiveReportModal(true)}
              title="Buka dan cetak Dokumen Laporan Resmi Eksekutif A4 untuk Pimpinan / Klien"
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-600/25 hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan Eksekutif</span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => setActiveTab("laporan")}
              className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Canvas */}
        <div className="p-8 max-w-[1440px] w-full mx-auto space-y-6 flex-1">
          {activeTab === "ringkasan" && (
            <OverviewView data={activeDashboardData} isComparing={isComparing} onSelectTab={(t) => setActiveTab(t)} />
          )}
          {activeTab === "core_web_vitals" && (
            <CoreWebVitalsView data={activeDashboardData} />
          )}
          {activeTab === "search_performance" && (
            <SearchPerformanceView data={activeDashboardData} isComparing={isComparing} />
          )}
          {activeTab === "analytics_performance" && (
            <AnalyticsPerformanceView data={activeDashboardData} isComparing={isComparing} />
          )}
          {activeTab === "pages" && <PagesView data={activeDashboardData} isComparing={isComparing} />}
          {activeTab === "queries" && <QueriesView data={activeDashboardData} isComparing={isComparing} />}
          {activeTab === "devices" && <DevicesView data={activeDashboardData} isComparing={isComparing} />}
          {activeTab === "countries" && <CountriesView data={activeDashboardData} isComparing={isComparing} />}
          {activeTab === "traffic_channels" && <TrafficChannelsView data={activeDashboardData} isComparing={isComparing} />}
          {activeTab === "events_conversions" && (
            <EventsConversionsView data={activeDashboardData} isComparing={isComparing} />
          )}
          {activeTab === "ai_insight" && <AiInsightView data={activeDashboardData} isComparing={isComparing} />}
          {activeTab === "rekomendasi" && <RecommendationsView data={activeDashboardData} isComparing={isComparing} />}
          {activeTab === "notifikasi_isu" && (
            <NotificationsIssuesView data={activeDashboardData} isComparing={isComparing} />
          )}
          {activeTab === "laporan" && <ReportsView data={activeDashboardData} isComparing={isComparing} />}
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

      {/* Executive Report Modal */}
      {showExecutiveReportModal && (
        <ExecutiveReportModal
          data={activeDashboardData}
          isComparing={isComparing}
          onClose={() => setShowExecutiveReportModal(false)}
        />
      )}
    </div>
  );
}

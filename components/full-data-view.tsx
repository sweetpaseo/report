"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "./data-table";
import {
  ExternalLink,
  CircleAlert,
  Search,
  X,
  SearchCheck,
  BarChart3,
  TrendingUp,
  Globe,
  Smartphone,
  Sparkles,
  MapPin,
  Share2,
  Monitor,
  Compass,
} from "lucide-react";

type QueryRow = { query: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type GscPageRow = { page: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type PageRow = { title: string; views: number };
type DimensionRow = { name: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type EventRow = { name: string; count: number; keyCount: number };
type ChannelRow = { channel: string; sessions: number; newUsers: number };
type CityRow = { city: string; activeUsers: number };
type DeviceModelRow = { model: string; activeUsers: number };
type RegionRow = { region: string; activeUsers: number };
type SourceMediumRow = { sourceMedium: string; sessions: number; activeUsers: number };
type OsRow = { os: string; activeUsers: number };
type BrowserRow = { browser: string; activeUsers: number };
type GaCountryRow = { country: string; activeUsers: number };
type GscDailyRow = { date: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type GaDailyRow = { date: string; activeUsers: number; newUsers: number; engagementSeconds: number; revenue: number };

type FullData = {
  website: { name?: string; domain?: string };
  periods: Array<{ id: string; period_label: string }>;
  selected?: { id: string; period_label: string };
  isPartialMonth?: boolean;
  empty?: boolean;
  queries?: QueryRow[];
  gscPages?: GscPageRow[];
  pages?: PageRow[];
  devices?: DimensionRow[];
  countries?: DimensionRow[];
  appearances?: DimensionRow[];
  events?: EventRow[];
  channels?: ChannelRow[];
  cities?: CityRow[];
  deviceModels?: DeviceModelRow[];
  regions?: RegionRow[];
  sourceMedium?: SourceMediumRow[];
  operatingSystems?: OsRow[];
  browsers?: BrowserRow[];
  gaCountries?: GaCountryRow[];
  gscDaily?: GscDailyRow[];
  gaDaily?: GaDailyRow[];
};

export function FullDataView({ token }: { token: string }) {
  const [role, setRole] = useState<"admin" | "client" | "">("");
  const isAdmin = role === "admin";
  const [data, setData] = useState<FullData | null>(null);
  const [periodId, setPeriodId] = useState("");
  const [loading, setLoading] = useState(true);

  // Controls
  const [activeTab, setActiveTab] = useState<"gsc" | "ga">("gsc");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState<number>(300);
  const [searchType, setSearchType] = useState<"web" | "aigen">("web");

  async function load(targetPeriod = periodId, targetLimit = limit, targetSearchType = searchType): Promise<void> {
    setLoading(true);
    const params = new URLSearchParams();
    if (targetPeriod) params.set("periodId", targetPeriod);
    if (targetLimit) params.set("limit", String(targetLimit));
    if (targetSearchType) params.set("searchType", targetSearchType);

    const response = await fetch(`/api/public/report-data/${token}?${params.toString()}`, { cache: "no-store" });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return;
    setData(result);
    if (result.selected?.id && result.selected.id !== periodId) setPeriodId(result.selected.id);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setRole(d?.role || "client");
      })
      .catch(() => setRole("client"));
  }, []);

  if (loading && !data) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Menyiapkan data terstruktur…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="full-data">
        <p>Laporan tidak ditemukan.</p>
      </div>
    );
  }

  // Filter helper
  const filterRows = <T,>(rows: T[] = [], keys: (keyof T)[]): T[] => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((r) =>
      keys.some((k) => {
        const val = r[k];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
      })
    );
  };

  const COLS = {
    gscDaily: [
      { key: "date", label: "Tanggal", value: (r: GscDailyRow) => r.date },
      { key: "impr", label: "Tayangan", value: (r: GscDailyRow) => r.impressions.toLocaleString(), align: "right" as const },
      { key: "clicks", label: "Klik", value: (r: GscDailyRow) => r.clicks.toLocaleString(), align: "right" as const },
      { key: "ctr", label: "CTR", value: (r: GscDailyRow) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: GscDailyRow) => String((r.ctr * 100).toFixed(2)) },
      { key: "pos", label: "Posisi", value: (r: GscDailyRow) => r.averagePosition.toFixed(1), align: "right" as const },
    ] as Column<GscDailyRow>[],

    queries: [
      { key: "query", label: "Kata kunci", value: (r: QueryRow) => r.query },
      { key: "impr", label: "Tayangan", value: (r: QueryRow) => r.impressions.toLocaleString(), align: "right" as const },
      { key: "clicks", label: "Klik", value: (r: QueryRow) => r.clicks.toLocaleString(), align: "right" as const },
      { key: "ctr", label: "CTR", value: (r: QueryRow) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: QueryRow) => String((r.ctr * 100).toFixed(2)) },
      { key: "pos", label: "Posisi", value: (r: QueryRow) => r.averagePosition.toFixed(1), align: "right" as const },
    ] as Column<QueryRow>[],

    gscPages: [
      { key: "page", label: "Halaman Landing", value: (r: GscPageRow) => r.page },
      { key: "impr", label: "Tayangan", value: (r: GscPageRow) => r.impressions.toLocaleString(), align: "right" as const },
      { key: "clicks", label: "Klik", value: (r: GscPageRow) => r.clicks.toLocaleString(), align: "right" as const },
      { key: "ctr", label: "CTR", value: (r: GscPageRow) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: GscPageRow) => String((r.ctr * 100).toFixed(2)) },
      { key: "pos", label: "Posisi", value: (r: GscPageRow) => r.averagePosition.toFixed(1), align: "right" as const },
    ] as Column<GscPageRow>[],

    devices: [
      { key: "name", label: "Perangkat", value: (r: DimensionRow) => r.name },
      { key: "impr", label: "Tayangan", value: (r: DimensionRow) => r.impressions.toLocaleString(), align: "right" as const },
      { key: "clicks", label: "Klik", value: (r: DimensionRow) => r.clicks.toLocaleString(), align: "right" as const },
      { key: "ctr", label: "CTR", value: (r: DimensionRow) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: DimensionRow) => String((r.ctr * 100).toFixed(2)) },
      { key: "pos", label: "Posisi", value: (r: DimensionRow) => r.averagePosition.toFixed(1), align: "right" as const },
    ] as Column<DimensionRow>[],

    countries: [
      { key: "name", label: "Negara", value: (r: DimensionRow) => r.name },
      { key: "impr", label: "Tayangan", value: (r: DimensionRow) => r.impressions.toLocaleString(), align: "right" as const },
      { key: "clicks", label: "Klik", value: (r: DimensionRow) => r.clicks.toLocaleString(), align: "right" as const },
    ] as Column<DimensionRow>[],

    appearances: [
      { key: "name", label: "Tampilan Penelusuran", value: (r: DimensionRow) => r.name },
      { key: "impr", label: "Tayangan", value: (r: DimensionRow) => r.impressions.toLocaleString(), align: "right" as const },
      { key: "clicks", label: "Klik", value: (r: DimensionRow) => r.clicks.toLocaleString(), align: "right" as const },
    ] as Column<DimensionRow>[],

    gaDaily: [
      { key: "date", label: "Tanggal", value: (r: GaDailyRow) => r.date },
      { key: "users", label: "Active Users", value: (r: GaDailyRow) => r.activeUsers.toLocaleString(), align: "right" as const },
      { key: "newUsers", label: "Pengunjung Baru", value: (r: GaDailyRow) => r.newUsers.toLocaleString(), align: "right" as const },
      { key: "engagement", label: "Durasi Interaksi (d)", value: (r: GaDailyRow) => Math.round(r.engagementSeconds).toLocaleString(), align: "right" as const },
      { key: "revenue", label: "Pendapatan", value: (r: GaDailyRow) => r.revenue ? `Rp ${r.revenue.toLocaleString()}` : "-", align: "right" as const },
    ] as Column<GaDailyRow>[],

    channels: [
      { key: "channel", label: "Saluran Trafik (Channel)", value: (r: ChannelRow) => r.channel },
      { key: "sessions", label: "Sesi (Sessions)", value: (r: ChannelRow) => r.sessions.toLocaleString(), align: "right" as const },
      { key: "newUsers", label: "Pengunjung Baru", value: (r: ChannelRow) => r.newUsers.toLocaleString(), align: "right" as const },
    ] as Column<ChannelRow>[],

    sourceMedium: [
      { key: "sm", label: "Sumber / Medium (Source / Medium)", value: (r: SourceMediumRow) => r.sourceMedium },
      { key: "sessions", label: "Sesi", value: (r: SourceMediumRow) => r.sessions.toLocaleString(), align: "right" as const },
      { key: "users", label: "Pengguna Aktif", value: (r: SourceMediumRow) => r.activeUsers.toLocaleString(), align: "right" as const },
    ] as Column<SourceMediumRow>[],

    pages: [
      { key: "title", label: "Judul / Path Halaman", value: (r: PageRow) => r.title },
      { key: "views", label: "Tayangan Halaman (Views)", value: (r: PageRow) => r.views.toLocaleString(), align: "right" as const },
    ] as Column<PageRow>[],

    events: [
      { key: "name", label: "Nama Interaksi (Event)", value: (r: EventRow) => r.name },
      { key: "count", label: "Jumlah Event", value: (r: EventRow) => r.count.toLocaleString(), align: "right" as const },
      { key: "key", label: "Key Event (Konversi)", value: (r: EventRow) => r.keyCount.toLocaleString(), align: "right" as const },
    ] as Column<EventRow>[],

    regions: [
      { key: "region", label: "Daerah / Provinsi", value: (r: RegionRow) => r.region },
      { key: "users", label: "Pengguna Aktif", value: (r: RegionRow) => r.activeUsers.toLocaleString(), align: "right" as const },
    ] as Column<RegionRow>[],

    cities: [
      { key: "city", label: "Kota Pengunjung", value: (r: CityRow) => r.city },
      { key: "users", label: "Pengguna Aktif", value: (r: CityRow) => r.activeUsers.toLocaleString(), align: "right" as const },
    ] as Column<CityRow>[],

    gaCountries: [
      { key: "country", label: "Negara Pengunjung (GA4)", value: (r: GaCountryRow) => r.country },
      { key: "users", label: "Pengguna Aktif", value: (r: GaCountryRow) => r.activeUsers.toLocaleString(), align: "right" as const },
    ] as Column<GaCountryRow>[],

    deviceModels: [
      { key: "model", label: "Model Perangkat Gawai", value: (r: DeviceModelRow) => r.model },
      { key: "users", label: "Pengguna Aktif", value: (r: DeviceModelRow) => r.activeUsers.toLocaleString(), align: "right" as const },
    ] as Column<DeviceModelRow>[],

    operatingSystems: [
      { key: "os", label: "Sistem Operasi (OS)", value: (r: OsRow) => r.os },
      { key: "users", label: "Pengguna Aktif", value: (r: OsRow) => r.activeUsers.toLocaleString(), align: "right" as const },
    ] as Column<OsRow>[],

    browsers: [
      { key: "browser", label: "Peramban (Browser)", value: (r: BrowserRow) => r.browser },
      { key: "users", label: "Pengguna Aktif", value: (r: BrowserRow) => r.activeUsers.toLocaleString(), align: "right" as const },
    ] as Column<BrowserRow>[],
  };

  const domain = data.website?.domain ?? "laporan";
  const filenameBase = `${domain}-data-lengkap`;

  // Filtered rows
  const filteredQueries = filterRows(data.queries, ["query"]);
  const filteredGscPages = filterRows(data.gscPages, ["page"]);
  const filteredDevices = filterRows(data.devices, ["name"]);
  const filteredCountries = filterRows(data.countries, ["name"]);
  const filteredAppearances = filterRows(data.appearances, ["name"]);
  const filteredGscDaily = filterRows(data.gscDaily, ["date"]);

  const filteredChannels = filterRows(data.channels, ["channel"]);
  const filteredSourceMedium = filterRows(data.sourceMedium, ["sourceMedium"]);
  const filteredGaPages = filterRows(data.pages, ["title"]);
  const filteredEvents = filterRows(data.events, ["name"]);
  const filteredRegions = filterRows(data.regions, ["region"]);
  const filteredCities = filterRows(data.cities, ["city"]);
  const filteredGaCountries = filterRows(data.gaCountries, ["country"]);
  const filteredDeviceModels = filterRows(data.deviceModels, ["model"]);
  const filteredOS = filterRows(data.operatingSystems, ["os"]);
  const filteredBrowsers = filterRows(data.browsers, ["browser"]);
  const filteredGaDaily = filterRows(data.gaDaily, ["date"]);

  return (
    <div className="full-data">
      <header className="full-data-head">
        <div>
          <p className="eyebrow">DATA LENGKAP TERSTRUKTUR</p>
          <h1>
            {data.website?.name ?? "Laporan"} · {domain}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {isAdmin && (
            <a className="button secondary" href="/dashboard">
              Kembali ke Dashboard
            </a>
          )}
          <a className="button secondary" href={`/report/${token}`}>
            <ExternalLink size={16} /> Lihat laporan
          </a>
        </div>
      </header>

      {/* Global Period & Control Toolbar */}
      <div className="full-data-toolbar">
        {data.periods?.length > 0 && (
          <div className="toolbar-item">
            <label>Periode</label>
            <select
              value={periodId}
              onChange={(e) => {
                const val = e.target.value;
                setPeriodId(val);
                load(val, limit, searchType);
              }}
            >
              {data.periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.period_label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="toolbar-item">
          <label>Tipe Pencarian GSC</label>
          <select
            value={searchType}
            onChange={(e) => {
              const val = e.target.value as "web" | "aigen";
              setSearchType(val);
              load(periodId, limit, val);
            }}
          >
            <option value="web">Web Standard</option>
            <option value="aigen">AI Generative</option>
          </select>
        </div>

        <div className="toolbar-item">
          <label>Batas Tampilan Baris</label>
          <select
            value={limit}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setLimit(val);
              load(periodId, val, searchType);
            }}
          >
            <option value={100}>Top 100 Baris</option>
            <option value={300}>Top 300 Baris</option>
            <option value={1000}>Top 1000 Baris</option>
          </select>
        </div>

        <div className="toolbar-item search-box">
          <label>Pencarian Teks Cepat</label>
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Cari kata kunci, halaman, provinsi, kota, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {data.isPartialMonth && (
        <p className="partial-note">
          <CircleAlert size={14} /> Periode ini masih berjalan, angka metrik belum final.
        </p>
      )}

      {/* Main Tab Navigation Header */}
      <div className="data-tabs-nav">
        <button
          className={`data-tab-btn ${activeTab === "gsc" ? "active" : ""}`}
          onClick={() => setActiveTab("gsc")}
        >
          <SearchCheck size={18} />
          <span>Google Search Console (SEO Organik)</span>
          <span className="tab-badge">
            {(data.queries?.length || 0) + (data.gscPages?.length || 0)} data
          </span>
        </button>

        <button
          className={`data-tab-btn ${activeTab === "ga" ? "active" : ""}`}
          onClick={() => setActiveTab("ga")}
        >
          <BarChart3 size={18} />
          <span>Google Analytics 4 (Trafik & Perilaku)</span>
          <span className="tab-badge">
            {(data.channels?.length || 0) + (data.pages?.length || 0) + (data.regions?.length || 0)} data
          </span>
        </button>
      </div>

      {data.empty ? (
        <p className="empty-note">Belum ada data untuk periode ini.</p>
      ) : activeTab === "gsc" ? (
        /* TAB 1: GOOGLE SEARCH CONSOLE */
        <div className="tab-content">
          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <TrendingUp size={18} /> Tren Harian Pencarian Organik
              </h2>
              <span className="section-meta">{filteredGscDaily.length} hari terekam</span>
            </div>
            <DataTable
              columns={COLS.gscDaily}
              rows={filteredGscDaily}
              filename={`${filenameBase}-gsc-daily-trend.csv`}
            />
          </section>

          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <Search size={18} /> Kata Kunci Pencarian (Google Queries)
              </h2>
              <span className="section-meta">
                {filteredQueries.length} dari {data.queries?.length || 0} kata kunci
              </span>
            </div>
            <DataTable
              columns={COLS.queries}
              rows={filteredQueries}
              filename={`${filenameBase}-kata-kunci.csv`}
            />
          </section>

          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <Globe size={18} /> Halaman Landing Pencarian Organik
              </h2>
              <span className="section-meta">
                {filteredGscPages.length} dari {data.gscPages?.length || 0} halaman
              </span>
            </div>
            <DataTable
              columns={COLS.gscPages}
              rows={filteredGscPages}
              filename={`${filenameBase}-halaman-pencarian.csv`}
            />
          </section>

          <div className="grid-2-col">
            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <Smartphone size={18} /> Perangkat Pencari
                </h2>
              </div>
              <DataTable
                columns={COLS.devices}
                rows={filteredDevices}
                filename={`${filenameBase}-perangkat.csv`}
              />
            </section>

            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <Globe size={18} /> Negara Asal Pencari
                </h2>
              </div>
              <DataTable
                columns={COLS.countries}
                rows={filteredCountries}
                filename={`${filenameBase}-negara.csv`}
              />
            </section>
          </div>

          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <Sparkles size={18} /> Tampilan Penelusuran (Search Appearance / Rich Results)
              </h2>
            </div>
            <DataTable
              columns={COLS.appearances}
              rows={filteredAppearances}
              filename={`${filenameBase}-tampilan.csv`}
            />
          </section>
        </div>
      ) : (
        /* TAB 2: GOOGLE ANALYTICS 4 */
        <div className="tab-content">
          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <TrendingUp size={18} /> Tren Harian Pengunjung GA4
              </h2>
              <span className="section-meta">{filteredGaDaily.length} hari terekam</span>
            </div>
            <DataTable
              columns={COLS.gaDaily}
              rows={filteredGaDaily}
              filename={`${filenameBase}-ga-daily-trend.csv`}
            />
          </section>

          <div className="grid-2-col">
            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <BarChart3 size={18} /> Saluran Sumber Trafik (Channel Groups)
                </h2>
                <span className="section-meta">{filteredChannels.length} saluran</span>
              </div>
              <DataTable
                columns={COLS.channels}
                rows={filteredChannels}
                filename={`${filenameBase}-channel.csv`}
              />
            </section>

            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <Share2 size={18} /> Detail Sumber / Medium (Source / Medium)
                </h2>
                <span className="section-meta">{filteredSourceMedium.length} kombinasi</span>
              </div>
              <DataTable
                columns={COLS.sourceMedium}
                rows={filteredSourceMedium}
                filename={`${filenameBase}-source-medium.csv`}
              />
            </section>
          </div>

          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <Globe size={18} /> Halaman Terpopuler (Page Views)
              </h2>
              <span className="section-meta">
                {filteredGaPages.length} dari {data.pages?.length || 0} halaman
              </span>
            </div>
            <DataTable
              columns={COLS.pages}
              rows={filteredGaPages}
              filename={`${filenameBase}-halaman-terpopuler.csv`}
            />
          </section>

          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <Sparkles size={18} /> Event Interaksi & Key Events (Konversi)
              </h2>
              <span className="section-meta">
                {filteredEvents.length} event terdeteksi
              </span>
            </div>
            <DataTable
              columns={COLS.events}
              rows={filteredEvents}
              filename={`${filenameBase}-event.csv`}
            />
          </section>

          {/* Demographics Grid (Regions, Cities, Countries) */}
          <div className="grid-2-col">
            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <MapPin size={18} /> Daerah / Provinsi Pengunjung (Regions)
                </h2>
                <span className="section-meta">{filteredRegions.length} provinsi/daerah</span>
              </div>
              <DataTable
                columns={COLS.regions}
                rows={filteredRegions}
                filename={`${filenameBase}-provinsi-daerah.csv`}
              />
            </section>

            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <MapPin size={18} /> Kota Pengunjung (Cities)
                </h2>
                <span className="section-meta">{filteredCities.length} kota</span>
              </div>
              <DataTable
                columns={COLS.cities}
                rows={filteredCities}
                filename={`${filenameBase}-kota.csv`}
              />
            </section>
          </div>

          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <Globe size={18} /> Negara Pengunjung (GA4 Countries)
              </h2>
              <span className="section-meta">{filteredGaCountries.length} negara</span>
            </div>
            <DataTable
              columns={COLS.gaCountries}
              rows={filteredGaCountries}
              filename={`${filenameBase}-ga-negara.csv`}
            />
          </section>

          {/* Tech Grid (Device Models, Operating Systems, Browsers) */}
          <div className="grid-2-col">
            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <Smartphone size={18} /> Model Perangkat Gawai
                </h2>
                <span className="section-meta">{filteredDeviceModels.length} model</span>
              </div>
              <DataTable
                columns={COLS.deviceModels}
                rows={filteredDeviceModels}
                filename={`${filenameBase}-model-perangkat.csv`}
              />
            </section>

            <section className="full-data-section">
              <div className="section-head">
                <h2>
                  <Monitor size={18} /> Sistem Operasi (Operating System)
                </h2>
                <span className="section-meta">{filteredOS.length} OS</span>
              </div>
              <DataTable
                columns={COLS.operatingSystems}
                rows={filteredOS}
                filename={`${filenameBase}-sistem-operasi.csv`}
              />
            </section>
          </div>

          <section className="full-data-section">
            <div className="section-head">
              <h2>
                <Compass size={18} /> Peramban / Browser Pengunjung
              </h2>
              <span className="section-meta">{filteredBrowsers.length} browser</span>
            </div>
            <DataTable
              columns={COLS.browsers}
              rows={filteredBrowsers}
              filename={`${filenameBase}-browser.csv`}
            />
          </section>
        </div>
      )}
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, BarChart3, Check, ChevronDown, CircleAlert, Database, Download, ExternalLink,
  FileSpreadsheet, Gauge, Globe2, Home, LogOut, Menu, MousePointerClick, Plus, Search,
  Share2, Target, Trash2, TrendingDown, TrendingUp, Upload, Users, X,
} from "lucide-react";
import { Sparkline } from "./sparkline";
import { MonthlyTrend } from "./monthly-trend";
import { Modal } from "./modal";
import { DataModal } from "./data-modal";
import type { Column } from "./data-table";

type Website = { id: string; name: string; domain: string; public_token: string; period_count: number };
type Comparison = { current: number; previous: number; absolute: number; percent: number | null };
type DashboardData = any;

const fmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const dec = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

function percent(value: number | null | undefined, fraction = false) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${dec.format(fraction ? value * 100 : value)}%`;
}

function ChangeBadge({ comparison, inverse = false }: { comparison?: Comparison; inverse?: boolean }) {
  if (!comparison || comparison.percent === null) return <span className="change neutral">Belum ada pembanding</span>;
  const improved = inverse ? comparison.absolute < 0 : comparison.absolute > 0;
  const Icon = comparison.absolute >= 0 ? TrendingUp : TrendingDown;
  return <span className={`change ${improved ? "positive" : comparison.absolute === 0 ? "neutral" : "negative"}`}><Icon size={14} />{percent(Math.abs(comparison.percent))}</span>;
}

function Metric({ label, value, comparison, values, suffix, inverse }: { label: string; value: string; comparison?: Comparison; values: number[]; suffix?: string; inverse?: boolean }) {
  return <div className="metric-block"><div><span>{label}</span><strong>{value}{suffix}</strong><ChangeBadge comparison={comparison} inverse={inverse} /></div><Sparkline values={values} /></div>;
}



const FULL_COLUMNS: Record<string, Column<any>[]> = {
  queries: [
    { key: "query", label: "Kata kunci", value: (r: any) => r.query },
    { key: "impressions", label: "Tayangan", value: (r: any) => r.impressions, align: "right" },
    { key: "clicks", label: "Klik", value: (r: any) => r.clicks, align: "right" },
    { key: "ctr", label: "CTR", value: (r: any) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: any) => String((r.ctr * 100).toFixed(2)) },
    { key: "position", label: "Posisi", value: (r: any) => r.averagePosition.toFixed(1), align: "right" },
  ],
  gscPages: [
    { key: "page", label: "Halaman", value: (r: any) => shortPage(r.page) },
    { key: "impressions", label: "Tayangan", value: (r: any) => r.impressions, align: "right" },
    { key: "clicks", label: "Klik", value: (r: any) => r.clicks, align: "right" },
    { key: "ctr", label: "CTR", value: (r: any) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: any) => String((r.ctr * 100).toFixed(2)) },
    { key: "position", label: "Posisi", value: (r: any) => r.averagePosition.toFixed(1), align: "right" },
  ],
  pages: [
    { key: "title", label: "Halaman", value: (r: any) => shortTitle(r.title) },
    { key: "views", label: "Views", value: (r: any) => r.views, align: "right" },
  ],
  cities: [
    { key: "city", label: "Kota", value: (r: any) => r.city },
    { key: "activeUsers", label: "Pengguna aktif", value: (r: any) => r.activeUsers, align: "right" },
  ],
  deviceModels: [
    { key: "model", label: "Model perangkat", value: (r: any) => r.model },
    { key: "activeUsers", label: "Pengguna aktif", value: (r: any) => r.activeUsers, align: "right" },
  ],
};

export function DashboardApp({ publicToken, clientToken }: { publicToken?: string, clientToken?: string }) {
  const isPublic = Boolean(publicToken) || Boolean(clientToken);
  const isClientMode = Boolean(clientToken);
  const [websites, setWebsites] = useState<any[]>([]);
  const [websiteId, setWebsiteId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [searchType, setSearchType] = useState<"web" | "aigen">("web");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [websiteModal, setWebsiteModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [role, setRole] = useState<"admin" | "client" | "">("");
  const isAdmin = role === "admin";
  const [clients, setClients] = useState<any[]>([]);
  const [clientModal, setClientModal] = useState(false);
  const [fullModal, setFullModal] = useState<{ open: boolean; title: string; columns: Column<any>[]; rows: any[]; filename: string } | null>(null);

  async function loadWebsites() {
    const endpoint = isClientMode ? `/api/public/client/${clientToken}` : "/api/websites";
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) { setLoading(false); return; }
    const result = await response.json();
    setWebsites(result.websites);
    const firstId = result.websites[0]?.id || "";
    setWebsiteId((current) => current || firstId);
    if (!firstId) setLoading(false);
  }

  async function loadDashboard(targetWebsite = websiteId, targetPeriod = periodId, currentWebsites = websites, targetSearchType = searchType) {
    if ((!isPublic || isClientMode) && !targetWebsite) { setLoading(false); setData(null); return; }
    setLoading(true);
    let endpoint = "";
    if (isClientMode) {
      const wToken = currentWebsites.find((w: any) => w.id === targetWebsite)?.public_token;
      if (!wToken) { setLoading(false); return; }
      endpoint = `/api/public/report-data/${wToken}${targetPeriod ? `?periodId=${targetPeriod}&` : "?"}searchType=${targetSearchType}`;
    } else if (isPublic) {
      endpoint = `/api/public/report-data/${publicToken}${targetPeriod ? `?periodId=${targetPeriod}&` : "?"}searchType=${targetSearchType}`;
    } else {
      endpoint = `/api/dashboard?websiteId=${targetWebsite}${targetPeriod ? `&periodId=${targetPeriod}` : ""}&searchType=${targetSearchType}`;
    }
    const response = await fetch(endpoint, { cache: "no-store" });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(result.error || "Dashboard gagal dimuat."); return; }
    setData(result);
    if (result.selected?.id && result.selected.id !== periodId) setPeriodId(result.selected.id);
  }

  useEffect(() => { if (isPublic && !isClientMode) loadDashboard(); else loadWebsites(); }, []);
  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((d) => {
      setRole(d?.role || "client");
      if (d?.role === "admin") {
        fetch("/api/clients").then(r => r.ok ? r.json() : null).then(res => { if (res?.clients) setClients(res.clients); });
      }
    }).catch(() => setRole("client"));
  }, []);
  useEffect(() => { if ((!isPublic || isClientMode) && websiteId) { setPeriodId(""); loadDashboard(websiteId, "", websites, searchType); } }, [websiteId, websites]);
  useEffect(() => { if (isPublic && !isClientMode && periodId) loadDashboard("", periodId, websites, searchType); }, [periodId]);
  useEffect(() => { if (websiteId || (isPublic && !isClientMode)) loadDashboard(websiteId, periodId, websites, searchType); }, [searchType]);

  const gscValues = useMemo(() => (data?.trends?.gsc || []).map((row: any) => Number(row.impressions || 0)), [data]);
  const clickValues = useMemo(() => (data?.trends?.gsc || []).map((row: any) => Number(row.clicks || 0)), [data]);
  const gaValues = useMemo(() => (data?.trends?.ga || []).map((row: any) => Number(row.activeUsers || 0)), [data]);
  const engagementValues = useMemo(() => (data?.trends?.ga || []).map((row: any) => Number(row.engagementSeconds || 0)), [data]);
  const hasGsc = searchType === "aigen" ? (data?.metrics?.["gsc-aigen.impressions"] || 0) > 0 : (data?.metrics?.["gsc.impressions"] || 0) > 0;
  const hasGa = (data?.metrics?.["ga.sessions"] || 0) > 0;

  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }
  function shareReport() {
    const token = data?.website?.public_token;
    if (!token) return;
    const url = `${location.origin}/report/${token}`;
    navigator.clipboard.writeText(url);
    setMessage("Link laporan client sudah disalin.");
  }

  async function deletePeriod() {
    if (!periodId || !confirm("Apakah Anda yakin ingin menghapus seluruh data untuk periode ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch(`/api/periods/${periodId}`, { method: "DELETE", headers: { "x-requested-with": "XMLHttpRequest" } });
      if (res.ok) {
        setMessage("Data periode berhasil dihapus.");
        setPeriodId("");
        loadDashboard(websiteId, "", websites);
      } else {
        setMessage("Gagal menghapus data periode.");
      }
    } catch (e) {
      setMessage("Terjadi kesalahan.");
    }
  }

  async function openFull(kind: "queries" | "gscPages" | "pages" | "cities" | "deviceModels", title: string): Promise<void> {
    if (!data?.website?.public_token) return;
    const endpoint = isPublic
      ? `/api/public/report-data/${data.website.public_token}${periodId ? `?periodId=${periodId}&` : "?"}searchType=${searchType}`
      : `/api/report-data?websiteId=${websiteId}${periodId ? `&periodId=${periodId}` : ""}&searchType=${searchType}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return;
    const full = await response.json();
    const map: Record<string, { rows: any[]; columns: Column<any>[] }> = {
      queries: { rows: full.queries || [], columns: FULL_COLUMNS.queries },
      gscPages: { rows: full.gscPages || [], columns: FULL_COLUMNS.gscPages },
      pages: { rows: full.pages || [], columns: FULL_COLUMNS.pages },
      cities: { rows: full.cities || [], columns: FULL_COLUMNS.cities },
      deviceModels: { rows: full.deviceModels || [], columns: FULL_COLUMNS.deviceModels },
    };
    const entry = map[kind];
    const domain = data.website.domain || "laporan";
    setFullModal({ open: true, title, columns: entry.columns, rows: entry.rows, filename: `${domain}-${kind}.csv` });
  }

  if (loading && !data) return <div className="loading-screen"><div className="loader"/><p>Menyiapkan laporan…</p></div>;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <button className="sidebar-close" onClick={() => setMobileMenu(false)} aria-label="Tutup menu"><X /></button>
        <div className="brand"><div className="brand-mark small"><BarChart3 /></div><span>Website<br/>Health Report</span></div>
        <nav onClick={() => setMobileMenu(false)}>
          <a className="active"><Home /> Ringkasan</a>

          {hasGsc && <a href="#search"><Search /> Kinerja di Google</a>}
          {hasGa && <a href="#traffic"><Users /> Traffic & Pengunjung</a>}
          {hasGa && <a href="#engagement"><Activity /> Perilaku Pengunjung</a>}
          {hasGa && <a href="#conversion"><Target /> Tindakan & Konversi</a>}
          <a href="#opportunities"><Gauge /> Peluang & Rekomendasi</a>
          {hasGsc && <a href="#geography"><Globe2 /> Geografi & Tampilan</a>}
          <a href="#quality"><Database /> Data Quality</a>
        </nav>
        {!isPublic && <button className="sidebar-logout" onClick={logout}><LogOut /> Keluar</button>}
      </aside>
      {mobileMenu && <div className="sidebar-backdrop" onClick={() => setMobileMenu(false)} aria-hidden="true" />}

      <main className="main-content">
        <div className="sticky-header">
          <header className="topbar">
            <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu"><Menu /></button>
            <div><p className="eyebrow">{data?.website?.name ? "LAPORAN WEBSITE" : ""}</p><h1>{data?.website?.name || "Ringkasan Kondisi Website"}</h1></div>
            <div className="top-actions">
              <button className="button secondary desktop-only" onClick={() => window.print()}><Download /> Export PDF</button>
              {!isPublic && isAdmin && periodId && <button className="button secondary desktop-only" style={{color: "var(--red)"}} onClick={deletePeriod}><Trash2 /> Hapus</button>}
              {!isPublic && isAdmin && <button className="button secondary desktop-only" onClick={() => setUploadModal(true)}><Upload /> Upload report</button>}
              {!isPublic && isAdmin && <button className="button secondary desktop-only" onClick={shareReport}><Share2 /> Bagikan</button>}
              {!isPublic && isAdmin && data?.website?.public_token && <a className="button secondary desktop-only" href={`/report-data/${data.website.public_token}${periodId ? `?periodId=${periodId}` : ""}`}><Database /> Data lengkap</a>}
            </div>
          </header>

          {(!isPublic || isClientMode) && <section className="control-bar">
            <label>Website<select value={websiteId} onChange={(e) => setWebsiteId(e.target.value)}><option value="">Pilih website</option>{websites.map((website: any) => <option key={website.id} value={website.id}>{website.name} — {website.domain}</option>)}</select></label>
            {!isClientMode && isAdmin && <button className="button subtle" onClick={() => setWebsiteModal(true)}><Plus /> Tambah website</button>}
            {!isClientMode && isAdmin && <button className="button subtle" onClick={() => setClientModal(true)}><Users /> Kelola Klien</button>}
            {data?.periods?.length > 0 && <label className="period-control">Periode<select value={periodId} onChange={(e) => { setPeriodId(e.target.value); loadDashboard(websiteId, e.target.value, websites, searchType); }}>{data.periods.map((period: any) => <option key={period.id} value={period.id}>{period.period_label}</option>)}</select></label>}
            {hasGsc && <label className="period-control">Search<select value={searchType} onChange={(e) => setSearchType(e.target.value as "web" | "aigen")}><option value="web">Web (Organik)</option><option value="aigen">AI Overviews (SGE)</option></select></label>}
          </section>}

          {(isPublic && !isClientMode) && data?.periods?.length > 0 && <section className="public-period"><span>{data.website.name} · {data.website.domain}</span><select value={periodId} onChange={(e) => setPeriodId(e.target.value)}>{data.periods.map((period: any) => <option key={period.id} value={period.id}>{period.period_label}</option>)}</select>{hasGsc && <select value={searchType} onChange={(e) => setSearchType(e.target.value as "web" | "aigen")} style={{marginLeft: 12}}><option value="web">Web (Organik)</option><option value="aigen">AI Overviews</option></select>}</section>}
        </div>

        {message && <div className="toast" onClick={() => setMessage("")}>{message}<X size={16}/></div>}

          {!data || data.empty ? <EmptyState onAdd={() => setWebsiteModal(true)} onUpload={() => setUploadModal(true)} isPublic={isPublic} isAdmin={isAdmin} /> : <>
          <div className="print-only">
            <h2>{data.website.name}</h2>
            <p>{data.website.domain}{data.periods?.find((p:any)=>p.id===periodId)?.period_label ? ` · ${data.periods.find((p:any)=>p.id===periodId)?.period_label}` : ""}</p>
          </div>
          <section className="health-summary">
            <div className={`health-icon ${data.status === "BERTUMBUH" ? "good" : data.status === "PERLU PERHATIAN" ? "bad" : "steady"}`}><TrendingUp /></div>
            <div className="health-title"><span className={`status-pill ${data.status === "BERTUMBUH" ? "success" : "warning"}`}>{data.status}</span><strong>{data.status === "BERTUMBUH" ? "Website berada dalam kondisi positif." : "Website membutuhkan evaluasi terarah."}</strong></div>
            <div className="health-copy"><p>{data.insights?.[0] || "Data periode ini sudah berhasil diproses."}</p><p>{data.insights?.[1] || "Gunakan kartu di bawah untuk memahami sumber perubahan."}</p></div>
          </section>

          <div className="analyst-wrap"><AnalystNotes notes={data.analystNotes || []} /></div>

          {data.monthlySeries?.length > 1 && <MonthlyTrend data={data} />}

          <section className="pillar-grid">
            {hasGsc && <article className="pillar-card" id="search"><header><span className="pillar-number blue"><Search /></span><div><b>1. Ditemukan di Google {searchType === "aigen" ? "(AI Overviews)" : ""}</b><p>Visibilitas website di pencarian {searchType === "aigen" ? "AI Generative" : "Organik"}</p></div></header>
              <Metric label="Impressions" value={fmt.format(data.metrics[searchType === "aigen" ? "gsc-aigen.impressions" : "gsc.impressions"] || 0)} comparison={data.comparisons[searchType === "aigen" ? "gsc-aigen.impressions" : "gsc.impressions"]} values={gscValues}/>
              <Metric label="Clicks" value={fmt.format(data.metrics[searchType === "aigen" ? "gsc-aigen.clicks" : "gsc.clicks"] || 0)} comparison={data.comparisons[searchType === "aigen" ? "gsc-aigen.clicks" : "gsc.clicks"]} values={clickValues}/>
              <div className="small-metrics"><div><span>CTR</span><b>{percent(data.metrics[searchType === "aigen" ? "gsc-aigen.ctr" : "gsc.ctr"], true)}</b></div><div><span>Posisi rata-rata</span><b>{dec.format(data.metrics[searchType === "aigen" ? "gsc-aigen.average_position" : "gsc.average_position"] || 0)}</b></div></div>
            </article>}

            {hasGa && <article className="pillar-card" id="traffic"><header><span className="pillar-number green"><Users /></span><div><b>2. Mendapatkan Pengunjung</b><p>Jumlah dan sumber traffic</p></div></header>
              <Metric label="Sesi" value={fmt.format(data.metrics["ga.sessions"] || 0)} comparison={data.comparisons["ga.sessions"]} values={gaValues}/>
              <Metric label="Pengguna aktif" value={fmt.format(data.metrics["ga.active_users"] || 0)} comparison={data.comparisons["ga.active_users"]} values={gaValues}/>
              <ChannelList channels={data.channels || []} sessions={data.metrics["ga.sessions"] || 0}/>
            </article>}

            {hasGa && <article className="pillar-card" id="engagement"><header><span className="pillar-number purple"><Activity /></span><div><b>3. Membuat Pengunjung Tertarik</b><p>Ketertarikan terhadap konten</p></div></header>
              <Metric label="Page view" value={fmt.format(data.metrics["ga.page_views"] || 0)} comparison={data.comparisons["ga.page_views"]} values={engagementValues}/>
              <Metric label="Page view / sesi" value={dec.format(data.metrics["ga.pages_per_session"] || 0)} comparison={data.comparisons["ga.pages_per_session"]} values={engagementValues}/>
              <div className="small-metrics"><div><span>Engagement rata-rata</span><b>{formatDuration(data.metrics["ga.average_engagement_seconds"] || 0)}</b></div><div><span>Pengguna baru</span><b>{fmt.format(data.metrics["ga.new_users"] || 0)}</b></div></div>
            </article>}

            {hasGa && <article className="pillar-card" id="conversion"><header><span className="pillar-number orange"><MousePointerClick /></span><div><b>4. Menghasilkan Tindakan Bisnis</b><p>Interaksi penting pengunjung</p></div></header>
              <Metric label="Click-to-chat" value={fmt.format(data.metrics["ga.click_to_chat"] || 0)} comparison={data.comparisons["ga.click_to_chat"]} values={clickValues}/>
              <Metric label="Conversion rate (chat)" value={percent(data.metrics["ga.chat_conversion_rate"], true)} comparison={data.comparisons["ga.chat_conversion_rate"]} values={clickValues}/>
              <div className="small-metrics"><div><span>Revenue tercatat</span><b>{data.metrics["ga.revenue"] ? `Rp${fmt.format(data.metrics["ga.revenue"])}` : "Belum tersedia"}</b></div></div>
            </article>}
          </section>

          <div className="dash-grid">
          <section className="section-card g-change"><div className="section-heading"><div><p className="eyebrow">PERUBAHAN UTAMA</p><h2>Apa yang berubah dibanding bulan lalu?</h2></div></div><div className="insight-grid" style={{ marginBottom: "24px" }}>{(data.insights || []).slice(0, 4).map((insight: string, i: number) => <article key={insight}><span className={i === 1 ? "insight-icon down" : "insight-icon"}>{i === 1 ? <TrendingDown/> : <TrendingUp/>}</span><p>{insight}</p></article>)}</div>{data.isPartialMonth && <p className="partial-note"><CircleAlert size={14} /> Periode ini belum berakhir (masih berjalan). Angka dibandingkan dengan bulan lalu mungkin belum mencerminkan kondisi akhir bulan.</p>}
            <div className="quality-section-inner">
              <div className="section-heading"><div><p className="eyebrow">KUALITAS DATA</p><h2>Seberapa lengkap laporan ini?</h2></div></div>
              <div className="quality-grid">{data.dataQuality.map((item:any)=><article key={item.label}><span className={`quality-icon ${item.status}`}>{item.status === "ok" ? <Check/> : <CircleAlert/>}</span><div><b>{item.label}</b><p>{item.detail}</p></div></article>)}</div>
            </div>
          </section>

          <section className="section-card full opp" id="opportunities"><div className="section-heading"><div><p className="eyebrow">PRIORITAS BULAN DEPAN</p><h2>Peluang terbaik yang dapat dikerjakan</h2></div><button className="link-button" onClick={() => openFull("queries", "Semua Kata Kunci")}><ExternalLink size={14} /> Lihat semua</button></div><div className="opportunity-grid">
            {hasGsc && <OpportunityCard number="1" title="Perbaiki CTR keyword potensial"><p>Keyword sudah berada dekat posisi teratas, tetapi belum menghasilkan klik maksimal.</p><div className="responsive-table"><table><thead><tr><th>Keyword</th><th>Posisi</th><th>CTR</th><th>Impr.</th></tr></thead><tbody>{(data.opportunities || []).slice(0,4).map((row:any)=><tr key={row.query}><td>{row.query}</td><td>{dec.format(row.averagePosition)}</td><td>{percent(row.ctr,true)}</td><td>{fmt.format(row.impressions)}</td></tr>)}</tbody></table></div></OpportunityCard>}
            {hasGsc && <OpportunityCard number="2" title="Sebarkan traffic ke halaman lain"><p>Kurangi konsentrasi traffic organik pada satu halaman saja.</p>{(data.topGscPages || []).slice(0,4).map((row:any)=><div className="bar-row" key={row.page}><span>{shortPage(row.page)}</span><div><i style={{width:`${Math.min(100,(row.clicks/(data.metrics["gsc.clicks"]||1))*100)}%`}}/></div><b>{fmt.format(row.clicks)}</b></div>)}</OpportunityCard>}
            {hasGa && <OpportunityCard number="3" title="Perkuat pengukuran konversi"><p>Pastikan tindakan bisnis penting ditandai sebagai key event di GA4.</p>{(data.events || []).slice(0,5).map((row:any)=><div className="event-row" key={row.name}><span>{row.name}</span><b>{fmt.format(row.count)}</b></div>)}</OpportunityCard>}
          </div></section>

          {hasGsc && <section className="section-card g-devices" id="devices"><div className="section-heading"><div><p className="eyebrow">PERANGKAT</p><h2>Dari mana traffic datang berdasarkan perangkat?</h2></div></div><DeviceList devices={data.devices || []} /></section>}

          {hasGa && <section className="section-card g-pages" id="pages"><div className="section-heading"><div><p className="eyebrow">HALAMAN TERPOPULER</p><h2>Halaman apa yang paling banyak dikunjungi?</h2></div><button className="link-button" onClick={() => openFull("pages", "Semua Halaman Terpopuler")}><ExternalLink size={14} /> Lihat semua</button></div><TopPagesList pages={data.topPages || []} /></section>}

          {hasGa && <section className="section-card g-devices-visitor" id="devices-visitor"><div className="section-heading"><div><p className="eyebrow">PERANGKAT PENGUNJUNG</p><h2>Model perangkat yang dipakai pengunjung</h2></div><button className="link-button" onClick={() => openFull("deviceModels", "Semua Model Perangkat")}><ExternalLink size={14} /> Lihat semua</button></div><DeviceModelList models={(data.deviceModels || []).slice(0, 7)} /><p className="device-foot">Data dari Google Analytics berdasarkan pengguna aktif.</p></section>}

          {hasGsc && <section className="section-card g-geography" id="geography"><div className="section-heading"><div><p className="eyebrow">GEOGRAFI & TAMPILAN</p><h2>Dari wilayah mana audiens berasal & bagaimana website muncul di pencarian?</h2></div></div><div className="split-grid">
            <div className="split-col"><h3 className="sub-head"><Globe2 size={16} /> Negara (Wilayah)</h3><CountryList countries={data.countries || []} /></div>
            <div className="split-col"><h3 className="sub-head"><Search size={16} /> Tampilan di Pencarian</h3><AppearanceList appearances={data.appearances || []} /></div>
          </div><p className="device-foot">Negara & tampilan penelusuran mencerminkan agregat 12 bulan dari ekspor Google Search Console.</p></section>}

          {hasGa && <section className="section-card g-cities" id="cities"><div className="section-heading"><div><p className="eyebrow">GEOGRAFI PENGUNJUNG</p><h2>Kota asal pengunjung website</h2></div><button className="link-button" onClick={() => openFull("cities", "Semua Kota")}><ExternalLink size={14} /> Lihat semua</button></div><CityList cities={data.topCities || []} /><p className="device-foot">Kota diurutkan dari jumlah pengguna aktif terbanyak, berdasarkan data Google Analytics.</p></section>}




          {hasGsc && <section className="section-card g-topsearch" id="top-search"><div className="section-heading"><div><p className="eyebrow">HALAMAN PALING SERING DICARI</p><h2>Halaman apa yang paling banyak muncul di Google?</h2></div><button className="link-button" onClick={() => openFull("gscPages", "Semua Halaman Pencarian")}><ExternalLink size={14} /> Lihat semua</button></div><TopSearchPagesList pages={data.topGscPages || []} /></section>}

          {hasGsc && <section className="section-card g-keywords" id="keywords"><div className="section-heading"><div><p className="eyebrow">KATA KUNCI</p><h2>Kata kunci apa yang paling banyak muncul di Google?</h2></div><button className="link-button" onClick={() => openFull("queries", "Semua Kata Kunci")}><ExternalLink size={14} /> Lihat semua</button></div>{(data.topQueries || []).length ? <TopQueryList queries={data.topQueries} /> : <p className="empty-note">Belum ada data kata kunci untuk periode ini.</p>}</section>}
          </div>
        </>}
      </main>

      {!isPublic && <nav className="mobile-bottom-nav"><button><Home/><span>Ringkasan</span></button>{isAdmin && <button onClick={() => setUploadModal(true)}><Upload/><span>Upload</span></button>}<button onClick={shareReport}><Share2/><span>Bagikan</span></button>{isAdmin && <button onClick={() => setWebsiteModal(true)}><Globe2/><span>Website</span></button>}</nav>}

        {websiteModal && <WebsiteModal open={websiteModal} clients={clients} onClose={() => setWebsiteModal(false)} onCreated={() => { setWebsiteModal(false); loadWebsites(); }} />}
        {clientModal && <ClientModal open={clientModal} clients={clients} onClose={() => setClientModal(false)} onCreated={() => { fetch("/api/clients").then(r => r.ok ? r.json() : null).then(res => { if (res?.clients) setClients(res.clients); }).catch(() => {}); }} />}
        {uploadModal && <UploadModal open={uploadModal} websiteId={websiteId} onClose={() => setUploadModal(false)} onDone={async (result) => { setUploadModal(false); const totalWarnings=(result.results||[]).reduce((sum:number,r:any)=>sum+(r.warnings?.length||0),0); if(!result.periodId){setMessage(`${result.succeeded} berhasil, ${result.failed} gagal.`);return;} setPeriodId(result.periodId); await loadDashboard(websiteId, result.periodId); setMessage(totalWarnings?`${result.succeeded} report diproses dengan ${totalWarnings} catatan.`:`${result.succeeded} report berhasil diproses.`); }}/>}
      {fullModal?.open && <DataModal open={fullModal.open} title={fullModal.title} columns={fullModal.columns} rows={fullModal.rows} filename={fullModal.filename} onClose={() => setFullModal(null)} />}
    </div>
  );
}

function EmptyState({ onAdd, onUpload, isPublic, isAdmin }: { onAdd:()=>void; onUpload:()=>void; isPublic:boolean; isAdmin:boolean }) {
  return <section className="empty-state"><FileSpreadsheet/><h2>Belum ada laporan untuk ditampilkan</h2><p>{isPublic ? "Pemilik dashboard belum mengunggah data periode ini." : "Tambahkan website, lalu upload report GSC atau Google Analytics dalam format XLSX/CSV."}</p>{isAdmin && <div><button className="button secondary" onClick={onAdd}><Plus/>Tambah website</button><button className="button primary" onClick={onUpload}><Upload/>Upload report</button></div>}</section>;
}

function WebsiteModal({ open, onClose, onCreated, clients }: { open:boolean; onClose:()=>void; onCreated:()=>void; clients: any[] }) {
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError("");const form=new FormData(e.currentTarget);const response=await fetch('/api/websites',{method:'POST',headers:{'Content-Type':'application/json', 'x-requested-with': 'XMLHttpRequest'},body:JSON.stringify({name:form.get('name'),domain:form.get('domain'),timezone:'Asia/Jakarta',client_id:form.get('client_id')})});const result=await response.json();setLoading(false);if(!response.ok)return setError(result.error);onCreated();}
  return <Modal open={open} title="Tambah website" onClose={onClose}><form className="form-stack" onSubmit={submit}><label>Klien Pemilik (Opsional)<select name="client_id"><option value="">-- Tanpa Klien --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Nama website<input name="name" placeholder="Contoh: Erihome" required/></label><label>Domain<input name="domain" placeholder="erihome.id" required/></label>{error&&<p className="form-error">{error}</p>}<button className="button primary wide" disabled={loading}>{loading?'Menyimpan…':'Simpan website'}</button></form></Modal>;
}

function ClientModal({ open, onClose, onCreated, clients }: { open:boolean; onClose:()=>void; onCreated:()=>void; clients: any[] }) {
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError("");const form=new FormData(e.currentTarget);const response=await fetch('/api/clients',{method:'POST',headers:{'Content-Type':'application/json', 'x-requested-with': 'XMLHttpRequest'},body:JSON.stringify({name:form.get('name')})});const result=await response.json();setLoading(false);if(!response.ok)return setError(result.error);onCreated();}
  return <Modal open={open} title="Kelola Klien" onClose={onClose}>
    <div className="client-list" style={{ marginBottom: 24, maxHeight: 200, overflowY: "auto" }}>
      {clients.length === 0 ? <p className="empty-note">Belum ada klien.</p> : <table className="data-table"><thead><tr><th>Nama Klien</th><th>Website</th><th>Portfolio Link</th></tr></thead><tbody>{clients.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.website_count}</td><td><button type="button" className="button subtle" onClick={() => { navigator.clipboard.writeText(location.origin + "/client/" + c.public_token); alert("Link disalin"); }}>Copy Link</button></td></tr>)}</tbody></table>}
    </div>
    <form className="form-stack" onSubmit={submit}>
      <h3 className="sub-head">Tambah Klien Baru</h3>
      <label>Nama Perusahaan / Klien<input name="name" placeholder="Contoh: PT Maju Jaya" required/></label>
      {error&&<p className="form-error">{error}</p>}
      <button className="button primary wide" disabled={loading}>{loading?'Menyimpan…':'Simpan Klien'}</button>
    </form>
  </Modal>;
}

function UploadModal({ open, websiteId, onClose, onDone }: { open:boolean; websiteId:string; onClose:()=>void; onDone:(r:any)=>void }) {
  const [files,setFiles]=useState<File[]>([]); const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const [isAiGen,setIsAiGen]=useState(false); const input=useRef<HTMLInputElement>(null);
  function addFiles(list:FileList|null){if(list&&list.length)setFiles((prev)=>[...prev,...Array.from(list)]);}
  async function submit(e:FormEvent){e.preventDefault();if(!files.length||!websiteId)return setError('Pilih website dan minimal satu file terlebih dahulu.');setLoading(true);setError('');const form=new FormData();form.set('websiteId',websiteId);form.set('isAiGen',String(isAiGen));for(const f of files)form.append('file',f);const response=await fetch('/api/upload',{method:'POST',headers:{'x-requested-with': 'XMLHttpRequest'},body:form});const result=await response.json();setLoading(false);if(!response.ok)return setError(result.error||'Upload gagal.');setFiles([]);setIsAiGen(false);onDone(result);}
  return <Modal open={open} title="Upload report mentah" onClose={onClose}><form className="form-stack" onSubmit={submit}><button type="button" className={`dropzone ${files.length?'selected':''}`} onClick={()=>input.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files);}}><input ref={input} hidden type="file" accept=".xlsx,.csv" multiple onChange={e=>addFiles(e.target.files)}/><Upload/>{files.length?<><b>{files.length} file dipilih</b><span>{files.map(f=>f.name).join(', ').slice(0,90)}</span></>:<><b>Tarik file ke sini</b><span>atau klik untuk memilih XLSX / CSV (bisa lebih dari satu)</span></>}</button><div className="upload-note"><Check/>Sumber & periode terdeteksi otomatis. Untuk ekspor GSC berbentuk beberapa CSV, seret semua file sekaligus.</div><label style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.9rem"}}><input type="checkbox" checked={isAiGen} onChange={e=>setIsAiGen(e.target.checked)}/> Khusus data AI Generative (SGE)</label>{error&&<p className="form-error">{error}</p>}<button className="button primary wide" disabled={loading||!files.length}>{loading?'Memvalidasi dan memproses…':`Proses ${files.length} report`}</button>{files.length>0&&<ul className="file-list" style={{ maxHeight: '35vh', overflowY: 'auto', marginTop: '16px' }}>{files.map((f,i)=><li key={`${f.name}-${i}`}><span className="file-name">{f.name}</span><span className="file-size">{(f.size/1024).toFixed(1)} KB</span><button type="button" className="file-remove" onClick={()=>setFiles(files.filter((_,j)=>j!==i))} aria-label={`Hapus ${f.name}`}><X size={14}/></button></li>)}</ul>}</form></Modal>;
}

function OpportunityCard({number,title,children}:{number:string;title:string;children:React.ReactNode}){return <article className="opportunity-card"><header><span>{number}</span><b>{title}</b></header>{children}</article>}
function ChannelList({channels,sessions}:{channels:any[];sessions:number}){return <div className="channel-list">{channels.slice(0,4).map((row,i)=><div key={row.channel}><span><i className={`dot d${i}`}/>{row.channel}</span><b>{fmt.format(row.sessions)} <small>({percent(sessions?row.sessions/sessions:0,true)})</small></b></div>)}</div>}
function shortPage(value:string){try{const p=new URL(value).pathname;return p==='/'?'Homepage':p.replace(/^\//,'');}catch{return value;}}
function formatDuration(seconds:number){const total=Math.round(seconds);const m=Math.floor(total/60);const s=total%60;return m?`${m}m ${s}d`:`${s} detik`}

function shortTitle(value:string){return value.split(" - ")[0].trim();}

function DeviceList({ devices }:{ devices:Array<{ device:string; clicks:number; impressions:number; ctr:number; averagePosition:number }> }){
  if(!devices.length) return <p className="empty-note">Belum ada data perangkat untuk periode ini.</p>;
  const total=devices.reduce((sum,d)=>sum+(d.impressions||0),0)||1;
  const max=Math.max(...devices.map((d)=>d.impressions||0),1);
  return <div className="device-list">{devices.map((d)=>(
    <div className="device-row" key={d.device}>
      <div className="device-head"><b>{d.device}</b><span>{fmt.format(d.impressions)} tayangan</span></div>
      <div className="bar"><i style={{width:`${Math.min(100,(d.impressions/max)*100)}%`}}/></div>
      <div className="device-meta"><span>Klik {fmt.format(d.clicks)}</span><span>CTR {percent(d.ctr,true)}</span><span>Posisi {dec.format(d.averagePosition)}</span></div>
    </div>
  ))}<p className="device-foot">Total tayangan: {fmt.format(total)}</p></div>;
}

function TopPagesList({ pages }:{ pages:Array<{ title:string; views:number }> }){
  if(!pages.length) return <p className="empty-note">Belum ada data halaman untuk periode ini.</p>;
  const max=Math.max(...pages.map((p)=>p.views||0),1);
  return <div className="bar-list">{pages.map((p)=>(
    <div className="bar-row" key={p.title}><span title={p.title}>{shortTitle(p.title)}</span><div><i style={{width:`${Math.min(100,(p.views/max)*100)}%`}}/></div><b>{fmt.format(p.views)}</b></div>
  ))}</div>;
}

function TopSearchPagesList({ pages }:{ pages:Array<{ page:string; impressions:number; clicks:number }> }){
  const sorted = [...pages].sort((a, b) => b.impressions - a.impressions).slice(0, 8);
  if (!sorted.length) return <p className="empty-note">Belum ada data pencarian per halaman.</p>;
  const max = Math.max(...sorted.map((p) => p.impressions || 0), 1);
  return <div className="bar-list">{sorted.map((p) => (
    <div className="bar-row" key={p.page}><span title={p.page}>{shortPage(p.page)}</span><div><i style={{ width: `${Math.min(100, (p.impressions / max) * 100)}%` }} /></div><b>{fmt.format(p.impressions)}</b><small className="bar-sub">klik {fmt.format(p.clicks)}</small></div>
  ))}</div>;
}

function TopQueryList({ queries }:{ queries:Array<{ query:string; impressions:number; clicks:number }> }){
  const sorted = [...queries].sort((a, b) => b.impressions - a.impressions).slice(0, 8);
  if (!sorted.length) return <p className="empty-note">Belum ada data kata kunci untuk periode ini.</p>;
  const max = Math.max(...sorted.map((q) => q.impressions || 0), 1);
  return <div className="bar-list">{sorted.map((q) => (
    <div className="bar-row" key={q.query}><span title={q.query}>{q.query}</span><div><i style={{ width: `${Math.min(100, (q.impressions / max) * 100)}%` }} /></div><b>{fmt.format(q.impressions)}</b><small className="bar-sub">klik {fmt.format(q.clicks)}</small></div>
  ))}</div>;
}

function CountryList({ countries }:{ countries:Array<{ name:string; clicks:number; impressions:number; ctr:number; averagePosition:number }> }){
  if(!countries.length) return <p className="empty-note">Belum ada data negara untuk periode ini.</p>;
  const max=Math.max(...countries.map((c)=>c.impressions||0),1);
  return <div className="bar-list">{countries.slice(0,10).map((c)=>(
    <div className="bar-row" key={c.name}><span>{c.name}</span><div><i style={{width:`${Math.min(100,(c.impressions/max)*100)}%`}}/></div><b>{fmt.format(c.impressions)}</b></div>
  ))}</div>;
}

function CityList({ cities }:{ cities:Array<{ city:string; activeUsers:number }> }){
  if(!cities.length) return <p className="empty-note">Belum ada data kota untuk periode ini.</p>;
  const max=Math.max(...cities.map((c)=>c.activeUsers||0),1);
  return <div className="bar-list">{cities.map((c)=>(
    <div className="bar-row" key={c.city}><span>{c.city}</span><div><i style={{width:`${Math.min(100,(c.activeUsers/max)*100)}%`}}/></div><b>{fmt.format(c.activeUsers)}</b></div>
  ))}</div>;
}

function DeviceModelList({ models }:{ models:Array<{ model:string; activeUsers:number }> }){
  if(!models.length) return <p className="empty-note">Belum ada data model perangkat untuk periode ini.</p>;
  const max=Math.max(...models.map((m)=>m.activeUsers||0),1);
  return <div className="bar-list">{models.map((m)=>(
    <div className="bar-row" key={m.model}><span>{m.model}</span><div><i style={{width:`${Math.min(100,(m.activeUsers/max)*100)}%`}}/></div><b>{fmt.format(m.activeUsers)}</b></div>
  ))}</div>;
}

function AppearanceList({ appearances }:{ appearances:Array<{ name:string; clicks:number; impressions:number; ctr:number; averagePosition:number }> }){
  if(!appearances.length) return <p className="empty-note">Belum ada data tampilan penelusuran.</p>;
  const max=Math.max(...appearances.map((a)=>a.impressions||0),1);
  return <div className="device-list">{appearances.map((a)=>(
    <div className="device-row" key={a.name}>
      <div className="device-head"><b>{a.name}</b><span>{fmt.format(a.impressions)} tayangan</span></div>
      <div className="bar"><i style={{width:`${Math.min(100,(a.impressions/max)*100)}%`}}/></div>
      <div className="device-meta"><span>Klik {fmt.format(a.clicks)}</span><span>CTR {percent(a.ctr,true)}</span><span>Posisi {dec.format(a.averagePosition)}</span></div>
    </div>
  ))}</div>;
}

function AnalystNotes({ notes }:{ notes:string[] }){
  if(!notes.length) return null;
  return <section className="section-card analyst-card"><div className="section-heading"><div><p className="eyebrow">CATATAN ANALIS</p><h2>Interpretasi profesional</h2></div></div><ul className="analyst-list">{notes.map((note,i)=><li key={i}><span className="analyst-badge">{i+1}</span><p>{note}</p></li>)}</ul></section>;
}

function AnomalyList({ anomalies, partial }:{ anomalies:Array<{ severity:string; text:string }>; partial?:boolean }){
  if(!anomalies.length) return null;
  return <section className="section-card anomaly-card" id="anomalies"><div className="section-heading"><div><p className="eyebrow">PERINGATAN & ANOMALI</p><h2>Apa yang perlu diperhatikan segera?</h2></div></div>{partial && <p className="partial-note light"><CircleAlert size={14} /> Bulan ini masih berjalan, sehingga anomali penurunan bisa berubah saat data akhir bulan masuk.</p>}<ul className="anomaly-list">{anomalies.map((a,i)=><li key={i} className={`anomaly-item ${a.severity}`}><span className="anomaly-icon">{a.severity==="critical"?<CircleAlert/>:a.severity==="warning"?<TrendingDown/>:<TrendingUp/>}</span><p>{a.text}</p></li>)}</ul></section>;
}

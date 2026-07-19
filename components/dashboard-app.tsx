"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, BarChart3, Check, ChevronDown, CircleAlert, Database, Download, ExternalLink,
  FileSpreadsheet, FolderOpen, Gauge, Globe2, Home, LogOut, Menu, MousePointerClick, Plus, Search,
  Share2, Sparkles, Target, Trash2, TrendingDown, TrendingUp, Upload, Users, X,
} from "lucide-react";
import { Sparkline } from "./sparkline";
import { MonthlyTrend } from "./monthly-trend";
import { Modal } from "./modal";
import { DataModal } from "./data-modal";
import { LogModal } from "./log-modal";
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
  const [logModal, setLogModal] = useState(false);
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

  async function loadDashboard(targetWebsite = websiteId, targetPeriod = periodId, currentWebsites = websites) {
    if ((!isPublic || isClientMode) && !targetWebsite) { setLoading(false); setData(null); return; }
    setLoading(true);
    let endpoint = "";
    if (isClientMode) {
      const wToken = currentWebsites.find((w: any) => w.id === targetWebsite)?.public_token;
      if (!wToken) { setLoading(false); return; }
      endpoint = `/api/public/report/${wToken}${targetPeriod ? `?periodId=${targetPeriod}` : ""}`;
    } else if (isPublic) {
      endpoint = `/api/public/report/${publicToken}${targetPeriod ? `?periodId=${targetPeriod}` : ""}`;
    } else {
      endpoint = `/api/dashboard?websiteId=${targetWebsite}${targetPeriod ? `&periodId=${targetPeriod}` : ""}`;
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
  useEffect(() => { if ((!isPublic || isClientMode) && websiteId) { setPeriodId(""); loadDashboard(websiteId, "", websites); } }, [websiteId, websites]);
  useEffect(() => { if (isPublic && !isClientMode && periodId) loadDashboard("", periodId, websites); }, [periodId]);

  const gscWebValues = useMemo(() => (data?.trends?.gscWeb || []).map((row: any) => Number(row.impressions || 0)), [data]);
  const clickWebValues = useMemo(() => (data?.trends?.gscWeb || []).map((row: any) => Number(row.clicks || 0)), [data]);
  
  const gscAigenValues = useMemo(() => (data?.trends?.gscAigen || []).map((row: any) => Number(row.impressions || 0)), [data]);
  const clickAigenValues = useMemo(() => (data?.trends?.gscAigen || []).map((row: any) => Number(row.clicks || 0)), [data]);
  
  const gaValues = useMemo(() => (data?.trends?.ga || []).map((row: any) => Number(row.activeUsers || 0)), [data]);
  const engagementValues = useMemo(() => (data?.trends?.ga || []).map((row: any) => Number(row.engagementSeconds || 0)), [data]);
  
  const hasGscWeb = (data?.metrics?.["gsc.impressions"] || 0) > 0;
  const hasGscAigen = (data?.metrics?.["gsc-aigen.impressions"] || 0) > 0;
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

  async function openFull(kind: "queries" | "gscPages" | "pages" | "cities" | "deviceModels", title: string, targetSearchType: "web" | "aigen" = "web"): Promise<void> {
    if (!data?.website?.public_token) return;
    const endpoint = isPublic
      ? `/api/public/report-data/${data.website.public_token}${periodId ? `?periodId=${periodId}&` : "?"}searchType=${targetSearchType}`
      : `/api/report-data?websiteId=${websiteId}${periodId ? `&periodId=${periodId}` : ""}&searchType=${targetSearchType}`;
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

          {hasGscWeb && <a href="#search-web"><Search /> Pencarian Organik</a>}
          {hasGa && <a href="#traffic"><Users /> Traffic & Pengunjung</a>}
          {hasGa && <a href="#engagement"><Activity /> Perilaku Pengunjung</a>}
          {hasGa && <a href="#conversion"><Target /> Konversi</a>}
          {hasGscAigen && <a href="#search-aigen"><Search /> Pencarian AI (SGE)</a>}
          
          <a href="#quality"><Database /> Data Quality</a>
          {!isClientMode && isAdmin && <a onClick={() => setLogModal(true)} style={{ cursor: "pointer" }}><Activity /> Sistem Log</a>}
        </nav>
        {!isPublic && <button className="sidebar-logout" onClick={logout}><LogOut /> Keluar</button>}
        <div className="sidebar-footer" style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-light)", opacity: 0.6, marginTop: "auto" }}>
          Versi: {process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0"} ({process.env.NEXT_PUBLIC_COMMIT_HASH || "dev"})
        </div>
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
            {data?.periods?.length > 0 && <label className="period-control">Periode<select value={periodId} onChange={(e) => { setPeriodId(e.target.value); loadDashboard(websiteId, e.target.value, websites); }}>{data.periods.map((period: any) => <option key={period.id} value={period.id}>{period.period_label}</option>)}</select></label>}
          </section>}

          {(isPublic && !isClientMode) && data?.periods?.length > 0 && <section className="public-period"><span>{data.website.name} · {data.website.domain}</span><select value={periodId} onChange={(e) => setPeriodId(e.target.value)}>{data.periods.map((period: any) => <option key={period.id} value={period.id}>{period.period_label}</option>)}</select></section>}
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

          <div className="dash-grid">
            <section className="section-card g-change"><div className="section-heading"><div><p className="eyebrow">PERUBAHAN UTAMA</p><h2>Apa yang berubah dibanding bulan lalu?</h2></div></div><div className="insight-grid" style={{ marginBottom: "24px" }}>{(data.insights || []).slice(0, 4).map((insight: string, i: number) => <article key={insight}><span className={i === 1 ? "insight-icon down" : "insight-icon"}>{i === 1 ? <TrendingDown/> : <TrendingUp/>}</span><p>{insight}</p></article>)}</div>{data.isPartialMonth && <p className="partial-note"><CircleAlert size={14} /> Periode ini belum berakhir (masih berjalan). Angka dibandingkan dengan bulan lalu mungkin belum mencerminkan kondisi akhir bulan.</p>}</section>
            
            <div className="quality-section-inner" id="quality">
              <div className="section-heading"><div><p className="eyebrow">KUALITAS DATA</p><h2>Seberapa lengkap laporan ini?</h2></div></div>
              <div className="quality-grid">{data.dataQuality.map((item:any)=><article key={item.label}><span className={`quality-icon ${item.status}`}>{item.status === "ok" ? <Check/> : <CircleAlert/>}</span><div><b>{item.label}</b><p>{item.detail}</p></div></article>)}</div>
            </div>
          </div>

          <div className="quick-jump-menu desktop-only">
            <a href="#section-web" className="jump-web"><Search size={16}/> Web (GSC)</a>
            <a href="#section-ga" className="jump-ga"><Users size={16}/> Analytics (GA)</a>
            <a href="#section-aigen" className="jump-aigen"><Sparkles size={16}/> AI Gen (SGE)</a>
          </div>

          <div id="section-web" className="theme-container theme-web">
          <h2 className="group-heading"><Search /> Google Search Console (Pencarian Organik)</h2>
          {hasGscWeb ? (
            <>
              <section className="pillar-grid">
                <article className="pillar-card" id="search-web" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Search Console" />
                  <header><span className="pillar-number blue"><Search /></span><div><b>Ditemukan di Google (Web)</b><p>Visibilitas website di pencarian Organik</p></div></header>
                  <Metric label="Tayangan" value={fmt.format(data.metrics["gsc.impressions"] || 0)} comparison={data.comparisons["gsc.impressions"]} values={gscWebValues}/>
                  <Metric label="Klik" value={fmt.format(data.metrics["gsc.clicks"] || 0)} comparison={data.comparisons["gsc.clicks"]} values={clickWebValues}/>
                  <div className="small-metrics"><div><span>CTR</span><b>{percent(data.metrics["gsc.ctr"], true)}</b></div><div><span>Posisi rata-rata</span><b>{dec.format(data.metrics["gsc.average_position"] || 0)}</b></div></div>
                </article>
              </section>

              <div className="dash-grid">
                <section className="section-card full opp"><div className="section-heading"><div><p className="eyebrow">PRIORITAS ORGANIK</p><h2>Peluang terbaik yang dapat dikerjakan</h2></div></div>
                  <div className="opportunity-grid">
                    <OpportunityCard number="1" title="Perbaiki CTR keyword potensial"><p>Keyword sudah berada dekat posisi teratas, tetapi belum menghasilkan klik maksimal.</p><div className="responsive-table"><table><thead><tr><th>Keyword</th><th>Posisi</th><th>CTR</th><th>Impr.</th></tr></thead><tbody>{(data.opportunities?.web || []).slice(0,4).map((row:any)=><tr key={row.query}><td>{row.query}</td><td>{dec.format(row.averagePosition)}</td><td>{percent(row.ctr,true)}</td><td>{fmt.format(row.impressions)}</td></tr>)}</tbody></table></div></OpportunityCard>
                    <OpportunityCard number="2" title="Sebarkan traffic ke halaman lain"><p>Kurangi konsentrasi traffic organik pada satu halaman saja.</p>{(data.topGscPages?.web || []).slice(0,4).map((row:any)=><div className="bar-row" key={row.page}><span>{shortPage(row.page)}</span><div><i style={{width:`${Math.min(100,(row.clicks/(data.metrics["gsc.clicks"]||1))*100)}%`}}/></div><b>{fmt.format(row.clicks)}</b></div>)}</OpportunityCard>
                  </div>
                </section>
                
                <section className="section-card g-devices" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Search Console" />
                  <div className="section-heading"><div><p className="eyebrow">PERANGKAT (WEB)</p><h2>Traffic berdasarkan perangkat</h2></div></div><DeviceList devices={data.devices?.web || []} />
                </section>
                
                <section className="section-card g-geography" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Search Console" />
                  <div className="section-heading"><div><p className="eyebrow">GEOGRAFI & TAMPILAN</p><h2>Negara & tampilan di pencarian</h2></div></div>
                  <div className="split-grid">
                    <div className="split-col"><h3 className="sub-head"><Globe2 size={16} /> Negara (Wilayah)</h3><CountryList countries={data.countries?.web || []} /></div>
                    <div className="split-col"><h3 className="sub-head"><Search size={16} /> Tampilan di Pencarian</h3><AppearanceList appearances={data.appearances?.web || []} /></div>
                  </div><p className="device-foot">Agregat dari Google Search Console.</p>
                </section>
                
                <section className="section-card g-topsearch" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Search Console" />
                  <div className="section-heading"><div><p className="eyebrow">HALAMAN SERING DICARI</p><h2>Halaman paling sering muncul</h2></div><button className="link-button" onClick={() => openFull("gscPages", "Semua Halaman Pencarian (Web)", "web")}><ExternalLink size={14} /> Lihat semua</button></div><TopSearchPagesList pages={data.topGscPages?.web || []} />
                </section>
                
                <section className="section-card g-keywords" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Search Console" />
                  <div className="section-heading"><div><p className="eyebrow">KATA KUNCI</p><h2>Kata kunci teratas</h2></div><button className="link-button" onClick={() => openFull("queries", "Semua Kata Kunci (Web)", "web")}><ExternalLink size={14} /> Lihat semua</button></div>{(data.topQueries?.web || []).length ? <TopQueryList queries={data.topQueries.web} /> : <p className="empty-note">Belum ada data kata kunci.</p>}
                </section>
              </div>
            </>
          ) : <div className="no-data-block"><FolderOpen /> Belum ada data Google Search Console (Pencarian Organik).</div>}
          </div>

          <div id="section-ga" className="theme-container theme-ga">
          <h2 className="group-heading"><Users /> Google Analytics</h2>
          {hasGa ? (
            <>
              <section className="pillar-grid">
                <article className="pillar-card" id="traffic" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Analytics" />
                  <header><span className="pillar-number green"><Users /></span><div><b>Mendapatkan Pengunjung</b><p>Jumlah dan sumber traffic</p></div></header>
                  <Metric label="Sesi" value={fmt.format(data.metrics["ga.sessions"] || 0)} comparison={data.comparisons["ga.sessions"]} values={gaValues}/>
                  <Metric label="Pengguna aktif" value={fmt.format(data.metrics["ga.active_users"] || 0)} comparison={data.comparisons["ga.active_users"]} values={gaValues}/>
                  <ChannelList channels={data.channels || []} sessions={data.metrics["ga.sessions"] || 0}/>
                </article>

                <article className="pillar-card" id="engagement" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Analytics" />
                  <header><span className="pillar-number purple"><Activity /></span><div><b>Ketertarikan Konten</b><p>Kualitas sesi pengunjung</p></div></header>
                  <Metric label="Page view" value={fmt.format(data.metrics["ga.page_views"] || 0)} comparison={data.comparisons["ga.page_views"]} values={engagementValues}/>
                  <Metric label="Page view / sesi" value={dec.format(data.metrics["ga.pages_per_session"] || 0)} comparison={data.comparisons["ga.pages_per_session"]} values={engagementValues}/>
                  <div className="small-metrics"><div><span>Engagement rata-rata</span><b>{formatDuration(data.metrics["ga.average_engagement_seconds"] || 0)}</b></div><div><span>Pengguna baru</span><b>{fmt.format(data.metrics["ga.new_users"] || 0)}</b></div></div>
                </article>

                <article className="pillar-card" id="conversion" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Analytics" />
                  <header><span className="pillar-number orange"><MousePointerClick /></span><div><b>Tindakan Bisnis</b><p>Interaksi penting pengunjung</p></div></header>
                  <Metric label="Click-to-chat" value={fmt.format(data.metrics["ga.click_to_chat"] || 0)} comparison={data.comparisons["ga.click_to_chat"]} values={clickWebValues}/>
                  <Metric label="Conversion rate (chat)" value={percent(data.metrics["ga.chat_conversion_rate"], true)} comparison={data.comparisons["ga.chat_conversion_rate"]} values={clickWebValues}/>
                  <div className="small-metrics"><div><span>Revenue tercatat</span><b>{data.metrics["ga.revenue"] ? `Rp${fmt.format(data.metrics["ga.revenue"])}` : "Belum tersedia"}</b></div></div>
                </article>
              </section>

              <div className="dash-grid">
                <section className="section-card full opp"><div className="section-heading"><div><p className="eyebrow">PRIORITAS ANALYTICS</p><h2>Perhatian utama</h2></div></div>
                  <div className="opportunity-grid">
                    <OpportunityCard number="1" title="Perkuat pengukuran konversi"><p>Pastikan tindakan bisnis penting ditandai sebagai key event di GA4.</p>{(data.events || []).slice(0,5).map((row:any)=><div className="event-row" key={row.name}><span>{row.name}</span><b>{fmt.format(row.count)}</b></div>)}</OpportunityCard>
                  </div>
                </section>
                
                <section className="section-card g-pages" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Analytics" />
                  <div className="section-heading"><div><p className="eyebrow">HALAMAN TERPOPULER</p><h2>Paling banyak dikunjungi</h2></div><button className="link-button" onClick={() => openFull("pages", "Semua Halaman Terpopuler", "web")}><ExternalLink size={14} /> Lihat semua</button></div><TopPagesList pages={data.topPages || []} />
                </section>
                
                <section className="section-card g-cities" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Analytics" />
                  <div className="section-heading"><div><p className="eyebrow">GEOGRAFI PENGUNJUNG</p><h2>Kota asal pengunjung</h2></div><button className="link-button" onClick={() => openFull("cities", "Semua Kota", "web")}><ExternalLink size={14} /> Lihat semua</button></div><CityList cities={data.topCities || []} /><p className="device-foot">Berdasarkan data pengguna aktif.</p>
                </section>
                
                <section className="section-card g-devices-visitor" style={{ position: 'relative' }}>
                  <SourceBadge source="Google Analytics" />
                  <div className="section-heading"><div><p className="eyebrow">PERANGKAT PENGUNJUNG</p><h2>Model perangkat pengunjung</h2></div><button className="link-button" onClick={() => openFull("deviceModels", "Semua Model Perangkat", "web")}><ExternalLink size={14} /> Lihat semua</button></div><DeviceModelList models={(data.deviceModels || []).slice(0, 7)} /><p className="device-foot">Data dari Google Analytics.</p>
                </section>
              </div>
            </>
          ) : <div className="no-data-block"><FolderOpen /> Belum ada data Google Analytics.</div>}
          </div>

          <div id="section-aigen" className="theme-container theme-aigen">
          <h2 className="group-heading"><Sparkles /> Google AI Generative (SGE)</h2>
          {hasGscAigen ? (
            <>
              <section className="pillar-grid">
                <article className="pillar-card" id="search-aigen" style={{ position: 'relative' }}>
                  <SourceBadge source="Google AI Generative" />
                  <header><span className="pillar-number blue"><Search /></span><div><b>Ditemukan di AI Overviews</b><p>Visibilitas website di pencarian AI</p></div></header>
                  <Metric label="Tayangan" value={fmt.format(data.metrics["gsc-aigen.impressions"] || 0)} comparison={data.comparisons["gsc-aigen.impressions"]} values={gscAigenValues}/>
                  <Metric label="Klik" value={fmt.format(data.metrics["gsc-aigen.clicks"] || 0)} comparison={data.comparisons["gsc-aigen.clicks"]} values={clickAigenValues}/>
                  <div className="small-metrics"><div><span>CTR</span><b>{percent(data.metrics["gsc-aigen.ctr"], true)}</b></div><div><span>Posisi rata-rata</span><b>{dec.format(data.metrics["gsc-aigen.average_position"] || 0)}</b></div></div>
                </article>
              </section>

              <div className="dash-grid">
                <section className="section-card g-devices" style={{ position: 'relative' }}>
                  <SourceBadge source="Google AI Generative" />
                  <div className="section-heading"><div><p className="eyebrow">PERANGKAT (AI GEN)</p><h2>Traffic berdasarkan perangkat</h2></div></div><DeviceList devices={data.devices?.aigen || []} />
                </section>
                
                <section className="section-card g-geography" style={{ position: 'relative' }}>
                  <SourceBadge source="Google AI Generative" />
                  <div className="section-heading"><div><p className="eyebrow">GEOGRAFI & TAMPILAN (AI GEN)</p><h2>Negara & tampilan di pencarian</h2></div></div>
                  <div className="split-grid">
                    <div className="split-col"><h3 className="sub-head"><Globe2 size={16} /> Negara (Wilayah)</h3><CountryList countries={data.countries?.aigen || []} /></div>
                    <div className="split-col"><h3 className="sub-head"><Search size={16} /> Tampilan di Pencarian</h3><AppearanceList appearances={data.appearances?.aigen || []} /></div>
                  </div><p className="device-foot">Agregat dari Google Search Console.</p>
                </section>
                
                <section className="section-card g-topsearch" style={{ position: 'relative' }}>
                  <SourceBadge source="Google AI Generative" />
                  <div className="section-heading"><div><p className="eyebrow">HALAMAN SERING DICARI (AI GEN)</p><h2>Halaman paling sering muncul</h2></div><button className="link-button" onClick={() => openFull("gscPages", "Semua Halaman Pencarian (AI Gen)", "aigen")}><ExternalLink size={14} /> Lihat semua</button></div><TopSearchPagesList pages={data.topGscPages?.aigen || []} />
                </section>
                
                <section className="section-card g-keywords" style={{ position: 'relative' }}>
                  <SourceBadge source="Google AI Generative" />
                  <div className="section-heading"><div><p className="eyebrow">KATA KUNCI (AI GEN)</p><h2>Kata kunci teratas</h2></div><button className="link-button" onClick={() => openFull("queries", "Semua Kata Kunci (AI Gen)", "aigen")}><ExternalLink size={14} /> Lihat semua</button></div>{(data.topQueries?.aigen || []).length ? <TopQueryList queries={data.topQueries.aigen} /> : <p className="empty-note">Belum ada data kata kunci.</p>}
                </section>
              </div>
            </>
          ) : <div className="no-data-block"><FolderOpen /> Belum ada data Google AI Generative (SGE).</div>}
          </div>
          
        </>}
      </main>

      {!isPublic && <nav className="mobile-bottom-nav"><button><Home/><span>Ringkasan</span></button>{isAdmin && <button onClick={() => setUploadModal(true)}><Upload/><span>Upload</span></button>}<button onClick={shareReport}><Share2/><span>Bagikan</span></button>{isAdmin && <button onClick={() => setWebsiteModal(true)}><Globe2/><span>Website</span></button>}</nav>}

        {websiteModal && <WebsiteModal open={websiteModal} clients={clients} onClose={() => setWebsiteModal(false)} onCreated={() => { setWebsiteModal(false); loadWebsites(); }} />}
        {clientModal && <ClientModal open={clientModal} clients={clients} onClose={() => setClientModal(false)} onCreated={() => { fetch("/api/clients").then(r => r.ok ? r.json() : null).then(res => { if (res?.clients) setClients(res.clients); }).catch(() => {}); }} />}
        {uploadModal && <UploadModal open={uploadModal} websiteId={websiteId} onClose={() => setUploadModal(false)} onDone={async (result) => { setUploadModal(false); const totalWarnings=(result.results||[]).reduce((sum:number,r:any)=>sum+(r.warnings?.length||0),0); if(!result.periodId){setMessage(`${result.succeeded} berhasil, ${result.failed} gagal.`);return;} setPeriodId(result.periodId); await loadDashboard(websiteId, result.periodId); setMessage(totalWarnings?`${result.succeeded} report diproses dengan ${totalWarnings} catatan.`:`${result.succeeded} report berhasil diproses.`); }}/>}
        <LogModal open={logModal} onClose={() => setLogModal(false)} />
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
  async function submit(e:FormEvent){
    e.preventDefault();
    if(!files.length||!websiteId)return setError('Pilih website dan minimal satu file terlebih dahulu.');
    setLoading(true);
    setError('');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try{
      const form=new FormData();
      form.set('websiteId',websiteId);
      form.set('isAiGen',String(isAiGen));
      for(const f of files)form.append('file',f);
      
      const response=await fetch('/api/upload',{
        method:'POST',
        headers:{'x-requested-with': 'XMLHttpRequest'},
        body:form,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      let result;
      try{
        result=await response.json();
      }catch(err){
        throw new Error('Server mengembalikan respons yang tidak valid (bukan JSON).');
      }
      setLoading(false);
      if(!response.ok)return setError(result.error||'Upload gagal.');
      setFiles([]);
      setIsAiGen(false);
      onDone(result);
    }catch(err:any){
      clearTimeout(timeoutId);
      setLoading(false);
      if (err.name === 'AbortError') {
        setError('Koneksi terputus atau server tidak merespons (Timeout).');
      } else {
        setError(err.message||'Terjadi kesalahan saat mengunggah.');
      }
    }
  }
  return <Modal open={open} title="Upload report mentah" onClose={onClose}><form className="form-stack" onSubmit={submit}><button type="button" className={`dropzone ${files.length?'selected':''}`} onClick={()=>input.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files);}}><input ref={input} hidden type="file" accept=".xlsx,.csv" multiple onChange={e=>addFiles(e.target.files)}/><Upload/>{files.length?<><b>{files.length} file dipilih</b><span>{files.map(f=>f.name).join(', ').slice(0,90)}</span></>:<><b>Tarik file ke sini</b><span>atau klik untuk memilih XLSX / CSV (bisa lebih dari satu)</span></>}</button><div className="upload-note"><Check/>Sumber & periode terdeteksi otomatis. Untuk ekspor GSC berbentuk beberapa CSV, seret semua file sekaligus.</div><label style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.9rem"}}><input type="checkbox" checked={isAiGen} onChange={e=>setIsAiGen(e.target.checked)}/> Khusus data AI Generative (SGE)</label>{error&&<p className="form-error">{error}</p>}<button className="button primary wide" disabled={loading||!files.length}>{loading?'Memvalidasi dan memproses…':`Proses ${files.length} report`}</button>{files.length>0&&<ul className="file-list" style={{ maxHeight: '35vh', overflowY: 'auto', marginTop: '16px' }}>{files.map((f,i)=><li key={`${f.name}-${i}`}><span className="file-name">{f.name}</span><span className="file-size">{(f.size/1024).toFixed(1)} KB</span><button type="button" className="file-remove" onClick={()=>setFiles(files.filter((_,j)=>j!==i))} aria-label={`Hapus ${f.name}`}><X size={14}/></button></li>)}</ul>}</form></Modal>;
}

function OpportunityCard({number,title,source,children}:{number:string;title:string;source?:string;children:React.ReactNode}){return <article className="opportunity-card" style={{position:'relative'}}>{source && <SourceBadge source={source} />}<header><span>{number}</span><b>{title}</b></header>{children}</article>}
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

function AppearanceList({ appearances }:{ appearances:Array<{ appearance:string; clicks:number; impressions:number; ctr:number; averagePosition:number }> }){
  if(!appearances.length) return <p className="empty-note">Belum ada data tampilan penelusuran.</p>;
  const total=appearances.reduce((sum,a)=>sum+(a.impressions||0),0)||1;
  const max=Math.max(...appearances.map((a)=>a.impressions||0),1);
  return <div className="device-list">{appearances.map((a)=>(
    <div className="device-row" key={a.appearance}>
      <div className="device-head"><b>{a.appearance}</b><span>{fmt.format(a.impressions)} tayangan</span></div>
      <div className="bar"><i style={{width:`${Math.min(100,(a.impressions/max)*100)}%`}}/></div>
      <div className="device-meta"><span>Klik {fmt.format(a.clicks)}</span><span>CTR {percent(a.ctr,true)}</span><span>Posisi {dec.format(a.averagePosition)}</span></div>
    </div>
  ))}<p className="device-foot">Total tayangan khusus: {fmt.format(total)}</p></div>;
}

function AnalystNotes({ notes }: { notes: Array<any> }) {
  if (!notes || !notes.length) return null;
  return <section className="section-card analyst-notes"><div className="section-heading"><div><p className="eyebrow">CATATAN ANALIS</p><h2>Insight Manual & Temuan Kunci</h2></div></div><div className="notes-list">{notes.map((n, i) => {
    const isObj = typeof n === "object" && n !== null;
    const author = isObj ? (n.author || "Analis") : "Sistem AI";
    const dateStr = isObj && n.created_at ? new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Insight Otomatis";
    const content = isObj ? n.content : n;
    return <article key={i}><div className="note-meta"><b>{author}</b><span>{dateStr}</span></div><div className="note-content" dangerouslySetInnerHTML={{ __html: content }} /></article>;
  })}</div></section>;
}

function AnomalyList({ anomalies, partial }: { anomalies: Array<{ severity: "critical" | "warning" | "positive"; text: string }>; partial: boolean }) {
  if(!anomalies.length) return null;
  return <section className="section-card anomaly-card" id="anomalies"><div className="section-heading"><div><p className="eyebrow">PERINGATAN & ANOMALI</p><h2>Apa yang perlu diperhatikan segera?</h2></div></div>{partial && <p className="partial-note light"><CircleAlert size={14} /> Bulan ini masih berjalan, sehingga anomali penurunan bisa berubah saat data akhir bulan masuk.</p>}<ul className="anomaly-list">{anomalies.map((a,i)=><li key={i} className={`anomaly-item ${a.severity}`}><span className="anomaly-icon">{a.severity==="critical"?<CircleAlert/>:a.severity==="warning"?<TrendingDown/>:<TrendingUp/>}</span><p>{a.text}</p></li>)}</ul></section>;
}

function SourceBadge({ source }: { source: string }) {
  if (!source) return null;
  return (
    <span
      className="source-badge"
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "4px 8px",
        borderRadius: "6px",
        backgroundColor: "#f4f7fb",
        color: "#667085",
        border: "1px solid #eaecf0",
        zIndex: 2,
        boxShadow: "0 1px 2px rgba(16,24,40,0.05)"
      }}
    >
      {source}
    </span>
  );
}

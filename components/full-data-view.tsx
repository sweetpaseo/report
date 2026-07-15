"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "./data-table";
import { ExternalLink, CircleAlert } from "lucide-react";

type QueryRow = { query: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type GscPageRow = { page: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type PageRow = { title: string; views: number };
type DimensionRow = { name: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type EventRow = { name: string; count: number; keyCount: number };
type ChannelRow = { channel: string; sessions: number; newUsers: number };

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
};

export function FullDataView({ token }: { token: string }) {
  const [data, setData] = useState<FullData | null>(null);
  const [periodId, setPeriodId] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(targetPeriod = periodId): Promise<void> {
    setLoading(true);
    const response = await fetch(`/api/public/report-data/${token}${targetPeriod ? `?periodId=${targetPeriod}` : ""}`, { cache: "no-store" });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return;
    setData(result);
    if (result.selected?.id && result.selected.id !== periodId) setPeriodId(result.selected.id);
  }

  useEffect(() => { load(); }, []);

  if (loading && !data) return <div className="loading-screen"><div className="loader" /><p>Menyiapkan data…</p></div>;
  if (!data) return <div className="full-data"><p>Laporan tidak ditemukan.</p></div>;

  const COLS: Record<string, Column<any>[]> = {
    queries: [
      { key: "query", label: "Kata kunci", value: (r: QueryRow) => r.query },
      { key: "impr", label: "Tayangan", value: (r: QueryRow) => r.impressions, align: "right" },
      { key: "clicks", label: "Klik", value: (r: QueryRow) => r.clicks, align: "right" },
      { key: "ctr", label: "CTR", value: (r: QueryRow) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: QueryRow) => String((r.ctr * 100).toFixed(2)) },
      { key: "pos", label: "Posisi", value: (r: QueryRow) => r.averagePosition.toFixed(1), align: "right" },
    ],
    gscPages: [
      { key: "page", label: "Halaman", value: (r: GscPageRow) => r.page },
      { key: "impr", label: "Tayangan", value: (r: GscPageRow) => r.impressions, align: "right" },
      { key: "clicks", label: "Klik", value: (r: GscPageRow) => r.clicks, align: "right" },
      { key: "ctr", label: "CTR", value: (r: GscPageRow) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: GscPageRow) => String((r.ctr * 100).toFixed(2)) },
      { key: "pos", label: "Posisi", value: (r: GscPageRow) => r.averagePosition.toFixed(1), align: "right" },
    ],
    pages: [
      { key: "title", label: "Halaman", value: (r: PageRow) => r.title },
      { key: "views", label: "Views", value: (r: PageRow) => r.views, align: "right" },
    ],
    devices: [
      { key: "name", label: "Perangkat", value: (r: DimensionRow) => r.name },
      { key: "impr", label: "Tayangan", value: (r: DimensionRow) => r.impressions, align: "right" },
      { key: "clicks", label: "Klik", value: (r: DimensionRow) => r.clicks, align: "right" },
      { key: "ctr", label: "CTR", value: (r: DimensionRow) => `${(r.ctr * 100).toFixed(2)}%`, csv: (r: DimensionRow) => String((r.ctr * 100).toFixed(2)) },
      { key: "pos", label: "Posisi", value: (r: DimensionRow) => r.averagePosition.toFixed(1), align: "right" },
    ],
    countries: [
      { key: "name", label: "Negara", value: (r: DimensionRow) => r.name },
      { key: "impr", label: "Tayangan", value: (r: DimensionRow) => r.impressions, align: "right" },
      { key: "clicks", label: "Klik", value: (r: DimensionRow) => r.clicks, align: "right" },
    ],
    appearances: [
      { key: "name", label: "Tampilan", value: (r: DimensionRow) => r.name },
      { key: "impr", label: "Tayangan", value: (r: DimensionRow) => r.impressions, align: "right" },
      { key: "clicks", label: "Klik", value: (r: DimensionRow) => r.clicks, align: "right" },
    ],
    events: [
      { key: "name", label: "Event", value: (r: EventRow) => r.name },
      { key: "count", label: "Jumlah", value: (r: EventRow) => r.count, align: "right" },
      { key: "key", label: "Key Event", value: (r: EventRow) => r.keyCount, align: "right" },
    ],
    channels: [
      { key: "channel", label: "Channel", value: (r: ChannelRow) => r.channel },
      { key: "sessions", label: "Sessions", value: (r: ChannelRow) => r.sessions, align: "right" },
      { key: "newUsers", label: "Pengunjung Baru", value: (r: ChannelRow) => r.newUsers, align: "right" },
    ],
  };

  const domain = data.website?.domain ?? "laporan";
  const filenameBase = `${domain}-data-lengkap`;

  return (
    <div className="full-data">
      <header className="full-data-head">
        <div>
          <p className="eyebrow">DATA LENGKAP</p>
          <h1>{data.website?.name ?? "Laporan"} · {domain}</h1>
        </div>
        <a className="button secondary" href={`/report/${token}`}><ExternalLink size={16} /> Lihat laporan</a>
      </header>
      {data.periods?.length > 0 && (
        <div className="public-period">
          <span>Periode</span>
          <select value={periodId} onChange={(event) => { const value = event.target.value; setPeriodId(value); load(value); }}>
            {data.periods.map((p) => <option key={p.id} value={p.id}>{p.period_label}</option>)}
          </select>
        </div>
      )}
      {data.isPartialMonth && <p className="partial-note"><CircleAlert size={14} /> Periode ini masih berjalan, angka belum lengkap.</p>}
      {data.empty ? <p className="empty-note">Belum ada data untuk periode ini.</p> : (
        <>
          <section className="full-data-section"><h2>Kata Kunci (Google)</h2><DataTable columns={COLS.queries} rows={data.queries || []} filename={`${filenameBase}-kata-kunci.csv`} /></section>
          <section className="full-data-section"><h2>Halaman Paling Sering Dicari</h2><DataTable columns={COLS.gscPages} rows={data.gscPages || []} filename={`${filenameBase}-halaman-pencarian.csv`} /></section>
          <section className="full-data-section"><h2>Halaman Terpopuler</h2><DataTable columns={COLS.pages} rows={data.pages || []} filename={`${filenameBase}-halaman-terpopuler.csv`} /></section>
          <section className="full-data-section"><h2>Perangkat</h2><DataTable columns={COLS.devices} rows={data.devices || []} filename={`${filenameBase}-perangkat.csv`} /></section>
          <section className="full-data-section"><h2>Negara</h2><DataTable columns={COLS.countries} rows={data.countries || []} filename={`${filenameBase}-negara.csv`} /></section>
          <section className="full-data-section"><h2>Tampilan Penelusuran</h2><DataTable columns={COLS.appearances} rows={data.appearances || []} filename={`${filenameBase}-tampilan.csv`} /></section>
          <section className="full-data-section"><h2>Event</h2><DataTable columns={COLS.events} rows={data.events || []} filename={`${filenameBase}-event.csv`} /></section>
          <section className="full-data-section"><h2>Channel</h2><DataTable columns={COLS.channels} rows={data.channels || []} filename={`${filenameBase}-channel.csv`} /></section>
        </>
      )}
    </div>
  );
}

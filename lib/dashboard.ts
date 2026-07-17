import type { DatabaseSync } from "node:sqlite";

type MetricRow = { source_type: string; metric_key: string; metric_value: number | null };
type PeriodRow = { id: string; period_start: string; period_end: string; period_label: string };

const MAX_TREND_MONTHS = 12;
const ANOMALY_DROP_THRESHOLD = 10;

type Anomaly = { severity: "critical" | "warning" | "positive"; text: string };

type MonthlyPoint = {
  periodStart: string;
  periodLabel: string;
  metrics: Record<string, number>;
};

function metricMap(rows: MetricRow[]) {
  const result: Record<string, number> = {};
  for (const row of rows) result[`${row.source_type}.${row.metric_key}`] = Number(row.metric_value || 0);
  return result;
}

function change(current: number, previous: number) {
  const absolute = current - previous;
  return { current, previous, absolute, percent: previous ? (absolute / previous) * 100 : null };
}

function shortLabel(value: string): string {
  try {
    const path = new URL(value).pathname;
    if (path === "/") return "Homepage";
    const last = path.split("/").filter(Boolean).pop() || "Homepage";
    return last.length > 24 ? `${last.slice(0, 24)}…` : last;
  } catch {
    return value.length > 24 ? `${value.slice(0, 24)}…` : value;
  }
}

type DimensionRow = { name: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type QueryRow = { query: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type CityRow = { city: string; activeUsers: number };
type DeviceModelRow = { model: string; activeUsers: number };

function getGscPeriod(db: DatabaseSync, websiteId: string, selectedId: string, table: string) {
  const has = db.prepare(`SELECT 1 FROM ${table} WHERE website_id = ? AND report_period_id = ? LIMIT 1`).get(websiteId, selectedId);
  if (has) return selectedId;
  const fb = db.prepare(`SELECT t.report_period_id FROM ${table} t JOIN report_periods rp ON rp.id = t.report_period_id WHERE t.website_id = ? ORDER BY rp.period_start DESC LIMIT 1`).get(websiteId) as { report_period_id: string } | undefined;
  return fb?.report_period_id || selectedId;
}

function dimensionRows(
  db: DatabaseSync,
  websiteId: string,
  selectedId: string,
  table: string,
  column: string,
  searchType: "web" | "aigen" = "web"
): DimensionRow[] {
  const periodId = getGscPeriod(db, websiteId, selectedId, table);
  return db.prepare(
    `SELECT ${column} AS name, clicks, impressions, ctr, average_position AS averagePosition FROM ${table} WHERE website_id = ? AND report_period_id = ? AND search_type = ? ORDER BY impressions DESC`,
  ).all(websiteId, periodId, searchType) as DimensionRow[];
}

type PeriodContext = { periods: PeriodRow[]; selected: PeriodRow; previous?: PeriodRow; isPartialMonth: boolean };

function resolvePeriodContext(db: DatabaseSync, websiteId: string, requestedPeriodId?: string): PeriodContext | null {
  const periods = db.prepare(`
    SELECT DISTINCT rp.id, rp.period_start, rp.period_end, rp.period_label
    FROM report_periods rp
    JOIN monthly_metrics mm ON mm.report_period_id = rp.id
    WHERE rp.website_id = ?
    ORDER BY rp.period_start DESC
  `).all(websiteId) as PeriodRow[];
  if (!periods.length) return null;
  const selected = periods.find((period) => period.id === requestedPeriodId) || periods[0];
  const selectedIndex = periods.findIndex((period) => period.id === selected.id);
  const previous = selectedIndex >= 0 ? periods[selectedIndex + 1] : undefined;
  const periodEnd = new Date(selected.period_end);
  const isPartialMonth = !Number.isNaN(periodEnd.getTime()) && periodEnd > new Date();
  return { periods, selected, previous, isPartialMonth };
}

export function getDashboard(db: DatabaseSync, websiteId: string, requestedPeriodId?: string, searchType: "web" | "aigen" = "web") {
  const website = db.prepare("SELECT * FROM websites WHERE id = ?").get(websiteId) as Record<string, string> | undefined;
  if (!website) return null;

  const ctx = resolvePeriodContext(db, websiteId, requestedPeriodId);
  if (!ctx) return { website, periods: [], empty: true };
  const { periods, selected, previous, isPartialMonth } = ctx;

  const monthlyRows = db.prepare(`
    SELECT rp.period_start, rp.period_label, mm.source_type, mm.metric_key, mm.metric_value
    FROM monthly_metrics mm
    JOIN report_periods rp ON rp.id = mm.report_period_id
    WHERE rp.website_id = ?
  `).all(websiteId) as Array<{ period_start: string; period_label: string; source_type: string; metric_key: string; metric_value: number | null }>;
  const monthlyByPeriod = new Map<string, MonthlyPoint>();
  for (const row of monthlyRows) {
    if (!monthlyByPeriod.has(row.period_start)) {
      monthlyByPeriod.set(row.period_start, { periodStart: row.period_start, periodLabel: row.period_label, metrics: {} });
    }
    monthlyByPeriod.get(row.period_start)!.metrics[`${row.source_type}.${row.metric_key}`] = Number(row.metric_value || 0);
  }
  const monthlySeries = [...monthlyByPeriod.values()]
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .slice(-MAX_TREND_MONTHS);
  const currentMetrics = metricMap(db.prepare("SELECT source_type, metric_key, metric_value FROM monthly_metrics WHERE website_id = ? AND report_period_id = ?").all(websiteId, selected.id) as MetricRow[]);
  const previousMetrics = previous
    ? metricMap(db.prepare("SELECT source_type, metric_key, metric_value FROM monthly_metrics WHERE website_id = ? AND report_period_id = ?").all(websiteId, previous.id) as MetricRow[])
    : {};

  const src = searchType === "aigen" ? "gsc-aigen" : "gsc";
  const keys = [
    `${src}.impressions`, `${src}.clicks`, `${src}.ctr`, `${src}.average_position`,
    "ga.sessions", "ga.active_users", "ga.new_users", "ga.page_views", "ga.pages_per_session",
    "ga.average_engagement_seconds", "ga.click_to_chat", "ga.chat_conversion_rate", "ga.revenue",
  ];
  const comparisons = Object.fromEntries(keys.map((key) => [key, change(currentMetrics[key] || 0, previousMetrics[key] || 0)]));

  const gscTrend = db.prepare(`
    SELECT metric_date AS date, clicks, impressions, ctr, average_position AS averagePosition
    FROM gsc_daily_metrics WHERE website_id = ? AND report_period_id = ? AND search_type = ? ORDER BY metric_date
  `).all(websiteId, selected.id, searchType);
  const gaTrend = db.prepare(`
    SELECT metric_date AS date, active_users AS activeUsers, new_users AS newUsers, engagement_seconds AS engagementSeconds
    FROM ga_daily_metrics WHERE website_id = ? AND report_period_id = ? ORDER BY metric_date
  `).all(websiteId, selected.id);
  const channels = db.prepare(`
    SELECT channel, sessions, new_users AS newUsers FROM ga_channels
    WHERE website_id = ? AND report_period_id = ? ORDER BY sessions DESC LIMIT 8
  `).all(websiteId, selected.id);
  const queryPeriodId = getGscPeriod(db, websiteId, selected.id, "gsc_queries");
  const opportunities = db.prepare(`
    SELECT query, clicks, impressions, ctr, average_position AS averagePosition
    FROM gsc_queries
    WHERE website_id = ? AND report_period_id = ? AND search_type = ?
      AND average_position BETWEEN 4 AND 10 AND impressions >= 10 AND ctr <= 0.05
    ORDER BY impressions DESC LIMIT 6
  `).all(websiteId, queryPeriodId, searchType);
  const topQueries = db.prepare(`
    SELECT query, clicks, impressions, ctr, average_position AS averagePosition
    FROM gsc_queries WHERE website_id = ? AND report_period_id = ? AND search_type = ?
    ORDER BY impressions DESC LIMIT 10
  `).all(websiteId, queryPeriodId, searchType) as QueryRow[];
  const devices = dimensionRows(db, websiteId, selected.id, "gsc_devices", "device", searchType).map((row) => ({ device: row.name, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, averagePosition: row.averagePosition }));
  const topGscPages = dimensionRows(db, websiteId, selected.id, "gsc_pages", "page", searchType)
    .map((row) => ({ page: row.name, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);
  const countries = dimensionRows(db, websiteId, selected.id, "gsc_countries", "country", searchType);
  const appearances = dimensionRows(db, websiteId, selected.id, "gsc_appearance", "appearance", searchType);
  const topPages = db.prepare(`
    SELECT page_title AS title, views FROM ga_pages
    WHERE website_id = ? AND report_period_id = ? ORDER BY views DESC LIMIT 10
  `).all(websiteId, selected.id) as Array<{ title: string; views: number }>;
  const events = db.prepare(`
    SELECT event_name AS name, event_count AS count, key_event_count AS keyCount
    FROM ga_events WHERE website_id = ? AND report_period_id = ? ORDER BY event_count DESC LIMIT 10
  `).all(websiteId, selected.id) as Array<{ name: string; count: number; keyCount: number }>;
  const topCities = db.prepare(`
    SELECT city, active_users AS activeUsers FROM ga_cities
    WHERE website_id = ? AND report_period_id = ? ORDER BY active_users DESC LIMIT 12
  `).all(websiteId, selected.id) as CityRow[];
  const deviceModels = db.prepare(`
    SELECT model, active_users AS activeUsers FROM ga_device_models
    WHERE website_id = ? AND report_period_id = ? ORDER BY active_users DESC LIMIT 12
  `).all(websiteId, selected.id) as DeviceModelRow[];

  const impressionsChange = comparisons[`${src}.impressions`].percent;
  const sessionsChange = comparisons["ga.sessions"].percent;
  const chatChange = comparisons["ga.click_to_chat"].percent;
  const hasGsc = (currentMetrics[`${src}.impressions`] || 0) > 0;
  const hasGa = (currentMetrics["ga.sessions"] || 0) > 0;
  const positiveSignals = [impressionsChange, sessionsChange, chatChange].filter((value) => value !== null && value > 0).length;
  const status = !hasGsc && !hasGa ? "DATA BELUM LENGKAP" : positiveSignals >= 2 ? "BERTUMBUH" : positiveSignals === 0 ? "PERLU PERHATIAN" : "STABIL";

  const anomalies: Anomaly[] = [];
  const pushMonthDrop = (label: string, drop: number | null, reason: string) => {
    if (drop === null || drop > -ANOMALY_DROP_THRESHOLD) return;
    anomalies.push({ severity: "critical", text: `${label} anjlok ${Math.abs(drop).toFixed(1)}% dibanding bulan lalu — ${reason}.` });
  };
  pushMonthDrop("Tayangan Google", impressionsChange, "visibilitas organik melemah");
  pushMonthDrop("Klik organik", comparisons[`${src}.clicks`]?.percent ?? null, "traffic pencarian menurun");
  pushMonthDrop("Sesi website", sessionsChange, "jumlah pengunjung menurun");
  
  const ctrComp = comparisons[`${src}.ctr`];
  if (ctrComp && ctrComp.percent !== null && ctrComp.percent <= -20) {
    anomalies.push({ severity: "warning", text: `CTR Google turun ${Math.abs(ctrComp.percent).toFixed(1)}% — judul dan meta description kurang mengundang klik.` });
  }
  
  const posComp = comparisons[`${src}.average_position`];
  if (posComp && posComp.percent !== null && posComp.percent >= 10) {
    anomalies.push({ severity: "warning", text: `Posisi rata-rata memburuk ${posComp.percent.toFixed(1)}% — halaman kehilangan peringkat.` });
  }

  const dailyRows = (gscTrend as Array<{ date: string; impressions: number }>)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  if (dailyRows.length >= 14) {
    const sumImpressions = (rows: typeof dailyRows) => rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
    const recent = sumImpressions(dailyRows.slice(-7));
    const prior = sumImpressions(dailyRows.slice(-14, -7));
    if (prior > 0) {
      const shift = ((recent - prior) / prior) * 100;
      if (shift <= -ANOMALY_DROP_THRESHOLD) {
        anomalies.push({ severity: "warning", text: `Tayangan 7 hari terakhir anjlok ${Math.abs(shift).toFixed(1)}% dibanding 7 hari sebelumnya — sinyal penurunan baru.` });
      } else if (shift >= ANOMALY_DROP_THRESHOLD) {
        anomalies.push({ severity: "positive", text: `Tayangan 7 hari terakhir naik ${shift.toFixed(1)}% dibanding 7 hari sebelumnya — momentum positif baru.` });
      }
    }
  }

  const homepage = topGscPages.find((row) => {
    try { return new URL(row.page).pathname === "/"; } catch { return false; }
  });
  const homepageShare = currentMetrics[`${src}.clicks`] ? ((homepage?.clicks || 0) / currentMetrics[`${src}.clicks`]) * 100 : 0;
  const organicSessions = (channels as Array<{ channel: string; sessions: number }>).find((row) => /organic/i.test(row.channel))?.sessions || 0;
  const paidSessions = (channels as Array<{ channel: string; sessions: number }>).find((row) => /paid/i.test(row.channel))?.sessions || 0;
  const sessions = currentMetrics["ga.sessions"] || 0;

  const insights = [
    impressionsChange !== null && impressionsChange > 10 ? `Tayangan Google naik ${impressionsChange.toFixed(1)}%. Website semakin sering ditemukan.` : null,
    ctrComp && ctrComp.absolute !== null && ctrComp.absolute < 0 ? `CTR Google turun ${Math.abs(ctrComp.absolute * 100).toFixed(2)} poin. Judul dan deskripsi perlu diperkuat.` : null,
    sessions && organicSessions ? `Organic Search menyumbang ${((organicSessions / sessions) * 100).toFixed(1)}% dari sesi.` : null,
    homepageShare > 50 ? `${homepageShare.toFixed(1)}% klik organik masih menuju homepage. Distribusi ke halaman layanan perlu ditingkatkan.` : null,
    sessions && paidSessions / sessions > 0.5 ? `Traffic berbayar masih dominan sebesar ${((paidSessions / sessions) * 100).toFixed(1)}% sesi.` : null,
  ].filter(Boolean);

  const analystNotes: string[] = [];
  if (impressionsChange !== null && Math.abs(impressionsChange) >= 5) {
    const dir = impressionsChange > 0 ? "meningkat" : "menurun";
    analystNotes.push(`Tayangan di Google ${dir} ${Math.abs(impressionsChange).toFixed(1)}% dibanding periode sebelumnya. ${impressionsChange > 0 ? "Momentum visibilitas ini positif dan layak dipertahankan dengan rutin memublikasikan konten berkualitas yang relevan dengan audiens." : "Penurunan ini perlu segera diselidiki — periksa halaman yang kehilangan peringkat dan pantau pergerakan kompetitor pada kata kunci inti."}`);
  }
  if (devices.length) {
    const totalImp = devices.reduce((sum, d) => sum + (d.impressions || 0), 0);
    if (totalImp > 0) {
      const sorted = [...devices].sort((a, b) => (b.impressions || 0) - (a.impressions || 0));
      const top = sorted[0];
      const share = (top.impressions / totalImp) * 100;
      if (share >= 50) {
        analystNotes.push(`Perangkat ${top.device} mendominasi dengan ${share.toFixed(0)}% dari total tayangan (${top.impressions.toLocaleString("id-ID")}). Audiens praktis bergantung pada perangkat tersebut — pastikan kecepatan muat dan pengalaman pengguna di sana sudah optimal karena hampir seluruh traffic bergantung padanya.`);
      }
    }
  }
  if (countries.length) {
    const totalImp = countries.reduce((sum, c) => sum + (c.impressions || 0), 0);
    if (totalImp > 0) {
      const sorted = [...countries].sort((a, b) => (b.impressions || 0) - (a.impressions || 0));
      const top = sorted[0];
      const share = (top.impressions / totalImp) * 100;
      if (share >= 40) {
        analystNotes.push(`Audiens organik terkonsentrasi di ${top.name} (${share.toFixed(0)}% dari total tayangan). Ekspansi ke wilayah atau pasar lain dapat memperluas jangkauan trafik.`);
      }
    }
  }
  if (topGscPages.length) {
    const totalClicks = currentMetrics[`${src}.clicks`] || 0;
    const top = topGscPages[0];
    if (totalClicks > 0 && top.clicks / totalClicks > 0.4) {
      analystNotes.push(`Traffic organik terkonsentrasi pada satu halaman ("${shortLabel(top.page)}" menyumbang ${(top.clicks / totalClicks * 100).toFixed(0)}% dari seluruh klik). Ini menjadi titik rentan: bila halaman ini turun peringkat, trafik ikut anjlok. Sebarkan otoritas dengan internal link dan konten pendukung.`);
    }
  }
  const avgPos = currentMetrics[`${src}.average_position`] || 0;
  const ctr = currentMetrics[`${src}.ctr`] || 0;
  if (avgPos > 5 && ctr < 0.05) {
    analystNotes.push(`Posisi rata-rata berada di ${avgPos.toFixed(1)} namun CTR hanya ${(ctr * 100).toFixed(2)}%. Artinya halaman sudah muncul di halaman pertama, namun judul dan meta description belum cukup mengundang klik. Optimasi snippet berpotensi menaikkan trafik tanpa harus naik peringkat.`);
  }
  if (analystNotes.length === 0) {
    analystNotes.push("Secara keseluruhan metrik utama relatif stabil untuk periode ini. Lanjutkan pemantauan bulanan agar tren dapat terdeteksi lebih awal dan keputusan dipimpin oleh data.");
  }

  const dataQuality = [
    { label: "Google Search Console", status: hasGsc ? "ok" : "missing", detail: hasGsc ? "Data tersedia dan terbaca." : "Belum ada data GSC." },
    { label: "Google Analytics", status: hasGa ? "ok" : "missing", detail: hasGa ? "Data tersedia dan terbaca." : "Belum ada data GA." },
    { label: "Key Event GA4", status: events.some((event) => event.keyCount > 0) ? "ok" : "warning", detail: events.some((event) => event.keyCount > 0) ? "Key event terdeteksi." : "Belum ada key event pada report." },
    { label: "Tracking Pendapatan", status: currentMetrics["ga.revenue"] > 0 ? "ok" : "warning", detail: currentMetrics["ga.revenue"] > 0 ? "Pendapatan terdeteksi." : "Belum menghasilkan data." },
  ];

  return {
    website,
    periods,
    selected,
    previous,
    isPartialMonth,
    metrics: currentMetrics,
    comparisons,
    monthlySeries,
    trends: { gsc: gscTrend, ga: gaTrend },
    channels,
    opportunities,
    topQueries,
    topGscPages,
    devices,
    countries,
    appearances,
    topPages,
    events,
    topCities,
    deviceModels,
    analystNotes,
    status,
    anomalies,
    insights,
    dataQuality,
    empty: false,
  };
}

type FullQueryRow = { query: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type FullGscPageRow = { page: string; clicks: number; impressions: number; ctr: number; averagePosition: number };
type FullPageRow = { title: string; views: number };
type FullEventRow = { name: string; count: number; keyCount: number };
type FullChannelRow = { channel: string; sessions: number; newUsers: number };

const FULL_DATA_LIMIT = 300;

export type FullReportData = {
  website: Record<string, string> | undefined;
  periods: PeriodRow[];
  selected?: PeriodRow;
  previous?: PeriodRow;
  isPartialMonth?: boolean;
  selectedPeriod?: PeriodRow;
  queries?: FullQueryRow[];
  gscPages?: FullGscPageRow[];
  pages?: FullPageRow[];
  devices?: DimensionRow[];
  countries?: DimensionRow[];
  appearances?: DimensionRow[];
  events?: FullEventRow[];
  channels?: FullChannelRow[];
  cities?: CityRow[];
  deviceModels?: DeviceModelRow[];
  empty?: boolean;
};

export function getFullReportData(
  db: DatabaseSync,
  websiteId: string,
  requestedPeriodId?: string,
  searchType: "web" | "aigen" = "web"
): FullReportData | null {
  const website = db.prepare("SELECT * FROM websites WHERE id = ?").get(websiteId) as Record<string, string> | undefined;
  if (!website) return null;
  const ctx = resolvePeriodContext(db, websiteId, requestedPeriodId);
  if (!ctx) return { website, periods: [], empty: true };
  const { periods, selected, previous, isPartialMonth } = ctx;
  const queryPeriodId = getGscPeriod(db, websiteId, selected.id, "gsc_queries");
  const queries = db.prepare(`
    SELECT query, clicks, impressions, ctr, average_position AS averagePosition
    FROM gsc_queries WHERE website_id = ? AND report_period_id = ? AND search_type = ? ORDER BY impressions DESC LIMIT ?
  `).all(websiteId, queryPeriodId, searchType, FULL_DATA_LIMIT) as FullQueryRow[];
  const pagePeriodId = getGscPeriod(db, websiteId, selected.id, "gsc_pages");
  const gscPages = db.prepare(`
    SELECT page, clicks, impressions, ctr, average_position AS averagePosition
    FROM gsc_pages WHERE website_id = ? AND report_period_id = ? AND search_type = ? ORDER BY impressions DESC LIMIT ?
  `).all(websiteId, pagePeriodId, searchType, FULL_DATA_LIMIT) as FullGscPageRow[];
  const pages = db.prepare(`
    SELECT page_title AS title, views FROM ga_pages WHERE website_id = ? AND report_period_id = ? ORDER BY views DESC LIMIT ?
  `).all(websiteId, selected.id, FULL_DATA_LIMIT) as FullPageRow[];
  const devices = dimensionRows(db, websiteId, selected.id, "gsc_devices", "device", searchType);
  const countries = dimensionRows(db, websiteId, selected.id, "gsc_countries", "country", searchType);
  const appearances = dimensionRows(db, websiteId, selected.id, "gsc_appearance", "appearance", searchType);
  const events = db.prepare(`
    SELECT event_name AS name, event_count AS count, key_event_count AS keyCount
    FROM ga_events WHERE website_id = ? AND report_period_id = ? ORDER BY event_count DESC LIMIT ?
  `).all(websiteId, selected.id, FULL_DATA_LIMIT) as FullEventRow[];
  const channels = db.prepare(`
    SELECT channel, sessions, new_users AS newUsers FROM ga_channels
    WHERE website_id = ? AND report_period_id = ? ORDER BY sessions DESC LIMIT ?
  `).all(websiteId, selected.id, FULL_DATA_LIMIT) as FullChannelRow[];
  const cities = db.prepare(`
    SELECT city, active_users AS activeUsers FROM ga_cities
    WHERE website_id = ? AND report_period_id = ? ORDER BY active_users DESC LIMIT ?
  `).all(websiteId, selected.id, FULL_DATA_LIMIT) as CityRow[];
  const deviceModels = db.prepare(`
    SELECT model, active_users AS activeUsers FROM ga_device_models
    WHERE website_id = ? AND report_period_id = ? ORDER BY active_users DESC LIMIT ?
  `).all(websiteId, selected.id, FULL_DATA_LIMIT) as DeviceModelRow[];
  return { website, periods, selected, previous, isPartialMonth, selectedPeriod: selected, queries, gscPages, pages, devices, countries, appearances, events, channels, cities, deviceModels, empty: false };
}

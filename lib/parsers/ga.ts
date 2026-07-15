import { parse } from "csv-parse/sync";
import type { DailyGa, ParsedReport } from "./types";
import { addDays, isoDate, numberValue } from "./utils";

type Section = { header: string[]; rows: string[][] };

function sections(rows: string[][]): Section[] {
  const result: Section[] = [];
  let index = 0;
  while (index < rows.length) {
    const row = rows[index] || [];
    const first = String(row[0] || "").trim();
    if (!first || first.startsWith("#")) {
      index += 1;
      continue;
    }
    const header = row.map((cell) => String(cell || "").trim());
    const body: string[][] = [];
    index += 1;
    while (index < rows.length) {
      const candidate = rows[index] || [];
      const candidateFirst = String(candidate[0] || "").trim();
      if (!candidateFirst || candidateFirst.startsWith("#")) break;
      body.push(candidate.map((cell) => String(cell || "").trim()));
      index += 1;
    }
    result.push({ header, rows: body });
  }
  return result;
}

export function parseGa(buffer: Buffer): ParsedReport {
  const text = buffer.toString("utf8").replace(/^\uFEFF/, "");
  const rows = parse(text, { relax_column_count: true, skip_empty_lines: false }) as string[][];
  const startRaw = text.match(/# Tanggal mulai:\s*(\d{8})/i)?.[1];
  const endRaw = text.match(/# Tanggal akhir:\s*(\d{8})/i)?.[1];
  const property = text.match(/# Properti:\s*(.+)/i)?.[1]?.trim();
  const periodStart = isoDate(startRaw);
  const periodEnd = isoDate(endRaw);
  if (!periodStart || !periodEnd) throw new Error("Periode GA tidak ditemukan di metadata CSV.");

  const dailyMap = new Map<string, DailyGa>();
  const channelMap = new Map<string, { channel: string; sessions: number; newUsers: number }>();
  const pageRows: Array<{ title: string; views: number }> = [];
  const eventMap = new Map<string, { name: string; count: number; keyCount: number }>();
  const warnings: string[] = [];

  for (const section of sections(rows)) {
    const first = section.header[0]?.toLowerCase() || "";
    const second = section.header[1]?.toLowerCase() || "";

    if (first === "hari ke-n") {
      for (const row of section.rows) {
        const offset = Number.parseInt(row[0], 10);
        if (!Number.isFinite(offset)) continue;
        const date = addDays(periodStart, offset);
        const item = dailyMap.get(date) || { date };
        if (second.includes("engagement")) item.engagementSeconds = numberValue(row[1]);
        else if (second.includes("pengguna baru")) item.newUsers = numberValue(row[1]);
        else if (second.includes("pengguna aktif")) item.activeUsers = numberValue(row[1]);
        else if (second.includes("pendapatan")) item.revenue = numberValue(row[1]);
        dailyMap.set(date, item);
      }
      continue;
    }

    if (first.includes("grup saluran utama sesi") && second === "sesi") {
      for (const row of section.rows) {
        const channel = row[0] || "Tidak diketahui";
        const current = channelMap.get(channel) || { channel, sessions: 0, newUsers: 0 };
        current.sessions += numberValue(row[1]);
        channelMap.set(channel, current);
      }
      continue;
    }

    if (first.includes("grup saluran utama pengguna pertama") && second.includes("pengguna baru")) {
      for (const row of section.rows) {
        const channel = row[0] || "Tidak diketahui";
        const current = channelMap.get(channel) || { channel, sessions: 0, newUsers: 0 };
        current.newUsers += numberValue(row[1]);
        channelMap.set(channel, current);
      }
      continue;
    }

    if (first.includes("judul halaman") && second.includes("tampilan")) {
      for (const row of section.rows) {
        if (row[0]) pageRows.push({ title: row[0], views: numberValue(row[1]) });
      }
      continue;
    }

    if (first === "nama peristiwa" && second.includes("jumlah peristiwa")) {
      for (const row of section.rows) {
        const name = row[0];
        if (!name) continue;
        const item = eventMap.get(name) || { name, count: 0, keyCount: 0 };
        item.count += numberValue(row[1]);
        eventMap.set(name, item);
      }
      continue;
    }

    if (first === "nama peristiwa" && second.includes("peristiwa utama")) {
      for (const row of section.rows) {
        const name = row[0];
        if (!name) continue;
        const item = eventMap.get(name) || { name, count: 0, keyCount: 0 };
        item.keyCount += numberValue(row[1]);
        eventMap.set(name, item);
      }
    }
  }

  const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const channels = Array.from(channelMap.values()).sort((a, b) => b.sessions - a.sessions);
  const events = Array.from(eventMap.values()).sort((a, b) => b.count - a.count);
  const activeUsers = daily.reduce((sum, row) => sum + (row.activeUsers || 0), 0);
  const newUsers = daily.reduce((sum, row) => sum + (row.newUsers || 0), 0);
  const sessions = channels.reduce((sum, row) => sum + row.sessions, 0);
  const pageViews = pageRows.reduce((sum, row) => sum + row.views, 0);
  const revenue = daily.reduce((sum, row) => sum + (row.revenue || 0), 0);
  const engagementRows = daily.filter((row) => row.engagementSeconds !== undefined);
  const averageEngagement = engagementRows.length
    ? engagementRows.reduce((sum, row) => sum + (row.engagementSeconds || 0), 0) / engagementRows.length
    : 0;
  const chatEvents = events
    .filter((event) => /chat|whatsapp|wa_click|click_to_chat/i.test(event.name))
    .reduce((sum, event) => sum + event.count, 0);

  if (!sessions) warnings.push("Tabel sesi tidak memiliki data.");
  if (!events.some((event) => event.keyCount > 0)) warnings.push("Key event belum tercatat pada report GA.");
  if (!revenue) warnings.push("Tracking pendapatan belum menghasilkan data.");

  return {
    source: "ga",
    property,
    periodStart,
    periodEnd,
    warnings,
    metrics: {
      active_users: activeUsers,
      new_users: newUsers,
      sessions,
      page_views: pageViews,
      pages_per_session: sessions ? pageViews / sessions : 0,
      average_engagement_seconds: averageEngagement,
      revenue,
      click_to_chat: chatEvents,
      chat_conversion_rate: sessions ? chatEvents / sessions : 0,
    },
    ga: { daily, channels, pages: pageRows, events },
  };
}

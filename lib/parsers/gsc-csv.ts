import { parse } from "csv-parse/sync";
import type { DailyGsc, GscDimension } from "./types";
import { isoDate, MAX_PARSE_ROWS, numberValue } from "./utils";

export type GscBundle = {
  source: "gsc";
  kind: "csv-bundle";
  periodStart: string;
  periodEnd: string;
  warnings: string[];
  daily: DailyGsc[];
  queries: GscDimension[];
  pages: GscDimension[];
  devices: GscDimension[];
  countries: GscDimension[];
  appearances: GscDimension[];
};

type BundleFile = { name: string; content: string };

function normName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

function detectKind(name: string): "bagan" | "queries" | "pages" | "devices" | "countries" | "appearances" | "ignore" {
  const n = normName(name);
  if (/bagan/.test(n)) return "bagan";
  if (/kueri|query/.test(n)) return "queries";
  if (/halaman|page|url/.test(n)) return "pages";
  if (/negara|countr/.test(n)) return "countries";
  if (/perangkat|device/.test(n)) return "devices";
  if (/tampilan|penelusuran|appearance/.test(n)) return "appearances";
  return "ignore";
}

function toDimension(row: unknown[]): GscDimension {
  return {
    name: String(row[0] ?? "").trim(),
    clicks: numberValue(row[1]),
    impressions: numberValue(row[2]),
    ctr: numberValue(row[3]),
    averagePosition: numberValue(row[4]),
  };
}

function parseRows(file: BundleFile): string[][] {
  const clean = file.content.replace(/^\uFEFF/, "");
  return parse(clean, { relax_column_count: true, skip_empty_lines: true }) as string[][];
}

export function parseGscBundle(files: BundleFile[]): GscBundle {
  const byKind = (kind: ReturnType<typeof detectKind>) => files.find((file) => detectKind(file.name) === kind);

  const bagan =
    byKind("bagan") ??
    files.find((file) => {
      const header = (file.content.split(/\r?\n/)[0] || "").toLowerCase();
      return /tanggal/.test(header) && /klik/.test(header);
    });
  if (!bagan) {
    throw new Error("File Bagan (data harian) tidak ditemukan. Sertakan Bagan.csv dari ekspor Google Search Console.");
  }

  const baganRows = parseRows(bagan).slice(1, 1 + MAX_PARSE_ROWS);
  const daily = baganRows
    .map((row) => ({
      date: isoDate(row[0]) || "",
      clicks: numberValue(row[1]),
      impressions: numberValue(row[2]),
      ctr: numberValue(row[3]),
      averagePosition: numberValue(row[4]),
    }))
    .filter((item) => item.date);
  if (!daily.length) throw new Error("Bagan tidak memiliki data tanggal yang dapat dibaca.");

  const warnings: string[] = [];
  const collect = (kind: ReturnType<typeof detectKind>): GscDimension[] => {
    const file = byKind(kind);
    if (!file) {
      warnings.push(`File ${kind} tidak ditemukan dalam bundle.`);
      return [];
    }
    return parseRows(file).slice(1, 1 + MAX_PARSE_ROWS).map(toDimension).filter((item) => item.name);
  };

  const queries = collect("queries");
  const pages = collect("pages");
  const devices = collect("devices");
  const countries = collect("countries");
  const appearances = collect("appearances");
  if (!countries.length) warnings.push("Negara tidak memiliki data.");
  if (!appearances.length) warnings.push("Tampilan penelusuran tidak memiliki data.");

  return {
    source: "gsc",
    kind: "csv-bundle",
    periodStart: daily[0].date,
    periodEnd: daily[daily.length - 1].date,
    warnings,
    daily,
    queries,
    pages,
    devices,
    countries,
    appearances,
  };
}

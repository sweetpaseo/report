const fs = require('fs');
const crypto = require('crypto');
const { parse } = require('csv-parse/sync');

// Mock files
const files = [
  { name: 'Bagan.csv', content: 'Tanggal,Tayangan,Klik,CTR,Posisi\n2023-01-01,100,10,10%,1\n2023-01-02,200,20,10%,1' },
  { name: 'Filter.csv', content: 'Filter,Tayangan,Klik,CTR,Posisi\nAI,100,10,10%,1' },
  { name: 'Halaman.csv', content: 'Halaman,Tayangan,Klik,CTR,Posisi\n/home,100,10,10%,1' },
  { name: 'Negara.csv', content: 'Negara,Tayangan,Klik,CTR,Posisi\nIndonesia,100,10,10%,1' },
  { name: 'Perangkat.csv', content: 'Perangkat,Tayangan,Klik,CTR,Posisi\nDesktop,100,10,10%,1' }
];

function normName(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

function detectKind(name) {
  const n = normName(name);
  if (/bagan/.test(n)) return "bagan";
  if (/kueri|query/.test(n)) return "queries";
  if (/halaman|page|url/.test(n)) return "pages";
  if (/negara|countr/.test(n)) return "countries";
  if (/perangkat|device/.test(n)) return "devices";
  if (/tampilan|penelusuran|appearance/.test(n)) return "appearances";
  return "ignore";
}

function numberValue(val) {
  if (!val) return 0;
  return Number(val.replace(/[^0-9.-]+/g,""));
}

function isoDate(value) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parts = value.split("/");
  if (parts.length === 3) {
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${year}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
  }
  return null;
}

function findMetric(row, pattern) {
  for (const k of Object.keys(row)) {
    if (pattern.test(k.toLowerCase())) {
      return numberValue(row[k]);
    }
  }
  return 0;
}

function toDimension(row) {
  const keys = Object.keys(row);
  const nameKey = keys[0];
  return {
    name: String(row[nameKey] ?? "").trim(),
    clicks: findMetric(row, /klik|click/i),
    impressions: findMetric(row, /tayangan|impression/i),
    ctr: findMetric(row, /ctr|rkt/i),
    averagePosition: findMetric(row, /posisi|position/i),
  };
}

function parseRows(file) {
  const clean = file.content.replace(/^\uFEFF/, "");
  return parse(clean, { columns: true, relax_column_count: true, skip_empty_lines: true });
}

function parseGscBundle(files) {
  const byKind = (kind) => files.find((file) => detectKind(file.name) === kind);

  const bagan =
    byKind("bagan") ??
    files.find((file) => {
      const header = (file.content.split(/\r?\n/)[0] || "").toLowerCase();
      return /tanggal/.test(header) && /tayangan|impression|klik|click/.test(header);
    });
  if (!bagan) {
    throw new Error("File Bagan (data harian) tidak ditemukan.");
  }

  const baganRows = parseRows(bagan).slice(0, 100);
  const daily = baganRows
    .map((row) => {
      const keys = Object.keys(row);
      const dateKey = keys[0];
      return {
        date: isoDate(row[dateKey]) || "",
        clicks: findMetric(row, /klik|click/i),
        impressions: findMetric(row, /tayangan|impression/i),
        ctr: findMetric(row, /ctr|rkt/i),
        averagePosition: findMetric(row, /posisi|position/i),
      };
    })
    .filter((item) => item.date);
  if (!daily.length) throw new Error("Bagan tidak memiliki data tanggal yang dapat dibaca.");

  const warnings = [];
  const collect = (kind) => {
    const file = byKind(kind);
    if (!file) {
      warnings.push(`File ${kind} tidak ditemukan dalam bundle.`);
      return [];
    }
    return parseRows(file).slice(0, 100).map(toDimension).filter((item) => item.name);
  };

  const queries = collect("queries");
  const pages = collect("pages");
  const devices = collect("devices");
  const countries = collect("countries");
  const appearances = collect("appearances");
  if (!countries.length) warnings.push("Negara tidak memiliki data.");
  if (!appearances.length) warnings.push("Tampilan penelusuran tidak memiliki data.");

  return {
    daily, queries, pages, devices, countries, appearances, warnings
  };
}

try {
  console.log("Starting parse...");
  const bundle = parseGscBundle(files);
  console.log("Success:", bundle.warnings);
} catch (err) {
  console.error("Error:", err);
}

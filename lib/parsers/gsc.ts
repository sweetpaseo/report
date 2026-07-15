import ExcelJS from "exceljs";
import type { GscDimension, ParsedReport } from "./types";
import { isoDate, numberValue } from "./utils";

function rows(sheet?: ExcelJS.Worksheet) {
  if (!sheet) return [] as unknown[][];
  const result: unknown[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    result.push((row.values as unknown[]).slice(1));
  });
  return result;
}

function dimensions(sheet?: ExcelJS.Worksheet): GscDimension[] {
  return rows(sheet).slice(1).map((row) => ({
    name: String(row[0] ?? "").trim(),
    clicks: numberValue(row[1]),
    impressions: numberValue(row[2]),
    ctr: numberValue(row[3]),
    averagePosition: numberValue(row[4]),
  })).filter((item) => item.name);
}

export async function parseGsc(buffer: Buffer): Promise<ParsedReport> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const dailyRows = rows(workbook.getWorksheet("Bagan")).slice(1);
  const daily = dailyRows.map((row) => ({
    date: isoDate(row[0]) || "",
    clicks: numberValue(row[1]),
    impressions: numberValue(row[2]),
    ctr: numberValue(row[3]),
    averagePosition: numberValue(row[4]),
  })).filter((item) => item.date);

  if (!daily.length) throw new Error("Sheet Bagan tidak memiliki data tanggal yang dapat dibaca.");
  daily.sort((a, b) => a.date.localeCompare(b.date));

  const clicks = daily.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = daily.reduce((sum, row) => sum + row.impressions, 0);
  const weightedPosition = impressions > 0
    ? daily.reduce((sum, row) => sum + row.averagePosition * row.impressions, 0) / impressions
    : 0;

  const warnings: string[] = [];
  if (!workbook.getWorksheet("Kueri")) warnings.push("Sheet Kueri tidak ditemukan.");
  if (!workbook.getWorksheet("Halaman")) warnings.push("Sheet Halaman tidak ditemukan.");
  if ((workbook.getWorksheet("Tampilan penelusuran")?.rowCount || 0) <= 1) {
    warnings.push("Tampilan penelusuran tidak memiliki data.");
  }

  return {
    source: "gsc",
    periodStart: daily[0].date,
    periodEnd: daily[daily.length - 1].date,
    warnings,
    metrics: {
      clicks,
      impressions,
      ctr: impressions ? clicks / impressions : 0,
      average_position: weightedPosition,
      query_count: Math.max(0, (workbook.getWorksheet("Kueri")?.rowCount || 1) - 1),
      page_count: Math.max(0, (workbook.getWorksheet("Halaman")?.rowCount || 1) - 1),
    },
    gsc: {
      daily,
      queries: dimensions(workbook.getWorksheet("Kueri")),
      pages: dimensions(workbook.getWorksheet("Halaman")),
      devices: dimensions(workbook.getWorksheet("Perangkat")),
    },
  };
}

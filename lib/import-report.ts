import crypto from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { DailyGsc, GscDimension } from "@/lib/parsers/types";
import type { ParsedReport } from "@/lib/parsers/types";
import type { GscBundle } from "@/lib/parsers/gsc-csv";
import { periodLabel } from "@/lib/parsers/utils";

export function importReport(db: DatabaseSync, websiteId: string, uploadId: string, report: ParsedReport) {
  const existing = db.prepare(`
    SELECT id FROM report_periods
    WHERE website_id = ? AND period_start = ? AND period_end = ?
  `).get(websiteId, report.periodStart, report.periodEnd) as { id: string } | undefined;

  const periodId = existing?.id || crypto.randomUUID();
  const now = new Date().toISOString();

  db.exec("BEGIN IMMEDIATE");
  try {
    if (!existing) {
      db.prepare(`
        INSERT INTO report_periods(id, website_id, period_start, period_end, period_label, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(periodId, websiteId, report.periodStart, report.periodEnd, periodLabel(report.periodStart), now);
    }

    if (report.source === "gsc" && report.gsc) {
      if (report.gsc.daily.length > 0) db.prepare(`DELETE FROM gsc_daily_metrics WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.gsc.queries.length > 0) db.prepare(`DELETE FROM gsc_queries WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.gsc.pages.length > 0) db.prepare(`DELETE FROM gsc_pages WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.gsc.devices.length > 0) db.prepare(`DELETE FROM gsc_devices WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.gsc.countries && report.gsc.countries.length > 0) db.prepare(`DELETE FROM gsc_countries WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.gsc.appearances && report.gsc.appearances.length > 0) db.prepare(`DELETE FROM gsc_appearance WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
    }
    if (report.source === "ga" && report.ga) {
      if (report.ga.daily.length > 0) db.prepare(`DELETE FROM ga_daily_metrics WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.ga.channels.length > 0) db.prepare(`DELETE FROM ga_channels WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.ga.pages.length > 0) db.prepare(`DELETE FROM ga_pages WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.ga.events.length > 0) db.prepare(`DELETE FROM ga_events WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.ga.cities && report.ga.cities.length > 0) db.prepare(`DELETE FROM ga_cities WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      if (report.ga.deviceModels && report.ga.deviceModels.length > 0) db.prepare(`DELETE FROM ga_device_models WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
    }
    const metricInsert = db.prepare(`
      INSERT OR REPLACE INTO monthly_metrics(website_id, report_period_id, source_type, metric_key, metric_value)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const [key, value] of Object.entries(report.metrics)) {
      metricInsert.run(websiteId, periodId, report.source, key, value);
    }

    if (report.gsc) {
      const dailyInsert = db.prepare(`
        INSERT INTO gsc_daily_metrics(website_id, report_period_id, metric_date, clicks, impressions, ctr, average_position)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      report.gsc.daily.forEach((row) => dailyInsert.run(websiteId, periodId, row.date, row.clicks, row.impressions, row.ctr, row.averagePosition));

      const insertDimension = (table: string, column: string, rows: typeof report.gsc.queries) => {
        const stmt = db.prepare(`
          INSERT INTO ${table}(website_id, report_period_id, ${column}, clicks, impressions, ctr, average_position)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        rows.forEach((row) => stmt.run(websiteId, periodId, row.name, row.clicks, row.impressions, row.ctr, row.averagePosition));
      };
      insertDimension("gsc_queries", "query", report.gsc.queries);
      insertDimension("gsc_pages", "page", report.gsc.pages);
      insertDimension("gsc_devices", "device", report.gsc.devices);
      if (report.gsc.countries) insertDimension("gsc_countries", "country", report.gsc.countries);
      if (report.gsc.appearances) insertDimension("gsc_appearance", "appearance", report.gsc.appearances);
    }

    if (report.ga) {
      const dailyInsert = db.prepare(`
        INSERT INTO ga_daily_metrics(website_id, report_period_id, metric_date, active_users, new_users, engagement_seconds, revenue)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      report.ga.daily.forEach((row) => dailyInsert.run(
        websiteId, periodId, row.date, row.activeUsers ?? null, row.newUsers ?? null,
        row.engagementSeconds ?? null, row.revenue ?? null,
      ));
      const channelInsert = db.prepare(`
        INSERT INTO ga_channels(website_id, report_period_id, channel, sessions, new_users)
        VALUES (?, ?, ?, ?, ?)
      `);
      report.ga.channels.forEach((row) => channelInsert.run(websiteId, periodId, row.channel, row.sessions, row.newUsers));
      const pageInsert = db.prepare(`
        INSERT INTO ga_pages(website_id, report_period_id, page_title, views)
        VALUES (?, ?, ?, ?)
      `);
      report.ga.pages.forEach((row) => pageInsert.run(websiteId, periodId, row.title, row.views));
      const eventInsert = db.prepare(`
        INSERT INTO ga_events(website_id, report_period_id, event_name, event_count, key_event_count)
        VALUES (?, ?, ?, ?, ?)
      `);
      report.ga.events.forEach((row) => eventInsert.run(websiteId, periodId, row.name, row.count, row.keyCount));
      const cityInsert = db.prepare(`
        INSERT INTO ga_cities(website_id, report_period_id, city, active_users)
        VALUES (?, ?, ?, ?)
      `);
      (report.ga.cities || []).forEach((row) => cityInsert.run(websiteId, periodId, row.city, row.activeUsers));
      const modelInsert = db.prepare(`
        INSERT INTO ga_device_models(website_id, report_period_id, model, active_users)
        VALUES (?, ?, ?, ?)
      `);
      (report.ga.deviceModels || []).forEach((row) => modelInsert.run(websiteId, periodId, row.model, row.activeUsers));
    }

    db.prepare(`
      UPDATE report_uploads
      SET report_period_id = ?, source_type = ?, status = ?, warning_message = ?, processed_at = ?
      WHERE id = ?
    `).run(periodId, report.source, report.warnings.length ? "COMPLETED_WITH_WARNINGS" : "COMPLETED", report.warnings.join("\n") || null, now, uploadId);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  db.exec("COMMIT");

  return periodId;
}

export function importGscBundle(db: DatabaseSync, websiteId: string, uploadId: string, bundle: GscBundle) {
  const now = new Date().toISOString();

  const monthMap = new Map<string, DailyGsc[]>();
  for (const row of bundle.daily) {
    const [year, month] = row.date.split("-");
    const key = `${year}-${month}`;
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(row);
  }
  const months = [...monthMap.keys()].sort();

  const dimensionTables = ["gsc_queries", "gsc_pages", "gsc_devices", "gsc_countries", "gsc_appearance"];

  const resolvePeriod = (start: string, end: string, label: string): string => {
    const existing = db.prepare(`SELECT id FROM report_periods WHERE website_id = ? AND period_start = ? AND period_end = ?`).get(websiteId, start, end) as { id: string } | undefined;
    if (existing) return existing.id;
    const id = crypto.randomUUID();
    db.prepare(`INSERT INTO report_periods(id, website_id, period_start, period_end, period_label, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(id, websiteId, start, end, label, now);
    return id;
  };

  const monthBounds = (key: string) => {
    const [year, month] = key.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { start, end, label: periodLabel(start) };
  };

  db.exec("BEGIN IMMEDIATE");
  try {
    let lastPeriodId = "";

    for (const key of months) {
      const rows = monthMap.get(key)!;
      const { start, end, label } = monthBounds(key);
      const periodId = resolvePeriod(start, end, label);

      for (const table of ["gsc_daily_metrics", ...dimensionTables]) {
        db.prepare(`DELETE FROM ${table} WHERE website_id = ? AND report_period_id = ?`).run(websiteId, periodId);
      }
      db.prepare(`DELETE FROM monthly_metrics WHERE website_id = ? AND report_period_id = ? AND source_type = 'gsc'`).run(websiteId, periodId);

      const dailyInsert = db.prepare(`INSERT INTO gsc_daily_metrics(website_id, report_period_id, metric_date, clicks, impressions, ctr, average_position) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      let impressions = 0;
      let clicks = 0;
      let weightedPosition = 0;
      for (const row of rows) {
        dailyInsert.run(websiteId, periodId, row.date, row.clicks, row.impressions, row.ctr, row.averagePosition);
        impressions += row.impressions;
        clicks += row.clicks;
        weightedPosition += row.averagePosition * row.impressions;
      }
      const averagePosition = impressions > 0 ? weightedPosition / impressions : 0;
      const ctr = impressions > 0 ? clicks / impressions : 0;
      const metricInsert = db.prepare(`INSERT INTO monthly_metrics(website_id, report_period_id, source_type, metric_key, metric_value) VALUES (?, ?, ?, ?, ?)`);
      metricInsert.run(websiteId, periodId, "gsc", "impressions", impressions);
      metricInsert.run(websiteId, periodId, "gsc", "clicks", clicks);
      metricInsert.run(websiteId, periodId, "gsc", "ctr", ctr);
      metricInsert.run(websiteId, periodId, "gsc", "average_position", averagePosition);
      metricInsert.run(websiteId, periodId, "gsc", "query_count", bundle.queries.length);
      metricInsert.run(websiteId, periodId, "gsc", "page_count", bundle.pages.length);

      if (key === months[months.length - 1]) lastPeriodId = periodId;
    }

    const bundlePeriodId = resolvePeriod(
      bundle.periodStart,
      bundle.periodEnd,
      `${periodLabel(bundle.periodStart)} – ${periodLabel(bundle.periodEnd)}`,
    );
    for (const table of dimensionTables) {
      db.prepare(`DELETE FROM ${table} WHERE website_id = ? AND report_period_id = ?`).run(websiteId, bundlePeriodId);
    }
    const insertDimension = (table: string, column: string, rows: GscDimension[]) => {
      const stmt = db.prepare(`INSERT INTO ${table}(website_id, report_period_id, ${column}, clicks, impressions, ctr, average_position) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      rows.forEach((row) => stmt.run(websiteId, bundlePeriodId, row.name, row.clicks, row.impressions, row.ctr, row.averagePosition));
    };
    insertDimension("gsc_queries", "query", bundle.queries);
    insertDimension("gsc_pages", "page", bundle.pages);
    insertDimension("gsc_devices", "device", bundle.devices);
    insertDimension("gsc_countries", "country", bundle.countries || []);
    insertDimension("gsc_appearance", "appearance", bundle.appearances || []);

    db.prepare(`UPDATE report_uploads SET report_period_id = ?, source_type = ?, status = ?, warning_message = ?, processed_at = ? WHERE id = ?`)
      .run(lastPeriodId, "gsc-csv-bundle", bundle.warnings.length ? "COMPLETED_WITH_WARNINGS" : "COMPLETED", bundle.warnings.join("\n") || null, now, uploadId);

    db.exec("COMMIT");
    return { periodId: lastPeriodId, bundlePeriodId, warnings: bundle.warnings, source: "gsc-csv-bundle" as const };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

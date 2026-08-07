import crypto from "node:crypto";
import { getDb } from "./db";
import {
  fetchGa4Data,
  fetchGscData,
  getAccessToken,
  getServiceAccountCredentials,
  GOOGLE_SCOPES,
} from "./google-api";
import { periodLabel } from "./parsers/utils";
import { logError } from "./logger";

export interface SyncOptions {
  websiteId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface SyncResult {
  success: boolean;
  periodId?: string;
  gscSynced?: boolean;
  gaSynced?: boolean;
  error?: string;
}

export async function syncGoogleDataForWebsite({
  websiteId,
  startDate,
  endDate,
}: SyncOptions): Promise<SyncResult> {
  const db = getDb();
  const website = db
    .prepare("SELECT id, name, domain, gsc_site_url, ga_property_id FROM websites WHERE id = ?")
    .get(websiteId) as
    | {
        id: string;
        name: string;
        domain: string;
        gsc_site_url?: string;
        ga_property_id?: string;
      }
    | undefined;

  if (!website) {
    return { success: false, error: "Website not found" };
  }

  if (!website.gsc_site_url && !website.ga_property_id) {
    return {
      success: false,
      error: "No GSC Site URL or GA4 Property ID configured for this website",
    };
  }

  const creds = getServiceAccountCredentials();
  if (!creds) {
    return {
      success: false,
      error:
        "Service Account credentials not configured. Please add JSON credentials in Settings.",
    };
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(creds, GOOGLE_SCOPES);
  } catch (err: any) {
    logError("SyncGoogleData", "Failed to authenticate with Google", { error: err.message });
    db.prepare(
      "UPDATE websites SET api_sync_status = 'error', api_sync_error = ? WHERE id = ?"
    ).run(err.message, websiteId);
    return { success: false, error: `Authentication failed: ${err.message}` };
  }

  db.prepare("UPDATE websites SET api_sync_status = 'syncing', api_sync_error = NULL WHERE id = ?").run(
    websiteId
  );

  let gscSynced = false;
  let gaSynced = false;
  const now = new Date().toISOString();

  // Find or create report_period
  const existingPeriod = db
    .prepare("SELECT id FROM report_periods WHERE website_id = ? AND period_start = ? AND period_end = ?")
    .get(websiteId, startDate, endDate) as { id: string } | undefined;

  const periodId = existingPeriod?.id || crypto.randomUUID();

  try {
    // 1. Fetch & Import GSC Data if gsc_site_url is present
    if (website.gsc_site_url) {
      try {
        // Daily metrics
        const dailyRes = await fetchGscData(accessToken, website.gsc_site_url, startDate, endDate, ["date"]);
        // Queries
        const queriesRes = await fetchGscData(accessToken, website.gsc_site_url, startDate, endDate, ["query"]);
        // Pages
        const pagesRes = await fetchGscData(accessToken, website.gsc_site_url, startDate, endDate, ["page"]);
        // Devices
        const devicesRes = await fetchGscData(accessToken, website.gsc_site_url, startDate, endDate, ["device"]);
        // Countries
        const countriesRes = await fetchGscData(accessToken, website.gsc_site_url, startDate, endDate, ["country"]);

        let totalClicks = 0;
        let totalImpressions = 0;
        let weightedPosSum = 0;

        const dailyRows = (dailyRes.rows || []).map((r) => {
          const clicks = r.clicks || 0;
          const impressions = r.impressions || 0;
          const ctr = r.ctr || 0;
          const pos = r.position || 0;
          totalClicks += clicks;
          totalImpressions += impressions;
          weightedPosSum += pos * impressions;

          return {
            date: r.keys[0],
            clicks,
            impressions,
            ctr,
            averagePosition: Math.round(pos * 100) / 100,
          };
        });

        const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
        const avgPos = totalImpressions > 0 ? weightedPosSum / totalImpressions : 0;

        db.exec("BEGIN IMMEDIATE");

        if (!existingPeriod) {
          db.prepare(`
            INSERT INTO report_periods(id, website_id, period_start, period_end, period_label, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(periodId, websiteId, startDate, endDate, periodLabel(startDate), now);
        }

        // Clean old GSC data for this period
        db.prepare("DELETE FROM gsc_daily_metrics WHERE website_id = ? AND report_period_id = ? AND search_type = 'web'").run(websiteId, periodId);
        db.prepare("DELETE FROM gsc_queries WHERE website_id = ? AND report_period_id = ? AND search_type = 'web'").run(websiteId, periodId);
        db.prepare("DELETE FROM gsc_pages WHERE website_id = ? AND report_period_id = ? AND search_type = 'web'").run(websiteId, periodId);
        db.prepare("DELETE FROM gsc_devices WHERE website_id = ? AND report_period_id = ? AND search_type = 'web'").run(websiteId, periodId);
        db.prepare("DELETE FROM gsc_countries WHERE website_id = ? AND report_period_id = ? AND search_type = 'web'").run(websiteId, periodId);

        // Insert summary metrics
        const metricStmt = db.prepare(`
          INSERT OR REPLACE INTO monthly_metrics(website_id, report_period_id, source_type, metric_key, metric_value)
          VALUES (?, ?, 'gsc', ?, ?)
        `);
        metricStmt.run(websiteId, periodId, "clicks", totalClicks);
        metricStmt.run(websiteId, periodId, "impressions", totalImpressions);
        metricStmt.run(websiteId, periodId, "ctr", avgCtr);
        metricStmt.run(websiteId, periodId, "average_position", avgPos);
        metricStmt.run(websiteId, periodId, "query_count", (queriesRes.rows || []).length);
        metricStmt.run(websiteId, periodId, "page_count", (pagesRes.rows || []).length);

        // Insert daily
        const dailyStmt = db.prepare(`
          INSERT INTO gsc_daily_metrics(website_id, report_period_id, search_type, metric_date, clicks, impressions, ctr, average_position)
          VALUES (?, ?, 'web', ?, ?, ?, ?, ?)
        `);
        dailyRows.forEach((r) => dailyStmt.run(websiteId, periodId, r.date, r.clicks, r.impressions, r.ctr, r.averagePosition));

        // Insert queries
        const queryStmt = db.prepare(`
          INSERT INTO gsc_queries(website_id, report_period_id, search_type, query, clicks, impressions, ctr, average_position)
          VALUES (?, ?, 'web', ?, ?, ?, ?, ?)
        `);
        (queriesRes.rows || []).slice(0, 1000).forEach((r) => {
          queryStmt.run(websiteId, periodId, r.keys[0] || "", r.clicks || 0, r.impressions || 0, r.ctr || 0, Math.round((r.position || 0) * 100) / 100);
        });

        // Insert pages
        const pageStmt = db.prepare(`
          INSERT INTO gsc_pages(website_id, report_period_id, search_type, page, clicks, impressions, ctr, average_position)
          VALUES (?, ?, 'web', ?, ?, ?, ?, ?)
        `);
        (pagesRes.rows || []).slice(0, 1000).forEach((r) => {
          pageStmt.run(websiteId, periodId, r.keys[0] || "", r.clicks || 0, r.impressions || 0, r.ctr || 0, Math.round((r.position || 0) * 100) / 100);
        });

        // Insert devices
        const deviceStmt = db.prepare(`
          INSERT INTO gsc_devices(website_id, report_period_id, search_type, device, clicks, impressions, ctr, average_position)
          VALUES (?, ?, 'web', ?, ?, ?, ?, ?)
        `);
        (devicesRes.rows || []).forEach((r) => {
          deviceStmt.run(websiteId, periodId, r.keys[0] || "", r.clicks || 0, r.impressions || 0, r.ctr || 0, Math.round((r.position || 0) * 100) / 100);
        });

        // Insert countries
        const countryStmt = db.prepare(`
          INSERT INTO gsc_countries(website_id, report_period_id, search_type, country, clicks, impressions, ctr, average_position)
          VALUES (?, ?, 'web', ?, ?, ?, ?, ?)
        `);
        (countriesRes.rows || []).slice(0, 100).forEach((r) => {
          countryStmt.run(websiteId, periodId, r.keys[0] || "", r.clicks || 0, r.impressions || 0, r.ctr || 0, Math.round((r.position || 0) * 100) / 100);
        });

        db.exec("COMMIT");
        gscSynced = true;
      } catch (err: any) {
        try { db.exec("ROLLBACK"); } catch (e) {}
        console.error("GSC Sync Error:", err);
        logError("SyncGoogleData", `GSC fetch failed for site ${website.gsc_site_url}`, { error: err.message });
      }
    }

    // 2. Fetch & Import GA4 Data if ga_property_id is present
    if (website.ga_property_id) {
      try {
        // GA4 Daily (date: activeUsers, newUsers, userEngagementDuration, totalRevenue)
        const dailyGa = await fetchGa4Data(accessToken, website.ga_property_id, startDate, endDate, ["date"], [
          "activeUsers",
          "newUsers",
          "userEngagementDuration",
          "totalRevenue",
        ]);

        // GA4 Channels (sessionDefaultChannelGroup: sessions, newUsers)
        const channelGa = await fetchGa4Data(accessToken, website.ga_property_id, startDate, endDate, ["sessionDefaultChannelGroup"], [
          "sessions",
          "newUsers",
        ]);

        // GA4 Top Pages (pageTitle: screenPageViews)
        const pageGa = await fetchGa4Data(accessToken, website.ga_property_id, startDate, endDate, ["pageTitle"], ["screenPageViews"]);

        // GA4 Events (eventName: eventCount, keyEvents)
        const eventGa = await fetchGa4Data(accessToken, website.ga_property_id, startDate, endDate, ["eventName"], ["eventCount", "keyEvents"]);

        // GA4 Cities (city: activeUsers)
        const cityGa = await fetchGa4Data(accessToken, website.ga_property_id, startDate, endDate, ["city"], ["activeUsers"]);

        // GA4 Devices (mobileDeviceModel: activeUsers)
        const deviceGa = await fetchGa4Data(accessToken, website.ga_property_id, startDate, endDate, ["mobileDeviceModel"], ["activeUsers"]);

        let totalActiveUsers = 0;
        let totalNewUsers = 0;
        let totalEngagementSec = 0;
        let totalRevenue = 0;

        const dailyRows = (dailyGa.rows || []).map((r) => {
          const dateStr = r.dimensionValues[0]?.value || "";
          // Format GA4 date 'YYYYMMDD' to 'YYYY-MM-DD' if needed
          const formattedDate = dateStr.length === 8 ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}` : dateStr;
          const activeUsers = parseFloat(r.metricValues[0]?.value || "0");
          const newUsers = parseFloat(r.metricValues[1]?.value || "0");
          const engagementSec = parseFloat(r.metricValues[2]?.value || "0");
          const revenue = parseFloat(r.metricValues[3]?.value || "0");

          totalActiveUsers += activeUsers;
          totalNewUsers += newUsers;
          totalEngagementSec += engagementSec;
          totalRevenue += revenue;

          return { date: formattedDate, activeUsers, newUsers, engagementSec, revenue };
        });

        db.exec("BEGIN IMMEDIATE");

        if (!existingPeriod && !gscSynced) {
          db.prepare(`
            INSERT INTO report_periods(id, website_id, period_start, period_end, period_label, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(periodId, websiteId, startDate, endDate, periodLabel(startDate), now);
        }

        // Clean old GA data for this period
        db.prepare("DELETE FROM ga_daily_metrics WHERE website_id = ? AND report_period_id = ?").run(websiteId, periodId);
        db.prepare("DELETE FROM ga_channels WHERE website_id = ? AND report_period_id = ?").run(websiteId, periodId);
        db.prepare("DELETE FROM ga_pages WHERE website_id = ? AND report_period_id = ?").run(websiteId, periodId);
        db.prepare("DELETE FROM ga_events WHERE website_id = ? AND report_period_id = ?").run(websiteId, periodId);
        db.prepare("DELETE FROM ga_cities WHERE website_id = ? AND report_period_id = ?").run(websiteId, periodId);
        db.prepare("DELETE FROM ga_device_models WHERE website_id = ? AND report_period_id = ?").run(websiteId, periodId);

        // Calculate GA totals for summary metrics
        const totalSessions = (channelGa.rows || []).reduce((sum, r) => sum + parseFloat(r.metricValues[0]?.value || "0"), 0);
        const totalPageViews = (pageGa.rows || []).reduce((sum, r) => sum + parseFloat(r.metricValues[0]?.value || "0"), 0);
        const chatEvents = (eventGa.rows || [])
          .filter((r) => /chat|whatsapp|wa_click|click_to_chat/i.test(r.dimensionValues[0]?.value || ""))
          .reduce((sum, r) => sum + parseFloat(r.metricValues[0]?.value || "0"), 0);

        // Insert summary metrics
        const metricStmt = db.prepare(`
          INSERT OR REPLACE INTO monthly_metrics(website_id, report_period_id, source_type, metric_key, metric_value)
          VALUES (?, ?, 'ga', ?, ?)
        `);
        metricStmt.run(websiteId, periodId, "active_users", totalActiveUsers);
        metricStmt.run(websiteId, periodId, "new_users", totalNewUsers);
        metricStmt.run(websiteId, periodId, "sessions", totalSessions);
        metricStmt.run(websiteId, periodId, "page_views", totalPageViews);
        metricStmt.run(websiteId, periodId, "pages_per_session", totalSessions ? totalPageViews / totalSessions : 0);
        metricStmt.run(websiteId, periodId, "average_engagement_seconds", totalActiveUsers ? totalEngagementSec / totalActiveUsers : 0);
        metricStmt.run(websiteId, periodId, "revenue", totalRevenue);
        metricStmt.run(websiteId, periodId, "click_to_chat", chatEvents);
        metricStmt.run(websiteId, periodId, "chat_conversion_rate", totalSessions ? chatEvents / totalSessions : 0);

        // Insert daily
        const dailyStmt = db.prepare(`
          INSERT INTO ga_daily_metrics(website_id, report_period_id, metric_date, active_users, new_users, engagement_seconds, revenue)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        dailyRows.forEach((r) => dailyStmt.run(websiteId, periodId, r.date, r.activeUsers, r.newUsers, r.engagementSec, r.revenue));

        // Insert channels
        const channelStmt = db.prepare(`
          INSERT INTO ga_channels(website_id, report_period_id, channel, sessions, new_users)
          VALUES (?, ?, ?, ?, ?)
        `);
        (channelGa.rows || []).forEach((r) => {
          channelStmt.run(websiteId, periodId, r.dimensionValues[0]?.value || "Unassigned", parseFloat(r.metricValues[0]?.value || "0"), parseFloat(r.metricValues[1]?.value || "0"));
        });

        // Insert pages
        const pageStmt = db.prepare(`
          INSERT INTO ga_pages(website_id, report_period_id, page_title, views)
          VALUES (?, ?, ?, ?)
        `);
        (pageGa.rows || []).slice(0, 500).forEach((r) => {
          pageStmt.run(websiteId, periodId, r.dimensionValues[0]?.value || "(not set)", parseFloat(r.metricValues[0]?.value || "0"));
        });

        // Insert events
        const eventStmt = db.prepare(`
          INSERT INTO ga_events(website_id, report_period_id, event_name, event_count, key_event_count)
          VALUES (?, ?, ?, ?, ?)
        `);
        (eventGa.rows || []).slice(0, 500).forEach((r) => {
          eventStmt.run(websiteId, periodId, r.dimensionValues[0]?.value || "(not set)", parseFloat(r.metricValues[0]?.value || "0"), parseFloat(r.metricValues[1]?.value || "0"));
        });

        // Insert cities
        const cityStmt = db.prepare(`
          INSERT INTO ga_cities(website_id, report_period_id, city, active_users)
          VALUES (?, ?, ?, ?)
        `);
        (cityGa.rows || []).slice(0, 100).forEach((r) => {
          cityStmt.run(websiteId, periodId, r.dimensionValues[0]?.value || "(not set)", parseFloat(r.metricValues[0]?.value || "0"));
        });

        // Insert device models
        const devStmt = db.prepare(`
          INSERT INTO ga_device_models(website_id, report_period_id, model, active_users)
          VALUES (?, ?, ?, ?)
        `);
        (deviceGa.rows || []).slice(0, 100).forEach((r) => {
          devStmt.run(websiteId, periodId, r.dimensionValues[0]?.value || "(not set)", parseFloat(r.metricValues[0]?.value || "0"));
        });

        db.exec("COMMIT");
        gaSynced = true;
      } catch (err: any) {
        try { db.exec("ROLLBACK"); } catch (e) {}
        console.error("GA4 Sync Error:", err);
        logError("SyncGoogleData", `GA4 fetch failed for property ${website.ga_property_id}`, { error: err.message });
      }
    }

    if (!gscSynced && !gaSynced) {
      db.prepare(
        "UPDATE websites SET api_sync_status = 'error', api_sync_error = 'Failed to fetch both GSC and GA4 data' WHERE id = ?"
      ).run(websiteId);
      return { success: false, error: "Failed to fetch data from both GSC and GA4 APIs" };
    }

    db.prepare(
      "UPDATE websites SET api_sync_status = 'success', last_api_sync_at = ?, api_sync_error = NULL WHERE id = ?"
    ).run(now, websiteId);

    return {
      success: true,
      periodId,
      gscSynced,
      gaSynced,
    };
  } catch (err: any) {
    db.prepare(
      "UPDATE websites SET api_sync_status = 'error', api_sync_error = ? WHERE id = ?"
    ).run(err.message, websiteId);
    return { success: false, error: err.message };
  }
}

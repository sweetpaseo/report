import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { syncGoogleDataForWebsite } from "@/lib/sync-google-data";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.SESSION_SECRET;

  // 1. Check x-cron-secret header
  const headerSecret = request.headers.get("x-cron-secret");
  if (secret && headerSecret === secret) return true;

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get("authorization");
  if (authHeader && secret) {
    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token === secret) return true;
  }

  // 3. Check query param ?secret=...
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (secret && querySecret === secret) return true;

  // 4. Check if called from internal localhost without external proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const host = request.headers.get("host") || "";
  if (!forwardedFor && (host.startsWith("127.0.0.1") || host.startsWith("localhost"))) {
    return true;
  }

  return false;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface PeriodRange {
  name: string;
  startDate: string;
  endDate: string;
}

function getDefaultDateRanges(): PeriodRange[] {
  const now = new Date();
  const ranges: PeriodRange[] = [];

  // 1. Previous Month (1st to last day)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  ranges.push({
    name: "Bulan Lalu",
    startDate: formatDate(prevMonthStart),
    endDate: formatDate(prevMonthEnd),
  });

  // 2. Current Month (1st up to H-2, accommodating GSC 48h data lag)
  const currMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);

  if (twoDaysAgo >= currMonthStart) {
    ranges.push({
      name: "Bulan Berjalan (H-2)",
      startDate: formatDate(currMonthStart),
      endDate: formatDate(twoDaysAgo),
    });
  }

  return ranges;
}

async function handleSync(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron secret" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const paramWebsiteId = url.searchParams.get("websiteId");
  const paramStartDate = url.searchParams.get("startDate");
  const paramEndDate = url.searchParams.get("endDate");

  const db = getDb();
  let query = "SELECT id, name, domain, gsc_site_url, ga_property_id FROM websites WHERE (gsc_site_url IS NOT NULL OR ga_property_id IS NOT NULL)";
  const params: any[] = [];

  if (paramWebsiteId) {
    query += " AND id = ?";
    params.push(paramWebsiteId);
  }

  const websites = db.prepare(query).all(...params) as Array<{
    id: string;
    name: string;
    domain: string;
    gsc_site_url?: string;
    ga_property_id?: string;
  }>;

  if (websites.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Tidak ada website dengan konfigurasi Google API (GSC / GA4).",
      websitesProcessed: 0,
      results: [],
    });
  }

  // Determine periods to sync
  let ranges: PeriodRange[] = [];
  if (paramStartDate && paramEndDate) {
    ranges = [{ name: "Custom Range", startDate: paramStartDate, endDate: paramEndDate }];
  } else {
    ranges = getDefaultDateRanges();
  }

  const results: Array<{
    websiteId: string;
    websiteName: string;
    domain: string;
    periodName: string;
    startDate: string;
    endDate: string;
    success: boolean;
    periodId?: string;
    gscSynced?: boolean;
    gaSynced?: boolean;
    error?: string;
  }> = [];

  for (const site of websites) {
    for (const range of ranges) {
      try {
        const res = await syncGoogleDataForWebsite({
          websiteId: site.id,
          startDate: range.startDate,
          endDate: range.endDate,
        });

        results.push({
          websiteId: site.id,
          websiteName: site.name,
          domain: site.domain,
          periodName: range.name,
          startDate: range.startDate,
          endDate: range.endDate,
          success: res.success,
          periodId: res.periodId,
          gscSynced: res.gscSynced,
          gaSynced: res.gaSynced,
          error: res.error,
        });
      } catch (err: any) {
        results.push({
          websiteId: site.id,
          websiteName: site.name,
          domain: site.domain,
          periodName: range.name,
          startDate: range.startDate,
          endDate: range.endDate,
          success: false,
          error: err?.message || String(err),
        });
      }
    }
  }

  const successfulSyncs = results.filter((r) => r.success).length;
  const failedSyncs = results.filter((r) => !r.success).length;

  return NextResponse.json({
    success: failedSyncs === 0,
    timestamp: new Date().toISOString(),
    totalWebsites: websites.length,
    totalSyncOperations: results.length,
    successfulSyncs,
    failedSyncs,
    ranges,
    results,
  });
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}

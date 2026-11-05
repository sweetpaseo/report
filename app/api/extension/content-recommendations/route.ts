import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyExtensionToken } from "@/lib/extension-auth";

export async function GET(request: Request) {
  const staff = verifyExtensionToken(request.headers.get("authorization"));
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "Parameter clientId diperlukan." }, { status: 400 });
  }

  const db = getDb();

  // Verify staff has access to this client
  const assignment = db
    .prepare("SELECT staff_id FROM staff_client_assignments WHERE staff_id = ? AND client_id = ?")
    .get(staff.staffId, clientId);

  if (!assignment) {
    return NextResponse.json({ error: "Akses ditolak ke klien ini." }, { status: 403 });
  }

  // 1. Get client websites
  const websites = db.prepare("SELECT id, name, domain FROM websites WHERE client_id = ?").all(clientId) as Array<{ id: string; name: string; domain: string }>;

  // 2. Get top search queries from GSC for the client's website
  let topQueries: Array<{ query: string; clicks: number; impressions: number }> = [];
  if (websites.length > 0) {
    const siteIds = websites.map((w) => `'${w.id}'`).join(",");
    topQueries = db
      .prepare(`
        SELECT query, SUM(clicks) as clicks, SUM(impressions) as impressions
        FROM gsc_queries
        WHERE website_id IN (${siteIds})
        GROUP BY query
        ORDER BY clicks DESC, impressions DESC
        LIMIT 5
      `)
      .all() as Array<{ query: string; clicks: number; impressions: number }>;
  }

  // 3. Get top posts from cache
  const topSocialPosts = db
    .prepare(`
      SELECT caption, media_type, likes_count, comments_count, engagement_score
      FROM social_posts_cache
      WHERE client_id = ?
      ORDER BY engagement_score DESC
      LIMIT 3
    `)
    .all(clientId) as Array<{ caption: string; media_type: string; likes_count: number; comments_count: number; engagement_score: number }>;

  // Formulate 3 dynamic content ideas based on real search intent
  const contentSuggestions = topQueries.map((q, idx) => {
    return {
      id: `sug_${idx + 1}`,
      source: "Google Search Demand (GSC)",
      topic: q.query,
      searchVolume: `${q.impressions} tayangan di Google`,
      recommendedFormat: idx % 2 === 0 ? "Carousel Edukatif (3-5 Slide)" : "Shorts / Reels (30-45 Detik)",
      hooks: [
        `"Banyak yang belum tahu, ini rahasia tentang ${q.query}..."`,
        `"Stop scroll dulu kalau kamu lagi cari ${q.query}!"`,
        `"3 Hal penting sebelum kamu memutuskan ${q.query}."`,
      ],
      callToAction: "Komen 'INFO' untuk dapat katalog lengkap via DM, atau cek link di bio!",
    };
  });

  return NextResponse.json({
    ok: true,
    clientId,
    suggestions: contentSuggestions,
    topSearchQueries: topQueries,
    topSocialHistory: topSocialPosts,
    bestTimeToday: {
      day: new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date()),
      recommendedHours: ["12:00 - 13:00 WIB (Istirahat)", "17:30 - 19:30 WIB (Pulang Kerja / Santai)"],
    },
  });
}


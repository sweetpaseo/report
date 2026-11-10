import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionPayload } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { resolvePostDate } from "@/lib/social-utils";

export async function GET(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(sessionToken);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let clientId = searchParams.get("clientId");
  const websiteId = searchParams.get("websiteId");
  const db = getDb();

  // Scope Restriction for Staff
  if (payload.role === "staff" && payload.userId) {
    const assignments = db
      .prepare("SELECT client_id FROM staff_client_assignments WHERE staff_id = ?")
      .all(payload.userId) as Array<{ client_id: string }>;

    const allowedClientIds = assignments.map((a) => a.client_id);
    if (allowedClientIds.length === 0) {
      return NextResponse.json({
        ok: true,
        snapshots: [],
        posts: [],
        client: null,
      });
    }

    // If no clientId specified or not allowed, fallback to the staff's first assigned client
    if (!clientId || !allowedClientIds.includes(clientId)) {
      clientId = allowedClientIds[0];
    }
  }

  let targetWebsite: { id: string; name: string; domain: string; client_id: string | null } | undefined;
  if (websiteId) {
    targetWebsite = db.prepare("SELECT id, name, domain, client_id FROM websites WHERE id = ?").get(websiteId) as
      | { id: string; name: string; domain: string; client_id: string | null }
      | undefined;
    if (targetWebsite?.client_id && !clientId) {
      clientId = targetWebsite.client_id;
    }
  }

  if (!clientId) {
    const firstClient = db.prepare("SELECT id FROM clients ORDER BY name ASC LIMIT 1").get() as
      | { id: string }
      | undefined;
    if (firstClient) {
      clientId = firstClient.id;
    }
  }

  if (!clientId && !targetWebsite) {
    return NextResponse.json({
      ok: true,
      snapshots: [],
      posts: [],
      client: null,
    });
  }

  const client = clientId
    ? (db.prepare("SELECT id, name, social_handles FROM clients WHERE id = ?").get(clientId) as
        | { id: string; name: string; social_handles?: string | null }
        | undefined)
    : null;

  const domainPattern = targetWebsite?.domain || "";
  const namePattern = targetWebsite?.name || "";

  // Latest snapshot per platform: match by client_id OR by website domain / name
  const snapshots = db.prepare(`
    SELECT s.*, st.name as synced_by_name
    FROM social_profile_snapshots s
    LEFT JOIN staff_users st ON s.synced_by_staff_id = st.id
    WHERE (? IS NOT NULL AND s.client_id = ?)
       OR (? != '' AND (LOWER(s.username) = LOWER(?) OR LOWER(s.username) = LOWER(?)))
    ORDER BY s.synced_at DESC
    LIMIT 20
  `).all(clientId, clientId, domainPattern, domainPattern, namePattern);

  // Cached posts from extension: match by client_id OR associated snapshots
  const rawPosts = db.prepare(`
    SELECT *
    FROM social_posts_cache
    WHERE (? IS NOT NULL AND client_id = ?)
       OR client_id IN (
         SELECT DISTINCT client_id FROM social_profile_snapshots
         WHERE ? != '' AND (LOWER(username) = LOWER(?) OR LOWER(username) = LOWER(?))
       )
    ORDER BY posted_at DESC, synced_at DESC
    LIMIT 100
  `).all(clientId, clientId, domainPattern, domainPattern, namePattern) as Array<Record<string, unknown>>;

  const posts = rawPosts.map((p) => {
    const platform = String(p.platform || "");
    const postId = String(p.post_id || "");
    const origPostedAt = p.posted_at ? String(p.posted_at) : null;
    const resolvedPostedAt = resolvePostDate(platform, postId, origPostedAt);

    return {
      ...p,
      posted_at: resolvedPostedAt,
    };
  }).sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

  // SEO to Social Content Recommendations based on top Google Search queries
  let seoSuggestions: Array<{
    id: string;
    topic: string;
    impressions: number;
    clicks: number;
    recommendedFormat: string;
    hook: string;
    cta: string;
  }> = [];

  try {
    const clientWebsites = db
      .prepare("SELECT id FROM websites WHERE (? IS NOT NULL AND client_id = ?) OR (? IS NOT NULL AND id = ?)")
      .all(clientId, clientId, websiteId, websiteId) as Array<{ id: string }>;

    if (clientWebsites.length > 0) {
      const siteIds = clientWebsites.map((w) => `'${w.id}'`).join(",");
      const topQueries = db
        .prepare(`
          SELECT query, SUM(clicks) as clicks, SUM(impressions) as impressions
          FROM gsc_queries
          WHERE website_id IN (${siteIds}) AND query NOT LIKE '%http%'
          GROUP BY query
          ORDER BY impressions DESC, clicks DESC
          LIMIT 6
        `)
        .all() as Array<{ query: string; clicks: number; impressions: number }>;

      seoSuggestions = topQueries.map((q, idx) => ({
        id: `seo_sug_${idx + 1}`,
        topic: q.query,
        impressions: q.impressions || 0,
        clicks: q.clicks || 0,
        recommendedFormat: idx % 2 === 0 ? "Carousel Edukatif (3-5 Slide)" : "Reels / Video Pendek (30-45 dtk)",
        hook: idx % 3 === 0
          ? `Banyak yang belum tahu, ini tips penting tentang ${q.query}!`
          : idx % 3 === 1
          ? `Stop scroll dulu kalau kamu lagi butuh ${q.query}!`
          : `3 Rahasia memilih ${q.query} yang wajib kamu tahu!`,
        cta: "Ketik 'INFO' di komentar untuk konsultasi gratis atau cek link di bio!",
      }));
    }
  } catch {}

  return NextResponse.json({
    ok: true,
    client: client
      ? {
          id: client.id,
          name: client.name,
          socialHandles: client.social_handles ? JSON.parse(client.social_handles) : {},
        }
      : null,
    snapshots,
    posts,
    seoSuggestions,
  });
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { resolvePostDate } from "@/lib/social-utils";

export async function GET(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let clientId = searchParams.get("clientId");
  const websiteId = searchParams.get("websiteId");
  const db = getDb();

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
  });
}

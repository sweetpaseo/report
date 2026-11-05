import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

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

  if (!clientId && websiteId) {
    const site = db.prepare("SELECT client_id FROM websites WHERE id = ?").get(websiteId) as
      | { client_id: string | null }
      | undefined;
    if (site?.client_id) {
      clientId = site.client_id;
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

  if (!clientId) {
    return NextResponse.json({
      ok: true,
      snapshots: [],
      posts: [],
      client: null,
    });
  }

  const client = db.prepare("SELECT id, name, social_handles FROM clients WHERE id = ?").get(clientId) as
    | { id: string; name: string; social_handles?: string | null }
    | undefined;

  // Latest snapshot per platform
  const snapshots = db.prepare(`
    SELECT s.*, st.name as synced_by_name
    FROM social_profile_snapshots s
    LEFT JOIN staff_users st ON s.synced_by_staff_id = st.id
    WHERE s.client_id = ?
    ORDER BY s.synced_at DESC
    LIMIT 10
  `).all(clientId);

  // Cached posts from extension
  const posts = db.prepare(`
    SELECT *
    FROM social_posts_cache
    WHERE client_id = ?
    ORDER BY posted_at DESC, synced_at DESC
    LIMIT 60
  `).all(clientId);

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


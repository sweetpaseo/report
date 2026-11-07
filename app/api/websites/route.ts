import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken, getSessionPayload } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  domain: z.string().trim().min(3).max(200),
  timezone: z.string().trim().default("Asia/Jakarta"),
  client_id: z.string().optional(),
  gsc_site_url: z.string().optional(),
  ga_property_id: z.string().optional(),
});

export async function GET(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(sessionToken);
  if (!payload) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const db = getDb();

  // If role is staff, only return websites that belong to assigned clients
  if (payload.role === "staff" && payload.userId) {
    const assignedClients = db
      .prepare("SELECT client_id FROM staff_client_assignments WHERE staff_id = ?")
      .all(payload.userId) as Array<{ client_id: string }>;

    const clientIds = assignedClients.map((a) => a.client_id);
    if (clientIds.length === 0) {
      return NextResponse.json({ websites: [] });
    }

    const placeholders = clientIds.map(() => "?").join(",");
    const websites = db.prepare(`
      SELECT w.id, w.name, w.domain, w.timezone, w.client_id, w.created_at,
        w.gsc_site_url, w.ga_property_id, w.last_api_sync_at, w.api_sync_status, w.api_sync_error,
        (SELECT COUNT(*) FROM report_periods rp WHERE rp.website_id = w.id) AS period_count
      FROM websites w
      WHERE w.client_id IN (${placeholders})
      ORDER BY w.name ASC
    `).all(...clientIds);

    return NextResponse.json({ websites });
  }

  // Admin: return all websites
  const websites = db.prepare(`
    SELECT w.id, w.name, w.domain, w.timezone, w.client_id, w.created_at,
      w.gsc_site_url, w.ga_property_id, w.last_api_sync_at, w.api_sync_status, w.api_sync_error,
      (SELECT COUNT(*) FROM report_periods rp WHERE rp.website_id = w.id) AS period_count
    FROM websites w ORDER BY w.name ASC
  `).all();
  return NextResponse.json({ websites });
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat menambah website." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data website tidak valid." }, { status: 400 });
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(24).toString("base64url");
  let domain = parsed.data.domain.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  getDb().prepare(`
    INSERT INTO websites(id, name, domain, timezone, public_token, created_at, client_id, gsc_site_url, ga_property_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    parsed.data.name,
    domain,
    parsed.data.timezone,
    token,
    new Date().toISOString(),
    parsed.data.client_id || null,
    parsed.data.gsc_site_url || null,
    parsed.data.ga_property_id || null
  );
  return NextResponse.json({ id, publicToken: token }, { status: 201 });
}

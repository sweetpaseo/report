import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  domain: z.string().trim().min(3).max(200),
  timezone: z.string().trim().default("Asia/Jakarta"),
  client_id: z.string().optional(),
});

export async function GET() {
  const websites = getDb().prepare(`
    SELECT w.*,
      (SELECT COUNT(*) FROM report_periods rp WHERE rp.website_id = w.id) AS period_count
    FROM websites w ORDER BY w.created_at DESC
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
    INSERT INTO websites(id, name, domain, timezone, public_token, created_at, client_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, parsed.data.name, domain, parsed.data.timezone, token, new Date().toISOString(), parsed.data.client_id || null);
  return NextResponse.json({ id, publicToken: token }, { status: 201 });
}

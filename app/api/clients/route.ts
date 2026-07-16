import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
});

export async function GET() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const clients = getDb().prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM websites w WHERE w.client_id = c.id) AS website_count
    FROM clients c ORDER BY c.created_at DESC
  `).all();
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat menambah klien." }, { status: 403 });
  }
  
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nama klien tidak valid." }, { status: 400 });
  
  const id = crypto.randomUUID();
  const token = "c_" + crypto.randomBytes(24).toString("base64url");
  
  getDb().prepare(`
    INSERT INTO clients(id, name, public_token, created_at)
    VALUES (?, ?, ?, ?)
  `).run(id, parsed.data.name, token, new Date().toISOString());
  
  return NextResponse.json({ id, publicToken: token }, { status: 201 });
}

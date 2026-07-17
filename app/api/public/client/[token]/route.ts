import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { resolveClientToken } from "@/lib/public-tokens";
import { checkPublicTokenRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Token klien diperlukan." }, { status: 400 });

  const rl = checkPublicTokenRateLimit(`c:${token}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const client = resolveClientToken(token);
  if (!client.valid || !client.id) {
    return NextResponse.json({ error: "Klien tidak ditemukan." }, { status: 404 });
  }

  const websiteId = new URL(request.url).searchParams.get("websiteId");
  const db = getDb();

  let websites;
  if (websiteId) {
    const row = db.prepare(`
      SELECT id, name, domain, public_token
      FROM websites WHERE client_id = ? AND id = ? ORDER BY name ASC
    `).get(client.id, websiteId);
    websites = row ? [row] : [];
  } else {
    websites = db.prepare(`
      SELECT id, name, domain, public_token
      FROM websites WHERE client_id = ? ORDER BY name ASC
    `).all(client.id);
  }

  return NextResponse.json({ client: { id: client.id, name: client.name }, websites });
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { resolveClientToken } from "@/lib/public-tokens";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Token klien diperlukan." }, { status: 400 });

  const client = resolveClientToken(token);
  if (!client.valid || !client.id) {
    return NextResponse.json({ error: "Klien tidak ditemukan." }, { status: 404 });
  }

  const websites = getDb().prepare(`
    SELECT id, name, domain, public_token
    FROM websites
    WHERE client_id = ?
    ORDER BY name ASC
  `).all(client.id);

  return NextResponse.json({ client: { id: client.id, name: client.name }, websites });
}

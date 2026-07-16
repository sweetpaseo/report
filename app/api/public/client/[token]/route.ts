import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Token klien diperlukan." }, { status: 400 });

  const client = getDb().prepare(`
    SELECT id, name
    FROM clients
    WHERE public_token = ?
  `).get(token) as { id: string; name: string } | undefined;

  if (!client) {
    return NextResponse.json({ error: "Klien tidak ditemukan." }, { status: 404 });
  }

  const websites = getDb().prepare(`
    SELECT id, name, domain, public_token
    FROM websites
    WHERE client_id = ?
    ORDER BY name ASC
  `).all(client.id);

  return NextResponse.json({ client, websites });
}

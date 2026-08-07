import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const schema = z.object({
  gsc_site_url: z.string().trim().optional(),
  ga_property_id: z.string().trim().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const website = getDb()
    .prepare("SELECT id, name, domain, gsc_site_url, ga_property_id, last_api_sync_at, api_sync_status, api_sync_error FROM websites WHERE id = ?")
    .get(id) as any;

  if (!website) {
    return NextResponse.json({ error: "Website tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ website });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat mengubah konfigurasi Google API" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Konfigurasi tidak valid" }, { status: 400 });
  }

  getDb().prepare(`
    UPDATE websites
    SET gsc_site_url = ?, ga_property_id = ?
    WHERE id = ?
  `).run(parsed.data.gsc_site_url || null, parsed.data.ga_property_id || null, id);

  return NextResponse.json({ success: true });
}

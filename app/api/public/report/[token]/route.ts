import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const db = getDb();
  const website = db.prepare("SELECT id FROM websites WHERE public_token = ?").get(token) as { id: string } | undefined;
  if (!website) return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
  const periodId = new URL(request.url).searchParams.get("periodId") || undefined;
  return NextResponse.json(getDashboard(db, website.id, periodId));
}

import { NextResponse } from "next/server";
import { getFullReportData } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { resolveWebsiteToken } from "@/lib/public-tokens";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const website = resolveWebsiteToken(token);
  if (!website.valid || !website.id) {
    return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
  }
  const db = getDb();
  const periodId = new URL(request.url).searchParams.get("periodId") || undefined;
  return NextResponse.json(getFullReportData(db, website.id, periodId));
}

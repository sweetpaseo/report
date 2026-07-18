import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { resolveWebsiteToken } from "@/lib/public-tokens";
import { checkPublicTokenRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;

  const rl = checkPublicTokenRateLimit(`w:${token}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const website = resolveWebsiteToken(token);
  if (!website.valid || !website.id) {
    return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
  }
  const db = getDb();
  const periodId = new URL(request.url).searchParams.get("periodId") || undefined;
  const searchType = (new URL(request.url).searchParams.get("searchType") === "aigen" ? "aigen" : "web") as "web" | "aigen";
  return NextResponse.json(getDashboard(db, website.id, periodId, searchType));
}

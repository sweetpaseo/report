import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const websiteId = url.searchParams.get("websiteId");
  const periodId = url.searchParams.get("periodId") || undefined;
  const searchType = (url.searchParams.get("searchType") === "aigen" ? "aigen" : "web") as "web" | "aigen";
  if (!websiteId) return NextResponse.json({ error: "websiteId wajib diisi." }, { status: 400 });
  const result = getDashboard(getDb(), websiteId, periodId, searchType);
  if (!result) return NextResponse.json({ error: "Website tidak ditemukan." }, { status: 404 });
  return NextResponse.json(result);
}

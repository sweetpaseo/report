import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const role = await verifySessionToken(token);
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);
    const maxLimit = limit > 500 ? 500 : limit;

    const db = getDb();
    const logs = db.prepare(`
      SELECT id, level, context, message, details, created_at
      FROM system_logs
      ORDER BY created_at DESC
      LIMIT ?
    `).all(maxLimit);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to fetch logs", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

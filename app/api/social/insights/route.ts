import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getTebarAccountInsights, getTebarBestTimes } from "@/lib/tebar";

export async function GET(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json({ error: "Parameter accountId diperlukan." }, { status: 400 });
  }

  try {
    const [insights, bestTimes] = await Promise.all([
      getTebarAccountInsights(accountId).catch((e) => ({ error: e.message })),
      getTebarBestTimes(accountId).catch((e) => ({ error: e.message })),
    ]);

    return NextResponse.json({
      ok: true,
      accountId,
      insights: "error" in insights ? null : insights,
      bestTimes: "error" in bestTimes ? null : bestTimes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil insights.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

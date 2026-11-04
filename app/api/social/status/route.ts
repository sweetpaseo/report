import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getTebarMe, getTebarAccounts, getTebarProfiles } from "@/lib/tebar";

export async function GET() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [me, accounts, profiles] = await Promise.all([
      getTebarMe().catch((e) => ({ error: e.message })),
      getTebarAccounts().catch((e) => ({ data: [], error: e.message })),
      getTebarProfiles().catch((e) => ({ data: [], error: e.message })),
    ]);

    return NextResponse.json({
      ok: true,
      tebar: {
        me: "user" in me ? me.user : null,
        accounts: "data" in accounts ? accounts.data : [],
        profiles: "data" in profiles ? profiles.data : [],
        error: "error" in me ? me.error : undefined,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil status Tebar.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

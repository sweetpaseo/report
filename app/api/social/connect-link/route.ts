import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { createTebarConnectLink } from "@/lib/tebar";

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const profileId = typeof body.profileId === "string" ? body.profileId : undefined;
    const link = await createTebarConnectLink(profileId);

    return NextResponse.json({
      ok: true,
      url: link.url,
      profileId: link.profile_id,
      expiresAt: link.expires_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat tautan koneksi Tebar.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, type SessionRole } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  const limit = checkRateLimit(`login:${clientIp}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const { password } = await request.json().catch(() => ({ password: "" }));
  const adminExpected = process.env.ADMIN_PASSWORD?.trim();
  const clientExpected = process.env.CLIENT_PASSWORD?.trim();

  if ((!adminExpected || adminExpected.length < 10) && (!clientExpected || clientExpected.length < 6)) {
    return NextResponse.json({ error: "ADMIN_PASSWORD belum dikonfigurasi dengan aman." }, { status: 500 });
  }

  const passwordStr = String(password || "");
  let role: SessionRole | null = null;
  if (adminExpected && adminExpected.length >= 10 && safeEqual(passwordStr, adminExpected)) role = "admin";
  if (!role && clientExpected && clientExpected.length >= 6 && safeEqual(passwordStr, clientExpected)) role = "client";
  if (!role) return NextResponse.json({ error: "Password salah." }, { status: 401 });

  resetRateLimit(`login:${clientIp}`);

  const response = NextResponse.json({ ok: true, role });
  const isProd = process.env.NODE_ENV === "production";
  const isHttps = request.headers.get("x-forwarded-proto") === "https" || request.url.startsWith("https://");

  response.cookies.set(SESSION_COOKIE, await createSessionToken(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd && isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

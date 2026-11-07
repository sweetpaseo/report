import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, type SessionRole } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

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
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  if (!password) {
    return NextResponse.json({ error: "Password wajib diisi." }, { status: 400 });
  }

  const adminExpected = process.env.ADMIN_PASSWORD?.trim();
  const clientExpected = process.env.CLIENT_PASSWORD?.trim();

  if ((!adminExpected || adminExpected.length < 10) && (!clientExpected || clientExpected.length < 6)) {
    return NextResponse.json({ error: "Kredensial sistem belum dikonfigurasi dengan aman." }, { status: 500 });
  }

  let role: SessionRole | null = null;
  let extraPayload: { userId?: string; name?: string; username?: string } | undefined;

  // 1. Cek login Administrator utama via ADMIN_PASSWORD
  if (adminExpected && adminExpected.length >= 10 && safeEqual(password, adminExpected)) {
    if (!username || username === "admin" || username === "administrator" || username === "superadmin") {
      role = "admin";
      extraPayload = { name: "SuperAdmin", username: username || "admin" };
    }
  }

  // 2. Cek login Client / Bos via CLIENT_PASSWORD (username 'han' atau 'client')
  if (!role && clientExpected && clientExpected.length >= 6 && safeEqual(password, clientExpected)) {
    if (!username || username === "client" || username === "han" || username === "bos") {
      role = "client";
      extraPayload = { userId: "client-han-uuid-001", name: "Han", username: username || "han" };
    }
  }

  // 3. Cek database user (staf/admin/client) berdasarkan Username atau Email
  if (!role && username) {
    const db = getDb();
    const staff = db
      .prepare(`
        SELECT id, username, name, email, password_hash, role, status
        FROM staff_users
        WHERE LOWER(username) = ? OR LOWER(email) = ?
      `)
      .get(username, username) as {
        id: string;
        username?: string;
        name: string;
        email: string;
        password_hash: string;
        role: string;
        status?: string;
      } | undefined;

    if (staff && verifyPassword(password, staff.password_hash)) {
      if (staff.status === "inactive") {
        return NextResponse.json({ error: "Akun Anda dinonaktifkan oleh Administrator." }, { status: 403 });
      }
      role = staff.role === "admin" ? "admin" : staff.role === "client" ? "client" : "staff";
      extraPayload = { userId: staff.id, name: staff.name, username: staff.username || username };
    }
  }

  // 4. Fallback jika username kosong tetapi password cocok dengan admin/client
  if (!role && !username) {
    if (adminExpected && safeEqual(password, adminExpected)) {
      role = "admin";
      extraPayload = { name: "SuperAdmin", username: "admin" };
    } else if (clientExpected && safeEqual(password, clientExpected)) {
      role = "client";
      extraPayload = { userId: "client-han-uuid-001", name: "Han", username: "han" };
    }
  }

  if (!role) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }

  resetRateLimit(`login:${clientIp}`);

  const response = NextResponse.json({
    ok: true,
    role,
    name: extraPayload?.name,
    username: extraPayload?.username,
  });
  const isProd = process.env.NODE_ENV === "production";
  const forwardedProto = request.headers.get("x-forwarded-proto") || "";
  const isHttps = forwardedProto.includes("https") || request.url.startsWith("https://");

  response.cookies.set(SESSION_COOKIE, await createSessionToken(role, extraPayload), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd && isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

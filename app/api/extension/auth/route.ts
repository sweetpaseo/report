import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { verifyExtensionToken } from "@/lib/extension-auth";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  deviceName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    const { email, password, deviceName = "Chrome Extension" } = parsed.data;
    const db = getDb();

    const staff = db
      .prepare("SELECT id, name, email, password_hash FROM staff_users WHERE LOWER(email) = ?")
      .get(email.toLowerCase()) as { id: string; name: string; email: string; password_hash: string } | undefined;

    if (!staff || !verifyPassword(password, staff.password_hash)) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    // Generate extension token
    const token = "acs_ext_" + crypto.randomBytes(32).toString("hex");
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO staff_api_tokens (token, staff_id, name, created_at, last_used_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(token, staff.id, deviceName, now, now);

    // Fetch assigned clients
    const clients = db
      .prepare(`
        SELECT c.id, c.name, c.social_handles
        FROM staff_client_assignments sca
        JOIN clients c ON c.id = sca.client_id
        WHERE sca.staff_id = ?
        ORDER BY c.name ASC
      `)
      .all(staff.id) as Array<{ id: string; name: string; social_handles: string | null }>;

    return NextResponse.json({
      ok: true,
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
      },
      clients: clients.map((c) => ({
        id: c.id,
        name: c.name,
        socialHandles: c.social_handles ? JSON.parse(c.social_handles) : {},
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Autentikasi gagal.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const staff = verifyExtensionToken(request.headers.get("authorization"));
  if (!staff) {
    return NextResponse.json({ error: "Token tidak valid atau kedaluwarsa." }, { status: 401 });
  }

  const db = getDb();
  const clients = db
    .prepare(`
      SELECT c.id, c.name, c.social_handles
      FROM staff_client_assignments sca
      JOIN clients c ON c.id = sca.client_id
      WHERE sca.staff_id = ?
      ORDER BY c.name ASC
    `)
    .all(staff.staffId) as Array<{ id: string; name: string; social_handles: string | null }>;

  return NextResponse.json({
    ok: true,
    staff,
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      socialHandles: c.social_handles ? JSON.parse(c.social_handles) : {},
    })),
  });
}


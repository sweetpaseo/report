import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { verifyExtensionToken } from "@/lib/extension-auth";

const loginSchema = z.object({
  username: z.string().trim().optional(),
  email: z.string().trim().optional(),
  password: z.string().min(1, "Password wajib diisi."),
  deviceName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });
    }

    const { username, email, password, deviceName = "Chrome Extension" } = parsed.data;
    const userIdentifier = (username || email || "").trim().toLowerCase();
    if (!userIdentifier) {
      return NextResponse.json({ error: "Username wajib diisi." }, { status: 400 });
    }

    const db = getDb();

    const staff = db
      .prepare(`
        SELECT id, username, name, email, password_hash, status
        FROM staff_users
        WHERE LOWER(username) = ? OR LOWER(email) = ?
      `)
      .get(userIdentifier, userIdentifier) as {
        id: string;
        username?: string;
        name: string;
        email: string;
        password_hash: string;
        status?: string;
      } | undefined;

    if (!staff || !verifyPassword(password, staff.password_hash)) {
      return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
    }

    if (staff.status === "inactive") {
      return NextResponse.json({ error: "Akun Anda dinonaktifkan oleh Administrator." }, { status: 403 });
    }

    // Generate extension token
    const token = "acs_ext_" + crypto.randomBytes(32).toString("hex");
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO staff_api_tokens (token, staff_id, name, created_at, last_used_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(token, staff.id, deviceName, now, now);

    // Fetch assigned clients with website domains attached
    const clients = db
      .prepare(`
        SELECT c.id, c.name, c.social_handles,
               GROUP_CONCAT(w.domain, ', ') as domains,
               GROUP_CONCAT(w.name, ', ') as website_names
        FROM staff_client_assignments sca
        JOIN clients c ON c.id = sca.client_id
        LEFT JOIN websites w ON w.client_id = c.id
        WHERE sca.staff_id = ?
        GROUP BY c.id, c.name
        ORDER BY (w.id IS NOT NULL) DESC, c.name ASC
      `)
      .all(staff.id) as Array<{
        id: string;
        name: string;
        social_handles: string | null;
        domains: string | null;
        website_names: string | null;
      }>;

    return NextResponse.json({
      ok: true,
      token,
      staff: {
        id: staff.id,
        username: staff.username || userIdentifier,
        name: staff.name,
        email: staff.email,
      },
      clients: clients.map((c) => ({
        id: c.id,
        name: c.domains ? `${c.name} (${c.domains})` : c.name,
        baseName: c.name,
        domains: c.domains ? c.domains.split(", ") : [],
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


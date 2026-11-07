import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionPayload, DEFAULT_STAFF_PERMISSIONS, UserPermissions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak. Khusus Administrator." }, { status: 403 });
  }

  const db = getDb();

  // 1. Get all staff users
  const rawUsers = db
    .prepare("SELECT id, name, email, role, status, permissions, created_at, updated_at FROM staff_users ORDER BY created_at DESC")
    .all() as Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      status: string | null;
      permissions: string | null;
      created_at: string;
      updated_at: string | null;
    }>;

  // 2. Get all clients for selection
  const allClients = db
    .prepare("SELECT id, name FROM clients ORDER BY name ASC")
    .all() as Array<{ id: string; name: string }>;

  // 3. Populate assignments for each user
  const users = rawUsers.map((u) => {
    const assignments = db
      .prepare(`
        SELECT c.id, c.name
        FROM staff_client_assignments sc
        JOIN clients c ON sc.client_id = c.id
        WHERE sc.staff_id = ?
        ORDER BY c.name ASC
      `)
      .all(u.id) as Array<{ id: string; name: string }>;

    let parsedPermissions: UserPermissions = DEFAULT_STAFF_PERMISSIONS;
    if (u.permissions) {
      try {
        parsedPermissions = { ...DEFAULT_STAFF_PERMISSIONS, ...JSON.parse(u.permissions) };
      } catch (e) {}
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status || "active",
      permissions: parsedPermissions,
      assignedClients: assignments,
      assignedClientIds: assignments.map((a) => a.id),
      created_at: u.created_at,
      updated_at: u.updated_at,
    };
  });

  return NextResponse.json({
    ok: true,
    users,
    clients: allClients,
  });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak. Khusus Administrator." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    const role = body.role === "admin" ? "admin" : "staff_social_media";
    const status = body.status === "inactive" ? "inactive" : "active";
    const permissions: UserPermissions = {
      can_view_website_hub: Boolean(body.permissions?.can_view_website_hub),
      can_view_social_hub: body.permissions?.can_view_social_hub !== undefined ? Boolean(body.permissions.can_view_social_hub) : true,
      can_edit_social: body.permissions?.can_edit_social !== undefined ? Boolean(body.permissions.can_edit_social) : true,
      can_manage_clients: Boolean(body.permissions?.can_manage_clients),
    };
    const clientIds: string[] = Array.isArray(body.clientIds) ? body.clientIds : [];

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Nama lengkap minimal 2 karakter." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Alamat email tidak valid." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const db = getDb();

    // Check if email already used
    const existing = db.prepare("SELECT id FROM staff_users WHERE LOWER(email) = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar untuk pengguna lain." }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO staff_users (id, name, email, password_hash, role, status, permissions, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name,
      email,
      passwordHash,
      role,
      status,
      JSON.stringify(permissions),
      now
    );

    // Insert client assignments
    const insertAssign = db.prepare(`
      INSERT OR IGNORE INTO staff_client_assignments (staff_id, client_id, created_at)
      VALUES (?, ?, ?)
    `);

    for (const cid of clientIds) {
      if (cid && typeof cid === "string") {
        insertAssign.run(userId, cid, now);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Pengguna ${name} berhasil dibuat.`,
      userId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal membuat pengguna.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


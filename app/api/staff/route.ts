import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  clientIds: z.array(z.string()).optional(),
});

export async function GET() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang dapat mengelola staff." }, { status: 403 });
  }

  const db = getDb();
  const staffList = db
    .prepare("SELECT id, name, email, role, created_at FROM staff_users ORDER BY created_at DESC")
    .all() as Array<{ id: string; name: string; email: string; role: string; created_at: string }>;

  const assignments = db
    .prepare(`
      SELECT sca.staff_id, sca.client_id, c.name as client_name
      FROM staff_client_assignments sca
      JOIN clients c ON c.id = sca.client_id
    `)
    .all() as Array<{ staff_id: string; client_id: string; client_name: string }>;

  const staffWithClients = staffList.map((staff) => ({
    ...staff,
    assignedClients: assignments
      .filter((a) => a.staff_id === staff.id)
      .map((a) => ({ id: a.client_id, name: a.client_name })),
  }));

  return NextResponse.json({ ok: true, staff: staffWithClients });
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang dapat menambah staff." }, { status: 403 });
  }

  try {
    const json = await request.json().catch(() => ({}));
    const parsed = createStaffSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password, clientIds = [] } = parsed.data;
    const db = getDb();

    // Check email uniqueness
    const existing = db.prepare("SELECT id FROM staff_users WHERE LOWER(email) = ?").get(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 400 });
    }

    const staffId = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO staff_users (id, name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, 'staff_social_media', ?)
    `).run(staffId, name, email.toLowerCase(), passwordHash, now);

    // Insert client assignments
    const insertAssignment = db.prepare(`
      INSERT INTO staff_client_assignments (staff_id, client_id, created_at)
      VALUES (?, ?, ?)
    `);

    for (const cid of clientIds) {
      insertAssignment.run(staffId, cid, now);
    }

    return NextResponse.json({ ok: true, id: staffId }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat staff.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang dapat menghapus staff." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get("id");
  if (!staffId) {
    return NextResponse.json({ error: "Parameter id staff diperlukan." }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM staff_users WHERE id = ?").run(staffId);
  return NextResponse.json({ ok: true });
}


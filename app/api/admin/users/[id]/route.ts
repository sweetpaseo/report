import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionPayload, UserPermissions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak. Khusus Administrator." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    let username = String(body.username || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    let email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    const role = body.role === "admin" ? "admin" : body.role === "client" ? "client" : "staff_social_media";
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

    if (!username) {
      if (email && email.includes("@")) {
        username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");
      } else {
        username = name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");
      }
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username minimal 3 karakter (huruf, angka, titik, atau garis bawah)." }, { status: 400 });
    }

    if (!email) {
      email = `${username}@erihome.id`;
    }

    const db = getDb();

    // Check user exists
    const user = db.prepare("SELECT id FROM staff_users WHERE id = ?").get(id);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Check username uniqueness if changed
    const usernameConflict = db.prepare("SELECT id FROM staff_users WHERE LOWER(username) = ? AND id != ?").get(username, id);
    if (usernameConflict) {
      return NextResponse.json({ error: "Username sudah digunakan oleh akun lain." }, { status: 400 });
    }

    // Check email uniqueness if email changed
    const emailConflict = db.prepare("SELECT id FROM staff_users WHERE LOWER(email) = ? AND id != ?").get(email, id);
    if (emailConflict) {
      return NextResponse.json({ error: "Email sudah digunakan oleh akun lain." }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (password) {
      if (password.length < 4) {
        return NextResponse.json({ error: "Password baru minimal 4 karakter." }, { status: 400 });
      }
      const passwordHash = hashPassword(password);
      db.prepare(`
        UPDATE staff_users
        SET username = ?, name = ?, email = ?, password_hash = ?, role = ?, status = ?, permissions = ?, updated_at = ?
        WHERE id = ?
      `).run(username, name, email, passwordHash, role, status, JSON.stringify(permissions), now, id);
    } else {
      db.prepare(`
        UPDATE staff_users
        SET username = ?, name = ?, email = ?, role = ?, status = ?, permissions = ?, updated_at = ?
        WHERE id = ?
      `).run(username, name, email, role, status, JSON.stringify(permissions), now, id);
    }

    // Update client assignments: delete existing then insert new
    db.prepare("DELETE FROM staff_client_assignments WHERE staff_id = ?").run(id);

    const insertAssign = db.prepare(`
      INSERT OR IGNORE INTO staff_client_assignments (staff_id, client_id, created_at)
      VALUES (?, ?, ?)
    `);

    for (const cid of clientIds) {
      if (cid && typeof cid === "string") {
        insertAssign.run(id, cid, now);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Data pengguna ${name} berhasil diperbarui.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui pengguna.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak. Khusus Administrator." }, { status: 403 });
  }

  // Prevent self-deletion if logged in with staff ID
  if (payload.userId === id) {
    return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri saat sedang login." }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare("SELECT name FROM staff_users WHERE id = ?").get(id) as { name: string } | undefined;
  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  db.prepare("DELETE FROM staff_users WHERE id = ?").run(id);

  return NextResponse.json({
    ok: true,
    message: `Pengguna ${user.name} berhasil dihapus.`,
  });
}


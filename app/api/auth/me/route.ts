import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getSessionPayload, ADMIN_PERMISSIONS, DEFAULT_STAFF_PERMISSIONS, CLIENT_VIEWER_PERMISSIONS, UserPermissions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let permissions: UserPermissions =
    payload.role === "admin"
      ? ADMIN_PERMISSIONS
      : payload.role === "client"
      ? CLIENT_VIEWER_PERMISSIONS
      : DEFAULT_STAFF_PERMISSIONS;
  let assignedClientIds: string[] = [];

  let dbUsername: string | undefined;
  let dbName: string | undefined;

  if (payload.userId) {
    const db = getDb();
    const user = db
      .prepare("SELECT username, name, permissions, status FROM staff_users WHERE id = ?")
      .get(payload.userId) as { username?: string | null; name?: string; permissions?: string | null; status?: string } | undefined;

    if (user?.status === "inactive") {
      return NextResponse.json({ error: "Akun Anda telah dinonaktifkan." }, { status: 403 });
    }

    if (user?.username) dbUsername = user.username;
    if (user?.name) dbName = user.name;

    if (user?.permissions) {
      try {
        const base = payload.role === "client" ? CLIENT_VIEWER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS;
        permissions = { ...base, ...JSON.parse(user.permissions) };
      } catch (e) {}
    }

    const assignments = db
      .prepare("SELECT client_id FROM staff_client_assignments WHERE staff_id = ?")
      .all(payload.userId) as Array<{ client_id: string }>;

    assignedClientIds = assignments.map((a) => a.client_id);
  }

  // Jika client/bos tidak memiliki pembatasan spesifik, mereka dapat melihat seluruh klien
  if (payload.role === "client" && assignedClientIds.length === 0) {
    const db = getDb();
    const allClients = db.prepare("SELECT id FROM clients").all() as Array<{ id: string }>;
    assignedClientIds = allClients.map((c) => c.id);
  }

  const finalUsername =
    dbUsername ||
    payload.username ||
    (payload.role === "admin" ? "admin" : payload.role === "client" ? "han" : "staff");

  const finalName =
    payload.role === "admin"
      ? (dbName || "SuperAdmin")
      : (dbName || payload.name || (payload.role === "client" ? "Han" : finalUsername));

  const userData = {
    id: payload.userId,
    userId: payload.userId,
    role: payload.role,
    name: finalName,
    username: finalUsername,
    permissions,
    assignedClientIds,
  };

  return NextResponse.json({
    authenticated: true,
    user: userData,
    ...userData,
  });
}

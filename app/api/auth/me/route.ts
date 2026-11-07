import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getSessionPayload, ADMIN_PERMISSIONS, DEFAULT_STAFF_PERMISSIONS, UserPermissions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let permissions: UserPermissions = payload.role === "admin" ? ADMIN_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS;
  let assignedClientIds: string[] = [];

  if (payload.role === "staff" && payload.userId) {
    const db = getDb();
    const staff = db
      .prepare("SELECT permissions, status FROM staff_users WHERE id = ?")
      .get(payload.userId) as { permissions?: string | null; status?: string } | undefined;

    if (staff?.status === "inactive") {
      return NextResponse.json({ error: "Akun Anda telah dinonaktifkan." }, { status: 403 });
    }

    if (staff?.permissions) {
      try {
        permissions = { ...DEFAULT_STAFF_PERMISSIONS, ...JSON.parse(staff.permissions) };
      } catch (e) {}
    }

    const assignments = db
      .prepare("SELECT client_id FROM staff_client_assignments WHERE staff_id = ?")
      .all(payload.userId) as Array<{ client_id: string }>;

    assignedClientIds = assignments.map((a) => a.client_id);
  }

  return NextResponse.json({
    role: payload.role,
    userId: payload.userId,
    name: payload.name,
    permissions,
    assignedClientIds,
  });
}

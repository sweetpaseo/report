import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionPayload, DEFAULT_STAFF_PERMISSIONS, UserPermissions } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const websiteId = url.searchParams.get("websiteId");
  const periodId = url.searchParams.get("periodId") || undefined;
  const comparePeriodId = url.searchParams.get("comparePeriodId") || undefined;
  if (!websiteId) return NextResponse.json({ error: "websiteId wajib diisi." }, { status: 400 });

  const db = getDb();

  // Role & Scope Check for Staff
  if (payload.role === "staff" && payload.userId) {
    const staff = db
      .prepare("SELECT permissions, status FROM staff_users WHERE id = ?")
      .get(payload.userId) as { permissions?: string | null; status?: string } | undefined;

    if (staff?.status === "inactive") {
      return NextResponse.json({ error: "Akun Anda telah dinonaktifkan." }, { status: 403 });
    }

    let permissions: UserPermissions = DEFAULT_STAFF_PERMISSIONS;
    if (staff?.permissions) {
      try {
        permissions = { ...DEFAULT_STAFF_PERMISSIONS, ...JSON.parse(staff.permissions) };
      } catch (e) {}
    }

    // 1. Check if staff is allowed to view Website Hub
    if (!permissions.can_view_website_hub) {
      return NextResponse.json(
        { error: "Akses ditolak. Anda tidak memiliki izin untuk melihat modul Website Hub." },
        { status: 403 }
      );
    }

    // 2. Check if the requested website belongs to the assigned clients
    const targetSite = db
      .prepare("SELECT client_id FROM websites WHERE id = ?")
      .get(websiteId) as { client_id: string | null } | undefined;

    if (targetSite?.client_id) {
      const isAssigned = db
        .prepare("SELECT 1 FROM staff_client_assignments WHERE staff_id = ? AND client_id = ?")
        .get(payload.userId, targetSite.client_id);

      if (!isAssigned) {
        return NextResponse.json(
          { error: "Akses ditolak. Website ini di luar lingkup klien yang ditugaskan kepada Anda." },
          { status: 403 }
        );
      }
    }
  }

  const result = getDashboard(db, websiteId, periodId, comparePeriodId);
  if (!result) return NextResponse.json({ error: "Website tidak ditemukan." }, { status: 404 });
  return NextResponse.json(result);
}

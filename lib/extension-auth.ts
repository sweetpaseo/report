import { getDb } from "@/lib/db";

export interface AuthenticatedStaff {
  staffId: string;
  name: string;
  email: string;
}

export function verifyExtensionToken(authHeader?: string | null): AuthenticatedStaff | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace(/^Bearer\s+/, "").trim();
  if (!token) return null;

  const db = getDb();
  const row = db
    .prepare(`
      SELECT t.token, s.id as staff_id, s.name, s.email
      FROM staff_api_tokens t
      JOIN staff_users s ON s.id = t.staff_id
      WHERE t.token = ?
    `)
    .get(token) as { token: string; staff_id: string; name: string; email: string } | undefined;

  if (!row) return null;

  // Update last_used_at
  try {
    db.prepare("UPDATE staff_api_tokens SET last_used_at = ? WHERE token = ?").run(
      new Date().toISOString(),
      token
    );
  } catch {
    // Ignore update error
  }

  return {
    staffId: row.staff_id,
    name: row.name,
    email: row.email,
  };
}


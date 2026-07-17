import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = request.headers.get("cookie")?.match(/whr_session=([^;]+)/)?.[1];
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  const website = db.prepare("SELECT id FROM websites WHERE id = ?").get(id) as { id: string } | undefined;
  if (!website) return NextResponse.json({ error: "Website tidak ditemukan." }, { status: 404 });

  const newToken = crypto.randomBytes(24).toString("base64url");
  db.prepare(
    "UPDATE websites SET public_token = ?, public_token_revoked = 0, public_token_expires_at = NULL WHERE id = ?"
  ).run(newToken, id);
  return NextResponse.json({ publicToken: newToken });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = request.headers.get("cookie")?.match(/whr_session=([^;]+)/)?.[1];
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  const website = db.prepare("SELECT id FROM websites WHERE id = ?").get(id) as { id: string } | undefined;
  if (!website) return NextResponse.json({ error: "Website tidak ditemukan." }, { status: 404 });

  // Revoke without rotating: existing token is invalidated but kept for audit.
  db.prepare("UPDATE websites SET public_token_revoked = 1 WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}

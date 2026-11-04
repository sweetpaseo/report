import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getTebarAccounts } from "@/lib/tebar";

const linkSchema = z.object({
  clientId: z.string().min(1),
  tebarAccountId: z.string().min(1),
  platform: z.string().min(1),
  accountName: z.string().min(1),
  username: z.string().optional(),
  profilePicture: z.string().optional(),
});

export async function GET(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const db = getDb();

  let linkedAccounts;
  if (clientId) {
    linkedAccounts = db
      .prepare("SELECT * FROM client_social_accounts WHERE client_id = ? ORDER BY created_at DESC")
      .all(clientId);
  } else {
    linkedAccounts = db
      .prepare("SELECT * FROM client_social_accounts ORDER BY created_at DESC")
      .all();
  }

  // Also pull live accounts from Tebar
  const tebarRes = await getTebarAccounts().catch(() => ({ data: [] }));

  return NextResponse.json({
    ok: true,
    linkedAccounts,
    tebarAccounts: tebarRes.data,
  });
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json().catch(() => ({}));
    const parsed = linkSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { clientId, tebarAccountId, platform, accountName, username, profilePicture } = parsed.data;
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO client_social_accounts (id, client_id, tebar_account_id, platform, account_name, username, profile_picture, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(client_id, tebar_account_id) DO UPDATE SET
        account_name = excluded.account_name,
        username = excluded.username,
        profile_picture = excluded.profile_picture
    `).run(id, clientId, tebarAccountId, platform, accountName, username || null, profilePicture || null, now);

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menautkan akun.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Parameter id diperlukan." }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM client_social_accounts WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}


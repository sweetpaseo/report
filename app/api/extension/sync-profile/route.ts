import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyExtensionToken } from "@/lib/extension-auth";

const syncProfileSchema = z.object({
  clientId: z.string().min(1),
  platform: z.enum(["instagram", "tiktok", "facebook", "threads", "youtube"]),
  username: z.string().trim().min(1),
  fullName: z.string().optional(),
  followersCount: z.number().int().nonnegative().default(0),
  followingCount: z.number().int().nonnegative().default(0),
  postsCount: z.number().int().nonnegative().default(0),
  bio: z.string().optional(),
  profilePicUrl: z.string().optional(),
});

export async function POST(request: Request) {
  const staff = verifyExtensionToken(request.headers.get("authorization"));
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json().catch(() => ({}));
    const parsed = syncProfileSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const db = getDb();

    // Verify staff has access to this client
    const assignment = db
      .prepare("SELECT staff_id FROM staff_client_assignments WHERE staff_id = ? AND client_id = ?")
      .get(staff.staffId, data.clientId);

    if (!assignment) {
      return NextResponse.json({ error: "Akses ditolak. Anda tidak ditugaskan ke klien ini." }, { status: 403 });
    }

    const snapshotId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO social_profile_snapshots (
        id, client_id, platform, username, full_name,
        followers_count, following_count, posts_count,
        bio, profile_pic_url, synced_by_staff_id, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      snapshotId,
      data.clientId,
      data.platform,
      data.username.replace(/^@/, ""),
      data.fullName || null,
      data.followersCount,
      data.followingCount,
      data.postsCount,
      data.bio || null,
      data.profilePicUrl || null,
      staff.staffId,
      now
    );

    // Update social_handles in clients table with multi-branch support
    const client = db.prepare("SELECT social_handles FROM clients WHERE id = ?").get(data.clientId) as { social_handles: string | null } | undefined;
    let handles: Record<string, any> = {};
    if (client?.social_handles) {
      try {
        handles = JSON.parse(client.social_handles);
      } catch {}
    }

    const cleanUsername = data.username.replace(/^@/, "");
    let branchList: string[] = [];
    if (Array.isArray(handles[data.platform])) {
      branchList = handles[data.platform];
    } else if (typeof handles[data.platform] === "string" && handles[data.platform]) {
      branchList = [handles[data.platform]];
    }
    if (!branchList.includes(cleanUsername)) {
      branchList.push(cleanUsername);
    }
    handles[data.platform] = branchList;
    handles[`${data.platform}_latest`] = cleanUsername;

    db.prepare("UPDATE clients SET social_handles = ? WHERE id = ?").run(
      JSON.stringify(handles),
      data.clientId
    );

    return NextResponse.json({
      ok: true,
      snapshotId,
      syncedAt: now,
      message: `Profil @${data.username} berhasil disinkronkan.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menyimpan snapshot profil.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


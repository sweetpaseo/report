import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyExtensionToken } from "@/lib/extension-auth";

const postItemSchema = z.object({
  postId: z.string().min(1),
  postUrl: z.string().optional(),
  caption: z.string().optional(),
  mediaType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  likesCount: z.number().int().nonnegative().default(0),
  commentsCount: z.number().int().nonnegative().default(0),
  sharesCount: z.number().int().nonnegative().default(0),
  postedAt: z.string().optional(),
});

const syncPostsSchema = z.object({
  clientId: z.string().min(1),
  platform: z.enum(["instagram", "tiktok", "facebook", "threads", "youtube"]),
  posts: z.array(postItemSchema).min(1),
});

export async function POST(request: Request) {
  const staff = verifyExtensionToken(request.headers.get("authorization"));
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json().catch(() => ({}));
    const parsed = syncPostsSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { clientId, platform, posts } = parsed.data;
    const db = getDb();

    // Verify staff has access to this client
    const assignment = db
      .prepare("SELECT staff_id FROM staff_client_assignments WHERE staff_id = ? AND client_id = ?")
      .get(staff.staffId, clientId);

    if (!assignment) {
      return NextResponse.json({ error: "Akses ditolak. Anda tidak ditugaskan ke klien ini." }, { status: 403 });
    }

    const now = new Date().toISOString();
    const upsertStmt = db.prepare(`
      INSERT INTO social_posts_cache (
        id, client_id, platform, post_id, post_url,
        caption, media_type, thumbnail_url,
        likes_count, comments_count, shares_count,
        posted_at, engagement_score, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(client_id, platform, post_id) DO UPDATE SET
        likes_count = excluded.likes_count,
        comments_count = excluded.comments_count,
        shares_count = excluded.shares_count,
        engagement_score = excluded.engagement_score,
        synced_at = excluded.synced_at
    `);

    let savedCount = 0;
    for (const post of posts) {
      const id = crypto.randomUUID();
      // Calculate engagement score: 1 point per like, 2 per comment, 3 per share
      const engagementScore = post.likesCount + post.commentsCount * 2 + post.sharesCount * 3;

      upsertStmt.run(
        id,
        clientId,
        platform,
        post.postId,
        post.postUrl || null,
        post.caption || null,
        post.mediaType || "photo",
        post.thumbnailUrl || null,
        post.likesCount,
        post.commentsCount,
        post.sharesCount,
        post.postedAt || now,
        engagementScore,
        now
      );
      savedCount++;
    }

    return NextResponse.json({
      ok: true,
      count: savedCount,
      syncedAt: now,
      message: `${savedCount} postingan berhasil disinkronkan.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menyimpan postingan.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getTebarPosts, createTebarPost } from "@/lib/tebar";

const createPostSchema = z.object({
  content: z.string().trim().min(1, "Konten postingan tidak boleh kosong."),
  accountIds: z.array(z.string().min(1)).min(1, "Pilih minimal satu akun tujuan."),
  scheduledAt: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export async function GET(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") || undefined;
    const status = searchParams.get("status") || undefined;
    const limit = Number(searchParams.get("limit")) || 30;

    const res = await getTebarPosts({ accountId, status, limit });
    return NextResponse.json({ ok: true, posts: res.data, nextCursor: res.next_cursor });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil daftar postingan.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json().catch(() => ({}));
    const parsed = createPostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const post = await createTebarPost(parsed.data);
    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat postingan di Tebar.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


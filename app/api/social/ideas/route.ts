import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getTebarIdeas, createTebarIdea } from "@/lib/tebar";

const createIdeaSchema = z.object({
  text: z.string().trim().min(2, "Teks ide konten minimal 2 karakter."),
  columnId: z.string().optional(),
});

export async function GET() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await getTebarIdeas();
    return NextResponse.json({ ok: true, ideas: res.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil ide konten.";
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
    const parsed = createIdeaSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const idea = await createTebarIdea(parsed.data.text, parsed.data.columnId);
    return NextResponse.json({ ok: true, idea }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan ide konten.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { syncGoogleDataForWebsite } from "@/lib/sync-google-data";

const schema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal mulai harus berformat YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal akhir harus berformat YYYY-MM-DD"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat melakukan Sync Data Google API" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Rentang tanggal tidak valid" },
      { status: 400 }
    );
  }

  const result = await syncGoogleDataForWebsite({
    websiteId: id,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Gagal sinkronisasi data dari Google API" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Berhasil menarik data dari Google API!",
    periodId: result.periodId,
    gscSynced: result.gscSynced,
    gaSynced: result.gaSynced,
  });
}

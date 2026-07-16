import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import fs from "fs";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(token);
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: periodId } = await params;
  if (!periodId) {
    return NextResponse.json({ error: "Missing periodId" }, { status: 400 });
  }

  const db = getDb();
  
  // Find uploads related to this period to delete files
  const uploads = db.prepare("SELECT id, storage_path FROM report_uploads WHERE report_period_id = ?").all(periodId) as any[];

  try {
    db.exec("BEGIN");
    db.prepare("DELETE FROM gsc_daily_metrics WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM gsc_queries WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM gsc_pages WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM gsc_devices WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM gsc_countries WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM gsc_appearance WHERE report_period_id = ?").run(periodId);

    db.prepare("DELETE FROM ga_daily_metrics WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM ga_channels WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM ga_pages WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM ga_events WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM ga_cities WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM ga_device_models WHERE report_period_id = ?").run(periodId);

    db.prepare("DELETE FROM monthly_metrics WHERE report_period_id = ?").run(periodId);

    db.prepare("DELETE FROM report_uploads WHERE report_period_id = ?").run(periodId);
    db.prepare("DELETE FROM report_periods WHERE id = ?").run(periodId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }

  // Try to remove files
  for (const upload of uploads) {
    try {
      if (fs.existsSync(upload.storage_path)) {
        fs.unlinkSync(upload.storage_path);
      }
    } catch (e) {
      console.error("Failed to delete file:", upload.storage_path);
    }
  }

  return NextResponse.json({ ok: true });
}

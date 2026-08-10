import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { checkpointDb, getDb } from "@/lib/db";

export async function GET() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat mengekspor backup" }, { status: 403 });
  }

  try {
    checkpointDb();
    const db = getDb();

    const systemSettings = db.prepare("SELECT key, value, updated_at FROM system_settings").all();
    const clients = db.prepare("SELECT * FROM clients").all();
    const websites = db.prepare("SELECT * FROM websites").all();

    const backupData = {
      app: "Website Health Report",
      version: "1.0",
      exported_at: new Date().toISOString(),
      system_settings: systemSettings,
      clients: clients,
      websites: websites,
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `whr-backup-${dateStr}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Gagal membuat backup: ${err.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat mengimpor backup" }, { status: 403 });
  }

  try {
    const payload = await request.json();

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Format file backup tidak valid" }, { status: 400 });
    }

    const { system_settings, clients, websites } = payload;

    if (!Array.isArray(system_settings) && !Array.isArray(websites)) {
      return NextResponse.json({ error: "Isi file backup tidak mengandung data sistem atau website yang valid" }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();
    let settingsCount = 0;
    let clientsCount = 0;
    let websitesCount = 0;

    // Transaction for atomic restore
    db.exec("BEGIN TRANSACTION;");

    try {
      if (Array.isArray(system_settings)) {
        const stmtSetting = db.prepare(`
          INSERT INTO system_settings (key, value, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `);
        for (const s of system_settings) {
          if (s.key && s.value) {
            stmtSetting.run(s.key, s.value, s.updated_at || now);
            settingsCount++;
          }
        }
      }

      if (Array.isArray(clients)) {
        const stmtClient = db.prepare(`
          INSERT INTO clients (id, name, public_token, created_at, public_token_expires_at, public_token_revoked)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            public_token = excluded.public_token,
            public_token_expires_at = excluded.public_token_expires_at,
            public_token_revoked = excluded.public_token_revoked
        `);
        for (const c of clients) {
          if (c.id && c.name && c.public_token) {
            stmtClient.run(
              c.id,
              c.name,
              c.public_token,
              c.created_at || now,
              c.public_token_expires_at || null,
              c.public_token_revoked || 0
            );
            clientsCount++;
          }
        }
      }

      if (Array.isArray(websites)) {
        const stmtWebsite = db.prepare(`
          INSERT INTO websites (
            id, name, domain, timezone, public_token, client_id, created_at,
            public_token_expires_at, public_token_revoked, gsc_site_url, ga_property_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            domain = excluded.domain,
            timezone = excluded.timezone,
            public_token = excluded.public_token,
            client_id = excluded.client_id,
            public_token_expires_at = excluded.public_token_expires_at,
            public_token_revoked = excluded.public_token_revoked,
            gsc_site_url = excluded.gsc_site_url,
            ga_property_id = excluded.ga_property_id
        `);
        for (const w of websites) {
          if (w.id && w.name && w.domain && w.public_token) {
            stmtWebsite.run(
              w.id,
              w.name,
              w.domain,
              w.timezone || "Asia/Jakarta",
              w.public_token,
              w.client_id || null,
              w.created_at || now,
              w.public_token_expires_at || null,
              w.public_token_revoked || 0,
              w.gsc_site_url || null,
              w.ga_property_id || null
            );
            websitesCount++;
          }
        }
      }

      db.exec("COMMIT;");
      checkpointDb();
    } catch (txErr: any) {
      db.exec("ROLLBACK;");
      throw txErr;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor data backup: ${settingsCount} pengaturan sistem, ${clientsCount} klien, ${websitesCount} website dipulihkan.`,
      counts: { settingsCount, clientsCount, websitesCount },
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Gagal mengimpor backup: ${err.message}` }, { status: 500 });
  }
}

import crypto from "node:crypto";
import { getDb } from "../lib/db";
import { hashPassword } from "../lib/password";
import { DEFAULT_STAFF_PERMISSIONS } from "../lib/auth";

async function main() {
  const db = getDb();
  console.log("Seeding clients & staff users...");

  // 1. Pastikan Klien 'Erihome' ada
  let erihomeClient = db.prepare("SELECT id, name FROM clients WHERE LOWER(name) LIKE '%erihome%' OR LOWER(name) LIKE '%portofolio utama%'").get() as { id: string; name: string } | undefined;
  if (erihomeClient) {
    db.prepare("UPDATE clients SET name = 'Erihome' WHERE id = ?").run(erihomeClient.id);
    console.log(`Updated client ${erihomeClient.id} name to 'Erihome'`);
  } else {
    const newId = crypto.randomUUID();
    const token = "c_" + crypto.randomBytes(16).toString("hex");
    db.prepare("INSERT INTO clients (id, name, public_token, created_at) VALUES (?, ?, ?, ?)").run(
      newId,
      "Erihome",
      token,
      new Date().toISOString()
    );
    erihomeClient = { id: newId, name: "Erihome" };
    console.log(`Created client 'Erihome' with id ${newId}`);
  }

  // 2. Pastikan Klien 'Kurnia Printing' ada
  let kurniaClient = db.prepare("SELECT id, name FROM clients WHERE LOWER(name) LIKE '%kurnia%'").get() as { id: string; name: string } | undefined;
  if (!kurniaClient) {
    const newId = crypto.randomUUID();
    const token = "c_" + crypto.randomBytes(16).toString("hex");
    db.prepare("INSERT INTO clients (id, name, public_token, created_at) VALUES (?, ?, ?, ?)").run(
      newId,
      "Kurnia Printing",
      token,
      new Date().toISOString()
    );
    kurniaClient = { id: newId, name: "Kurnia Printing" };
    console.log(`Created client 'Kurnia Printing' with id ${newId}`);
  } else {
    console.log(`Found client 'Kurnia Printing' with id ${kurniaClient.id}`);
  }

  // 3. Update websites client_id
  db.prepare("UPDATE websites SET client_id = ? WHERE domain LIKE '%erihome%'").run(erihomeClient.id);
  db.prepare("UPDATE websites SET client_id = ? WHERE domain LIKE '%kurnia%'").run(kurniaClient.id);
  console.log("Updated website client associations.");

  // Ensure username column exists
  try {
    db.exec("ALTER TABLE staff_users ADD COLUMN username TEXT;");
  } catch (e) {}
  try {
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_users_username ON staff_users(username);");
  } catch (e) {}

  // 4. Staff 1: username 'kurnia' (Kurnia Printing)
  const staffKurniaUsername = "kurnia";
  const staffKurniaEmail = "staff.kurnia@erihome.id";
  const staffKurniaPass = hashPassword("staff1234");
  const staffKurniaPermissions = JSON.stringify(DEFAULT_STAFF_PERMISSIONS);

  let staffKurnia = db.prepare("SELECT id FROM staff_users WHERE LOWER(username) = ? OR LOWER(email) = ?").get(staffKurniaUsername, staffKurniaEmail) as { id: string } | undefined;
  let staffKurniaId = staffKurnia?.id;

  if (staffKurniaId) {
    db.prepare(`
      UPDATE staff_users 
      SET username = ?, name = 'Staff Kurnia Printing', password_hash = ?, role = 'staff_social_media', status = 'active', permissions = ?, updated_at = ?
      WHERE id = ?
    `).run(staffKurniaUsername, staffKurniaPass, staffKurniaPermissions, new Date().toISOString(), staffKurniaId);
    console.log(`Updated existing user ${staffKurniaUsername} (${staffKurniaEmail})`);
  } else {
    staffKurniaId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO staff_users (id, username, name, email, password_hash, role, status, permissions, created_at)
      VALUES (?, ?, ?, ?, ?, 'staff_social_media', 'active', ?, ?)
    `).run(staffKurniaId, staffKurniaUsername, "Staff Kurnia Printing", staffKurniaEmail, staffKurniaPass, staffKurniaPermissions, new Date().toISOString());
    console.log(`Created new staff user @${staffKurniaUsername} with id ${staffKurniaId}`);
  }

  // Re-assign staff Kurnia ONLY to Kurnia Printing
  db.prepare("DELETE FROM staff_client_assignments WHERE staff_id = ?").run(staffKurniaId);
  db.prepare("INSERT INTO staff_client_assignments (staff_id, client_id, created_at) VALUES (?, ?, ?)").run(
    staffKurniaId,
    kurniaClient.id,
    new Date().toISOString()
  );
  console.log(`Assigned @${staffKurniaUsername} -> Kurnia Printing (${kurniaClient.id})`);

  // 5. Staff 2: username 'erihome' (Erihome)
  const staffErihomeUsername = "erihome";
  const staffErihomeEmail = "staff.social@erihome.id";
  const staffErihomePass = hashPassword("staff1234");
  const staffErihomePermissions = JSON.stringify(DEFAULT_STAFF_PERMISSIONS);

  let staffErihome = db.prepare("SELECT id FROM staff_users WHERE LOWER(username) = ? OR LOWER(email) = ?").get(staffErihomeUsername, staffErihomeEmail) as { id: string } | undefined;
  let staffErihomeId = staffErihome?.id;

  if (staffErihomeId) {
    db.prepare(`
      UPDATE staff_users 
      SET username = ?, name = 'Budi Santoso (Erihome)', password_hash = ?, role = 'staff_social_media', status = 'active', permissions = ?, updated_at = ?
      WHERE id = ?
    `).run(staffErihomeUsername, staffErihomePass, staffErihomePermissions, new Date().toISOString(), staffErihomeId);
    console.log(`Updated existing user ${staffErihomeUsername} (${staffErihomeEmail})`);
  } else {
    staffErihomeId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO staff_users (id, username, name, email, password_hash, role, status, permissions, created_at)
      VALUES (?, ?, ?, ?, ?, 'staff_social_media', 'active', ?, ?)
    `).run(staffErihomeId, staffErihomeUsername, "Budi Santoso (Erihome)", staffErihomeEmail, staffErihomePass, staffErihomePermissions, new Date().toISOString());
    console.log(`Created new staff user @${staffErihomeUsername} with id ${staffErihomeId}`);
  }

  // Re-assign staff Erihome ONLY to Erihome
  db.prepare("DELETE FROM staff_client_assignments WHERE staff_id = ?").run(staffErihomeId);
  db.prepare("INSERT INTO staff_client_assignments (staff_id, client_id, created_at) VALUES (?, ?, ?)").run(
    staffErihomeId,
    erihomeClient.id,
    new Date().toISOString()
  );
  console.log(`Assigned @${staffErihomeUsername} -> Erihome (${erihomeClient.id})`);

  // 6. User Bos / Eksekutif: username 'han' (Pemeriksa Laporan)
  const hanUsername = "han";
  const hanEmail = "han@erihome.id";
  const hanPass = hashPassword("han1234");
  const hanPermissions = JSON.stringify({
    can_view_website_hub: true,
    can_view_social_hub: true,
    can_edit_social: false,
    can_manage_clients: false,
  });

  let hanUser = db.prepare("SELECT id FROM staff_users WHERE LOWER(username) = ? OR LOWER(email) = ?").get(hanUsername, hanEmail) as { id: string } | undefined;
  let hanUserId = hanUser ? hanUser.id : "client-han-uuid-001";

  if (hanUser) {
    db.prepare(`
      UPDATE staff_users 
      SET username = ?, name = 'Han (Pemeriksa Laporan)', password_hash = ?, role = 'client', status = 'active', permissions = ?, updated_at = ?
      WHERE id = ?
    `).run(hanUsername, hanPass, hanPermissions, new Date().toISOString(), hanUserId);
    console.log(`Updated existing user @${hanUsername}`);
  } else {
    db.prepare(`
      INSERT INTO staff_users (id, username, name, email, password_hash, role, status, permissions, created_at)
      VALUES (?, ?, 'Han (Pemeriksa Laporan)', ?, ?, 'client', 'active', ?, ?)
    `).run(hanUserId, hanUsername, hanEmail, hanPass, hanPermissions, new Date().toISOString());
    console.log(`Created new boss/client user @${hanUsername} with id ${hanUserId}`);
  }

  // Assign Han to all clients
  db.prepare("DELETE FROM staff_client_assignments WHERE staff_id = ?").run(hanUserId);
  const allClients = db.prepare("SELECT id FROM clients").all() as Array<{ id: string }>;
  for (const c of allClients) {
    db.prepare("INSERT INTO staff_client_assignments (staff_id, client_id, created_at) VALUES (?, ?, ?)").run(
      hanUserId,
      c.id,
      new Date().toISOString()
    );
  }
  console.log(`Assigned @${hanUsername} -> All Clients (${allClients.length} clients)`);

  console.log("Seeding completed successfully!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});


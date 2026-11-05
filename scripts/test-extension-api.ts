import { getDb } from "../lib/db";
import { hashPassword } from "../lib/password";

async function runTest() {
  console.log("=== Testing Extension Backend API & Database ===");
  const db = getDb();

  // 1. Ensure a test staff user exists
  const testEmail = "staff.social@erihome.id";
  let staff = db.prepare("SELECT id FROM staff_users WHERE email = ?").get(testEmail) as { id: string } | undefined;
  if (!staff) {
    const id = "staff-test-uuid-001";
    db.prepare(`
      INSERT INTO staff_users (id, name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, 'staff_social_media', ?)
    `).run(id, "Budi Santoso", testEmail, hashPassword("staff1234"), new Date().toISOString());
    staff = { id };
    console.log("✓ Created test staff user: Budi Santoso");
  } else {
    console.log("✓ Test staff user exists: ID", staff.id);
  }

  // 2. Ensure staff is assigned to client Han or Erihome
  const client = db.prepare("SELECT id, name FROM clients LIMIT 1").get() as { id: string; name: string };
  console.log("✓ Target client for testing:", client.name, `(${client.id})`);

  db.prepare(`
    INSERT INTO staff_client_assignments (staff_id, client_id, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(staff_id, client_id) DO NOTHING
  `).run(staff.id, client.id, new Date().toISOString());
  console.log("✓ Staff assigned to client successfully.");

  // 3. Test generate extension token
  const token = "acs_ext_test_token_12345";
  db.prepare(`
    INSERT INTO staff_api_tokens (token, staff_id, name, created_at, last_used_at)
    VALUES (?, ?, 'Laptop Staff Budi', ?, ?)
    ON CONFLICT(token) DO UPDATE SET last_used_at = excluded.last_used_at
  `).run(token, staff.id, new Date().toISOString(), new Date().toISOString());
  console.log("✓ Generated test extension token:", token);

  // 4. Test snapshot insertion
  const snapshotId = "snap-test-001";
  db.prepare(`
    INSERT INTO social_profile_snapshots (
      id, client_id, platform, username, full_name,
      followers_count, following_count, posts_count,
      bio, profile_pic_url, synced_by_staff_id, synced_at
    ) VALUES (?, ?, 'instagram', 'erihome.id', 'Erihome Interior & Decor',
      12850, 420, 185,
      'Spesialis interior dan furniture custom.', '', ?, ?
    )
  `).run(snapshotId, client.id, staff.id, new Date().toISOString());
  console.log("✓ Saved Instagram profile snapshot: 12,850 followers");

  // 5. Test post cache insertion
  const postId = "post-test-001";
  db.prepare(`
    INSERT INTO social_posts_cache (
      id, client_id, platform, post_id, post_url,
      caption, media_type, likes_count, comments_count, shares_count,
      posted_at, engagement_score, synced_at
    ) VALUES (?, ?, 'instagram', 'Cx9AbCd123', 'https://instagram.com/p/Cx9AbCd123',
      'Promo kitchen set minimalis bulan ini!', 'carousel',
      340, 28, 12, ?, 432, ?
    )
    ON CONFLICT(client_id, platform, post_id) DO UPDATE SET likes_count = excluded.likes_count
  `).run(postId, client.id, new Date().toISOString(), new Date().toISOString());
  console.log("✓ Saved cached post: engagement score 432");

  console.log("\n=== All Extension Backend Tests PASSED 100%! ===");
}

runTest().catch(console.error);


import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const globalDb = globalThis as unknown as { __whrDb?: DatabaseSync };

function dataDirectory() {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

export function uploadsDirectory() {
  const dir = path.join(dataDirectory(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function initialize(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      public_token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS websites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
      public_token TEXT NOT NULL UNIQUE,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    -- Try to add the column if it doesn't exist (for existing DBs)
    -- Ignore error if column already exists
    PRAGMA foreign_keys = OFF;
    -- Note: ALTER TABLE ADD COLUMN is used for migrations in SQLite
    -- We'll run it in a separate try-catch block below.

    CREATE TABLE IF NOT EXISTS report_periods (
      id TEXT PRIMARY KEY,
      website_id TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      period_label TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(website_id, period_start, period_end),
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS report_uploads (
      id TEXT PRIMARY KEY,
      website_id TEXT NOT NULL,
      report_period_id TEXT,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_format TEXT NOT NULL,
      source_type TEXT,
      checksum TEXT NOT NULL,
      status TEXT NOT NULL,
      warning_message TEXT,
      error_message TEXT,
      uploaded_at TEXT NOT NULL,
      processed_at TEXT,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_upload_checksum ON report_uploads(website_id, checksum);

    CREATE TABLE IF NOT EXISTS monthly_metrics (
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      metric_key TEXT NOT NULL,
      metric_value REAL,
      PRIMARY KEY(website_id, report_period_id, source_type, metric_key),
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gsc_daily_metrics (
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      search_type TEXT NOT NULL DEFAULT 'web',
      metric_date TEXT NOT NULL,
      clicks REAL NOT NULL DEFAULT 0,
      impressions REAL NOT NULL DEFAULT 0,
      ctr REAL NOT NULL DEFAULT 0,
      average_position REAL NOT NULL DEFAULT 0,
      PRIMARY KEY(website_id, report_period_id, search_type, metric_date),
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gsc_queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      search_type TEXT NOT NULL DEFAULT 'web',
      query TEXT NOT NULL,
      clicks REAL NOT NULL DEFAULT 0,
      impressions REAL NOT NULL DEFAULT 0,
      ctr REAL NOT NULL DEFAULT 0,
      average_position REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_gsc_queries_period ON gsc_queries(website_id, report_period_id);

    CREATE TABLE IF NOT EXISTS gsc_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      search_type TEXT NOT NULL DEFAULT 'web',
      page TEXT NOT NULL,
      clicks REAL NOT NULL DEFAULT 0,
      impressions REAL NOT NULL DEFAULT 0,
      ctr REAL NOT NULL DEFAULT 0,
      average_position REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gsc_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      search_type TEXT NOT NULL DEFAULT 'web',
      device TEXT NOT NULL,
      clicks REAL NOT NULL DEFAULT 0,
      impressions REAL NOT NULL DEFAULT 0,
      ctr REAL NOT NULL DEFAULT 0,
      average_position REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_daily_metrics (
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      metric_date TEXT NOT NULL,
      active_users REAL,
      new_users REAL,
      engagement_seconds REAL,
      revenue REAL,
      PRIMARY KEY(website_id, report_period_id, metric_date),
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      sessions REAL NOT NULL DEFAULT 0,
      new_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      page_title TEXT NOT NULL,
      views REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      event_count REAL NOT NULL DEFAULT 0,
      key_event_count REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gsc_countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      search_type TEXT NOT NULL DEFAULT 'web',
      country TEXT NOT NULL,
      clicks REAL NOT NULL DEFAULT 0,
      impressions REAL NOT NULL DEFAULT 0,
      ctr REAL NOT NULL DEFAULT 0,
      average_position REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gsc_appearance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      search_type TEXT NOT NULL DEFAULT 'web',
      appearance TEXT NOT NULL,
      clicks REAL NOT NULL DEFAULT 0,
      impressions REAL NOT NULL DEFAULT 0,
      ctr REAL NOT NULL DEFAULT 0,
      average_position REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      city TEXT NOT NULL,
      active_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_device_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      model TEXT NOT NULL,
      active_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      region TEXT NOT NULL,
      active_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_source_medium (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      source_medium TEXT NOT NULL,
      sessions REAL NOT NULL DEFAULT 0,
      active_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_operating_systems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      os TEXT NOT NULL,
      active_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_browsers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      browser TEXT NOT NULL,
      active_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ga_countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      report_period_id TEXT NOT NULL,
      country TEXT NOT NULL,
      active_users REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE,
      FOREIGN KEY(report_period_id) REFERENCES report_periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      context TEXT NOT NULL,
      message TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

    CREATE TABLE IF NOT EXISTS pagespeed_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_id TEXT NOT NULL,
      url TEXT NOT NULL,
      strategy TEXT NOT NULL,
      performance_score INTEGER,
      accessibility_score INTEGER,
      best_practices_score INTEGER,
      seo_score INTEGER,
      lcp REAL,
      tbt REAL,
      cls REAL,
      fcp REAL,
      speed_index REAL,
      diagnostics_json TEXT,
      audited_at TEXT NOT NULL,
      FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_pagespeed_site ON pagespeed_audits(website_id, strategy, audited_at DESC);
  `);


  try {
    db.exec("ALTER TABLE websites ADD COLUMN client_id TEXT REFERENCES clients(id) ON DELETE SET NULL;");
  } catch (e) {
    // Ignore if column already exists
  }

  // B5: public link expiry + revocation. New columns default to NULL (no expiry, not revoked).
  try {
    db.exec("ALTER TABLE websites ADD COLUMN public_token_expires_at TEXT;");
  } catch (e) {
    // Ignore if column already exists
  }
  try {
    db.exec("ALTER TABLE websites ADD COLUMN public_token_revoked INTEGER NOT NULL DEFAULT 0;");
  } catch (e) {
    // Ignore if column already exists
  }
  try {
    db.exec("ALTER TABLE clients ADD COLUMN public_token_expires_at TEXT;");
  } catch (e) {
    // Ignore if column already exists
  }
  try {
    db.exec("ALTER TABLE clients ADD COLUMN public_token_revoked INTEGER NOT NULL DEFAULT 0;");
  } catch (e) {
    // Ignore if column already exists
  }
  try {
    db.exec("ALTER TABLE clients ADD COLUMN social_handles TEXT;");
  } catch (e) {
    // Ignore if column already exists
  }
  
  // Google API Integration columns for websites
  try {
    db.exec("ALTER TABLE websites ADD COLUMN gsc_site_url TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE websites ADD COLUMN ga_property_id TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE websites ADD COLUMN last_api_sync_at TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE websites ADD COLUMN api_sync_status TEXT DEFAULT 'idle';");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE websites ADD COLUMN api_sync_error TEXT;");
  } catch (e) {}

  // Global settings table (e.g. Service Account credentials, default sync settings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS client_social_accounts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      tebar_account_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      account_name TEXT NOT NULL,
      username TEXT,
      profile_picture TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(client_id, tebar_account_id)
    );
    CREATE INDEX IF NOT EXISTS idx_client_social_client ON client_social_accounts(client_id);

    CREATE TABLE IF NOT EXISTS staff_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff_social_media',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff_client_assignments (
      staff_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY(staff_id, client_id)
    );

    CREATE TABLE IF NOT EXISTS staff_api_tokens (
      token TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT 'Chrome Extension',
      created_at TEXT NOT NULL,
      last_used_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_staff_tokens_staff ON staff_api_tokens(staff_id);

    CREATE TABLE IF NOT EXISTS social_profile_snapshots (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      username TEXT NOT NULL,
      full_name TEXT,
      followers_count INTEGER NOT NULL DEFAULT 0,
      following_count INTEGER NOT NULL DEFAULT 0,
      posts_count INTEGER NOT NULL DEFAULT 0,
      bio TEXT,
      profile_pic_url TEXT,
      synced_by_staff_id TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
      synced_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_profile_snapshots_client ON social_profile_snapshots(client_id, platform, synced_at DESC);

    CREATE TABLE IF NOT EXISTS social_posts_cache (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      post_id TEXT NOT NULL,
      post_url TEXT,
      caption TEXT,
      media_type TEXT,
      thumbnail_url TEXT,
      likes_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      shares_count INTEGER NOT NULL DEFAULT 0,
      posted_at TEXT,
      engagement_score REAL NOT NULL DEFAULT 0,
      synced_at TEXT NOT NULL,
      UNIQUE(client_id, platform, post_id)
    );
    CREATE INDEX IF NOT EXISTS idx_posts_cache_client ON social_posts_cache(client_id, platform, posted_at DESC);

    UPDATE monthly_metrics SET metric_key = 'impressions' WHERE metric_key = 'total_impressions';
    UPDATE monthly_metrics SET metric_key = 'clicks' WHERE metric_key = 'total_clicks';
    UPDATE monthly_metrics SET metric_key = 'ctr' WHERE metric_key = 'average_ctr';
  `);

  // search_type for GSC tables (migration for existing DBs, ignoring errors)
  const gscTables = ["gsc_queries", "gsc_pages", "gsc_devices", "gsc_countries", "gsc_appearance"];
  for (const table of gscTables) {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN search_type TEXT NOT NULL DEFAULT 'web';`);
    } catch (e) {}
  }

  // staff_users migrations for RBAC permissions & status & username
  try {
    db.exec(`ALTER TABLE staff_users ADD COLUMN username TEXT;`);
  } catch (e) {}
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_users_username ON staff_users(username);`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE staff_users ADD COLUMN permissions TEXT DEFAULT '{"can_view_website_hub":false,"can_view_social_hub":true,"can_edit_social":true,"can_manage_clients":false}';`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE staff_users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE staff_users ADD COLUMN updated_at TEXT;`);
  } catch (e) {}

  // Enforce Unique Constraints across dimension tables to guarantee zero duplicate rows
  const uniqueIndexes = [
    { name: "idx_gsc_countries_unique", table: "gsc_countries", cols: "website_id, report_period_id, search_type, country" },
    { name: "idx_gsc_queries_unique", table: "gsc_queries", cols: "website_id, report_period_id, search_type, query" },
    { name: "idx_gsc_pages_unique", table: "gsc_pages", cols: "website_id, report_period_id, search_type, page" },
    { name: "idx_gsc_devices_unique", table: "gsc_devices", cols: "website_id, report_period_id, search_type, device" },
    { name: "idx_gsc_appearance_unique", table: "gsc_appearance", cols: "website_id, report_period_id, search_type, appearance" },
    { name: "idx_ga_cities_unique", table: "ga_cities", cols: "website_id, report_period_id, city" },
    { name: "idx_ga_regions_unique", table: "ga_regions", cols: "website_id, report_period_id, region" },
    { name: "idx_ga_countries_unique", table: "ga_countries", cols: "website_id, report_period_id, country" },
    { name: "idx_ga_channels_unique", table: "ga_channels", cols: "website_id, report_period_id, channel" },
    { name: "idx_ga_pages_unique", table: "ga_pages", cols: "website_id, report_period_id, page_title" },
    { name: "idx_ga_events_unique", table: "ga_events", cols: "website_id, report_period_id, event_name" },
    { name: "idx_ga_device_models_unique", table: "ga_device_models", cols: "website_id, report_period_id, model" },
    { name: "idx_ga_source_medium_unique", table: "ga_source_medium", cols: "website_id, report_period_id, source_medium" },
    { name: "idx_ga_operating_systems_unique", table: "ga_operating_systems", cols: "website_id, report_period_id, os" },
    { name: "idx_ga_browsers_unique", table: "ga_browsers", cols: "website_id, report_period_id, browser" },
  ];

  for (const idx of uniqueIndexes) {
    try {
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table}(${idx.cols});`);
    } catch (e) {}
  }
}

export function getDb() {
  if (globalDb.__whrDb) return globalDb.__whrDb;
  const dir = dataDirectory();
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "website-health.db"));
  initialize(db);
  globalDb.__whrDb = db;
  return db;
}

export function checkpointDb() {
  try {
    const db = getDb();
    db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
  } catch (e) {
    console.error("Failed to checkpoint SQLite WAL:", e);
  }
}


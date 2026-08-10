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


import { getDb } from "./db";

export type LogLevel = "INFO" | "WARNING" | "ERROR";

export function writeLog(level: LogLevel, context: string, message: string, details?: Record<string, any>) {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO system_logs (level, context, message, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      level,
      context,
      message,
      details ? JSON.stringify(details) : null,
      new Date().toISOString()
    );

    // Auto-cleanup: keep only latest 1000 logs to prevent bloat
    db.prepare(`
      DELETE FROM system_logs
      WHERE id NOT IN (
        SELECT id FROM system_logs ORDER BY created_at DESC LIMIT 1000
      )
    `).run();
  } catch (error) {
    console.error("Failed to write system log:", error);
  }
}

export function logInfo(context: string, message: string, details?: Record<string, any>) {
  writeLog("INFO", context, message, details);
}

export function logWarn(context: string, message: string, details?: Record<string, any>) {
  writeLog("WARNING", context, message, details);
}

export function logError(context: string, message: string, details?: Record<string, any>) {
  writeLog("ERROR", context, message, details);
}

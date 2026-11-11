const { DatabaseSync } = require('node:sqlite');

function deduplicatePeriods(dbPath) {
  console.log(`Starting period deduplication for: ${dbPath}`);
  const db = new DatabaseSync(dbPath);

  // Tables referencing report_period_id
  const childTables = [
    'monthly_metrics',
    'gsc_daily_metrics',
    'gsc_queries',
    'gsc_pages',
    'gsc_devices',
    'gsc_countries',
    'gsc_appearance',
    'ga_daily_metrics',
    'ga_channels',
    'ga_pages',
    'ga_events',
    'ga_regions',
    'ga_cities',
    'ga_countries',
    'ga_device_models',
    'ga_source_medium',
    'ga_operating_systems',
    'ga_browsers'
  ];

  // Group periods by website_id and substr(period_start, 1, 7)
  const allPeriods = db.prepare(`
    SELECT id, website_id, period_start, period_end, period_label, created_at,
           substr(period_start, 1, 7) as year_month
    FROM report_periods
    ORDER BY website_id, period_start ASC, period_end DESC, created_at DESC
  `).all();

  const grouped = new Map();
  for (const p of allPeriods) {
    const key = `${p.website_id}::${p.year_month}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(p);
  }

  let totalMerged = 0;
  let totalKept = 0;

  db.exec('BEGIN IMMEDIATE');
  try {
    for (const [key, periods] of grouped.entries()) {
      // Pick the period with the maximum period_end as canonical
      // If there's full month (e.g. 30 or 31), it will be chosen first because of period_end DESC
      const canonical = periods[0];
      totalKept++;

      // Make sure canonical period_end covers full month or maximum known end
      const [yearStr, monthStr] = canonical.year_month.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const standardMonthEnd = `${canonical.year_month}-${String(lastDay).padStart(2, '0')}`;
      
      // Update canonical period if needed (set standard period_end)
      db.prepare(`
        UPDATE report_periods
        SET period_end = ?
        WHERE id = ?
      `).run(standardMonthEnd, canonical.id);

      const duplicates = periods.slice(1);
      for (const dup of duplicates) {
        totalMerged++;
        // Migrate all child records from dup.id to canonical.id
        for (const table of childTables) {
          try {
            db.prepare(`
              UPDATE OR IGNORE ${table}
              SET report_period_id = ?
              WHERE report_period_id = ?
            `).run(canonical.id, dup.id);
            // Delete any un-migrated conflicts that were ignored
            db.prepare(`
              DELETE FROM ${table}
              WHERE report_period_id = ?
            `).run(dup.id);
          } catch (err) {
            console.warn(`Warning on table ${table}:`, err.message);
          }
        }

        // Delete the duplicate period
        db.prepare('DELETE FROM report_periods WHERE id = ?').run(dup.id);
      }
    }

    db.exec('COMMIT');
    console.log(`Successfully merged ${totalMerged} duplicate periods. Total canonical periods: ${totalKept}`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Deduplication failed:', err);
    throw err;
  }
}

if (require.main === module) {
  const dbPath = process.argv[2] || 'e:/antigravity/gr/website-health-report/data/website-health.db';
  deduplicatePeriods(dbPath);
}

module.exports = { deduplicatePeriods };


const { DatabaseSync } = require('node:sqlite');

function cleanChildDuplicates(dbPath) {
  console.log(`Cleaning duplicate child records in: ${dbPath}`);
  const db = new DatabaseSync(dbPath);

  db.exec('BEGIN IMMEDIATE');
  try {
    // Tables with auto-increment 'id'
    const idTables = [
      { table: 'gsc_countries', groupCols: ['website_id', 'report_period_id', 'search_type', 'country'] },
      { table: 'gsc_queries', groupCols: ['website_id', 'report_period_id', 'search_type', 'query'] },
      { table: 'gsc_pages', groupCols: ['website_id', 'report_period_id', 'search_type', 'page'] },
      { table: 'gsc_devices', groupCols: ['website_id', 'report_period_id', 'search_type', 'device'] },
      { table: 'gsc_appearance', groupCols: ['website_id', 'report_period_id', 'search_type', 'appearance'] },
      { table: 'ga_cities', groupCols: ['website_id', 'report_period_id', 'city'] },
      { table: 'ga_regions', groupCols: ['website_id', 'report_period_id', 'region'] },
      { table: 'ga_countries', groupCols: ['website_id', 'report_period_id', 'country'] },
      { table: 'ga_channels', groupCols: ['website_id', 'report_period_id', 'channel'] },
      { table: 'ga_pages', groupCols: ['website_id', 'report_period_id', 'page_title'] },
      { table: 'ga_events', groupCols: ['website_id', 'report_period_id', 'event_name'] },
      { table: 'ga_device_models', groupCols: ['website_id', 'report_period_id', 'model'] },
      { table: 'ga_source_medium', groupCols: ['website_id', 'report_period_id', 'source_medium'] },
      { table: 'ga_operating_systems', groupCols: ['website_id', 'report_period_id', 'os'] },
      { table: 'ga_browsers', groupCols: ['website_id', 'report_period_id', 'browser'] },
    ];

    for (const item of idTables) {
      console.log(`Deduplicating ${item.table}...`);
      const groupClause = item.groupCols.join(', ');
      db.prepare(`
        DELETE FROM ${item.table}
        WHERE id NOT IN (
          SELECT max(id)
          FROM ${item.table}
          GROUP BY ${groupClause}
        )
      `).run();
    }

    db.exec('COMMIT');
    console.log('Successfully cleaned duplicate child records.');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Failed to clean child duplicates:', err);
    throw err;
  }
}

if (require.main === module) {
  const dbPath = process.argv[2] || 'e:/antigravity/gr/website-health-report/data/website-health.db';
  cleanChildDuplicates(dbPath);
}

module.exports = { cleanChildDuplicates };

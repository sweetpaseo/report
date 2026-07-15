import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '../lib/db';
import { parseReport } from '../lib/parsers';
import { importReport } from '../lib/import-report';
import { getDashboard } from '../lib/dashboard';

async function main() {
  const db = getDb();
  const websiteId = crypto.randomUUID();
  db.prepare(`INSERT INTO websites(id,name,domain,timezone,public_token,created_at) VALUES(?,?,?,?,?,?)`)
    .run(websiteId,'Erihome','erihome.id','Asia/Jakarta',crypto.randomBytes(16).toString('hex'),new Date().toISOString());
  const sampleFiles = process.argv.slice(2);
  for (const filename of sampleFiles) {
    const uploadId = crypto.randomUUID();
    const extension = path.extname(filename).toLowerCase();
    db.prepare(`INSERT INTO report_uploads(id,website_id,original_filename,stored_filename,storage_path,file_format,checksum,status,uploaded_at) VALUES(?,?,?,?,?,?,?,?,?)`)
      .run(uploadId,websiteId,path.basename(filename),path.basename(filename),filename,extension.slice(1),crypto.randomUUID(),'PROCESSING',new Date().toISOString());
    const parsed = await parseReport(fs.readFileSync(filename), extension);
    importReport(db, websiteId, uploadId, parsed);
  }
  const dashboard = getDashboard(db, websiteId) as any;
  console.log(JSON.stringify({
    selected: dashboard?.selected ?? null,
    previous: dashboard?.previous ?? null,
    status: dashboard?.status ?? null,
    impressions: dashboard?.metrics?.['gsc.impressions'] ?? null,
    sessions: dashboard?.metrics?.['ga.sessions'] ?? null,
    opportunities: dashboard?.opportunities?.length ?? null,
  }, null, 2));
}
main().catch((error)=>{ console.error(error); process.exit(1); });

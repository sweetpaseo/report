import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb, uploadsDirectory } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { importReport, importGscBundle } from "@/lib/import-report";
import { parseReport } from "@/lib/parsers";
import { parseGscBundle } from "@/lib/parsers/gsc-csv";

export const runtime = "nodejs";

// Aggregate limits to bound memory/disk abuse on shared hosting (B7).
const MAX_FILES_PER_REQUEST = 20;
const MAX_TOTAL_BYTES = Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024 * MAX_FILES_PER_REQUEST;

function validateSignature(buffer: Buffer, extension: string) {
  if (extension === ".xlsx") return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b;
  if (extension === ".csv") return !buffer.subarray(0, 1024).includes(0);
  return false;
}

type UploadResult = {
  ok: boolean;
  filename: string;
  uploadId?: string;
  periodId?: string;
  source?: string;
  periodStart?: string;
  periodEnd?: string;
  warnings?: string[];
  error?: string;
};

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(token);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat mengunggah data." }, { status: 403 });
  }
  const form = await request.formData();
  const websiteId = String(form.get("websiteId") || "");
  const files = (form.getAll("file") as unknown[]).filter((item): item is File => item instanceof File);
  if (!websiteId) return NextResponse.json({ error: "Website wajib dipilih." }, { status: 400 });
  if (files.length === 0) return NextResponse.json({ error: "Pilih minimal satu file." }, { status: 400 });
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ error: `Maksimal ${MAX_FILES_PER_REQUEST} file per unggahan.` }, { status: 400 });
  }
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "Total ukuran file melebihi batas." }, { status: 400 });
  }

  const db = getDb();
  if (!db.prepare("SELECT id FROM websites WHERE id = ?").get(websiteId)) {
    return NextResponse.json({ error: "Website tidak ditemukan." }, { status: 404 });
  }

  const maxBytes = Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024;
  const csvFiles = files.filter((file) => path.extname(file.name).toLowerCase() === ".csv");
  const isBundle = csvFiles.length > 0 && csvFiles.some((file) => /bagan/i.test(file.name));

  if (isBundle) {
    const results: UploadResult[] = [];
    const buffers: Buffer[] = [];
    let invalid = false;
    for (const file of csvFiles) {
      if (file.size > maxBytes) {
        results.push({ ok: false, filename: file.name, error: "Ukuran file melebihi batas." });
        invalid = true;
        continue;
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!validateSignature(buffer, ".csv")) {
        results.push({ ok: false, filename: file.name, error: "Isi file tidak sesuai dengan format CSV." });
        invalid = true;
        continue;
      }
      buffers.push(buffer);
    }
    if (invalid) {
      const failed = results.length;
      return NextResponse.json({ ok: false, results, succeeded: 0, failed, periodId: "" });
    }

    const textFiles = csvFiles.map((file, index) => ({ name: file.name, content: buffers[index].toString("utf8") }));
    const combinedChecksum = crypto.createHash("sha256").update(Buffer.concat(buffers)).digest("hex");
    const duplicate = db.prepare(`SELECT id FROM report_uploads WHERE website_id = ? AND checksum = ? AND status IN ('COMPLETED','COMPLETED_WITH_WARNINGS')`).get(websiteId, combinedChecksum);
    if (duplicate) {
      return NextResponse.json({ ok: false, results: [{ ok: false, filename: "GSC bundle", error: "Bundle yang sama sudah pernah diunggah." }], succeeded: 0, failed: 1, periodId: "" });
    }

    const uploadId = crypto.randomUUID();
    const bagan = csvFiles.find((file) => /bagan/i.test(file.name)) || csvFiles[0];
    const storedFilename = `${uploadId}.csv`;
    const storagePath = path.join(uploadsDirectory(), storedFilename);
    fs.writeFileSync(storagePath, buffers[csvFiles.indexOf(bagan)], { flag: "wx", mode: 0o600 });
    db.prepare(`
      INSERT INTO report_uploads(id, website_id, original_filename, stored_filename, storage_path, file_format, checksum, status, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PROCESSING', ?)
    `).run(uploadId, websiteId, `GSC bundle (${csvFiles.length} file)`, storedFilename, storagePath, "csv", combinedChecksum, new Date().toISOString());

    try {
      const bundle = parseGscBundle(textFiles);
      const imported = importGscBundle(db, websiteId, uploadId, bundle);
      results.push({
        ok: true,
        filename: `GSC bundle (${csvFiles.length} file)`,
        uploadId,
        periodId: imported.periodId,
        source: imported.source,
        periodStart: bundle.periodStart,
        periodEnd: bundle.periodEnd,
        warnings: bundle.warnings,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bundle gagal diproses.";
      db.prepare("UPDATE report_uploads SET status = 'FAILED', error_message = ?, processed_at = ? WHERE id = ?").run(message, new Date().toISOString(), uploadId);
      results.push({ ok: false, filename: "GSC bundle", error: message });
    }

    const succeeded = results.filter((result) => result.ok).length;
    const failed = results.length - succeeded;
    const periodId = results.find((result) => result.ok)?.periodId || "";
    return NextResponse.json({ ok: failed === 0, results, succeeded, failed, periodId });
  }

  const results: UploadResult[] = [];
  let lastPeriodId = "";

  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase();
    if (![".xlsx", ".csv"].includes(extension)) {
      results.push({ ok: false, filename: file.name, error: "Hanya file XLSX dan CSV yang didukung." });
      continue;
    }
    if (file.size > maxBytes) {
      results.push({ ok: false, filename: file.name, error: "Ukuran file melebihi batas." });
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateSignature(buffer, extension)) {
      results.push({ ok: false, filename: file.name, error: "Isi file tidak sesuai dengan ekstensi." });
      continue;
    }
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
    const duplicate = db.prepare(`
      SELECT id FROM report_uploads WHERE website_id = ? AND checksum = ? AND status IN ('COMPLETED','COMPLETED_WITH_WARNINGS')
    `).get(websiteId, checksum);
    if (duplicate) {
      results.push({ ok: false, filename: file.name, error: "File yang sama sudah pernah diunggah." });
      continue;
    }
    const uploadId = crypto.randomUUID();
    const storedFilename = `${uploadId}${extension}`;
    const storagePath = path.join(uploadsDirectory(), storedFilename);
    fs.writeFileSync(storagePath, buffer, { flag: "wx", mode: 0o600 });
    db.prepare(`
      INSERT INTO report_uploads(id, website_id, original_filename, stored_filename, storage_path, file_format, checksum, status, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PROCESSING', ?)
    `).run(uploadId, websiteId, file.name, storedFilename, storagePath, extension.slice(1), checksum, new Date().toISOString());
    try {
      const report = await parseReport(buffer, extension);
      const periodId = importReport(db, websiteId, uploadId, report);
      lastPeriodId = periodId;
      results.push({
        ok: true,
        filename: file.name,
        uploadId,
        periodId,
        source: report.source,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        warnings: report.warnings,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "File gagal diproses.";
      db.prepare("UPDATE report_uploads SET status = 'FAILED', error_message = ?, processed_at = ? WHERE id = ?")
        .run(message, new Date().toISOString(), uploadId);
      results.push({ ok: false, filename: file.name, error: message });
    }
  }

  const succeeded = results.filter((result) => result.ok).length;
  const failed = results.length - succeeded;
  return NextResponse.json({ ok: failed === 0, results, succeeded, failed, periodId: lastPeriodId });
}

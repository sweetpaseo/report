import fs from "node:fs";
import path from "node:path";
import { parseReport } from "../lib/parsers";

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error("Berikan path file XLSX/CSV untuk smoke test.");
  for (const filename of files) {
    const extension = path.extname(filename).toLowerCase();
    const result = await parseReport(fs.readFileSync(filename), extension);
    console.log(JSON.stringify({ file: path.basename(filename), source: result.source, period: [result.periodStart, result.periodEnd], metrics: result.metrics, warnings: result.warnings }, null, 2));
  }
}
main().catch((error) => { console.error(error); process.exit(1); });

import { parseGa } from "./ga";
import { parseGsc } from "./gsc";
import type { ParsedReport } from "./types";

export async function parseReport(buffer: Buffer, extension: string): Promise<ParsedReport> {
  if (extension === ".xlsx") return parseGsc(buffer);
  if (extension === ".csv") return parseGa(buffer);
  throw new Error("Format file tidak didukung.");
}

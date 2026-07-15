const MONTHS: Record<string, string> = {
  jan: "01", januari: "01", feb: "02", februari: "02", mar: "03", maret: "03",
  apr: "04", april: "04", mei: "05", may: "05", jun: "06", juni: "06",
  jul: "07", juli: "07", agu: "08", agustus: "08", aug: "08", sep: "09", september: "09",
  okt: "10", oktober: "10", oct: "10", nov: "11", november: "11", des: "12", desember: "12", dec: "12",
};

export function numberValue(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === "") return 0;
  const text = String(value).trim().replace(/%$/, "").replace(/\s/g, "");
  if (!text) return 0;
  // European/Indonesian format: dot thousands, comma decimal (e.g. 1.704,50)
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(text)) {
    const parsed = Number(text.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const normalized = text.includes(",") && !text.includes(".")
    ? text.replace(",", ".")
    : text.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  const match = text.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
  if (match) {
    const month = MONTHS[match[2]];
    if (month) return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
  }
  const dmy = text.match(/^(\d{1,2})[/\-.]\s*(\d{1,2})[/\-.]\s*(\d{2,4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${year}-${month}-${day}`;
  }
  return null;
}

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function periodLabel(start: string) {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${start}T00:00:00Z`));
}

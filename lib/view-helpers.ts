export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${day} ${months[monthIdx] || ""}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }
  } catch {}
  return dateStr;
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "0";
  return Math.round(n).toLocaleString("id-ID");
}

export function formatCompactNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const val = (n / 1_000_000).toFixed(2).replace(".", ",");
    return `${val} jt`;
  }
  if (abs >= 100_000) {
    const val = (n / 1_000).toFixed(0);
    return `${val} rb`;
  }
  if (abs >= 10_000) {
    const val = (n / 1_000).toFixed(1).replace(".", ",");
    return `${val} rb`;
  }
  return n.toLocaleString("id-ID");
}

export function formatPercent(p: number | null | undefined, decimals = 1): string {
  if (p === null || p === undefined || isNaN(p)) return "0%";
  return `${p.toFixed(decimals).replace(".", ",")}%`;
}

export function formatPosition(pos: number | null | undefined): string {
  if (pos === null || pos === undefined || isNaN(pos) || pos <= 0) return "-";
  return pos.toFixed(1);
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const COUNTRY_FLAGS: Record<string, { name: string; flag: string }> = {
  id: { name: "Indonesia", flag: "🇮🇩" },
  idn: { name: "Indonesia", flag: "🇮🇩" },
  us: { name: "Amerika Serikat", flag: "🇺🇸" },
  usa: { name: "Amerika Serikat", flag: "🇺🇸" },
  sg: { name: "Singapura", flag: "🇸🇬" },
  sgp: { name: "Singapura", flag: "🇸🇬" },
  my: { name: "Malaysia", flag: "🇲🇾" },
  mys: { name: "Malaysia", flag: "🇲🇾" },
  th: { name: "Thailand", flag: "🇹🇭" },
  tha: { name: "Thailand", flag: "🇹🇭" },
  vn: { name: "Vietnam", flag: "🇻🇳" },
  vnm: { name: "Vietnam", flag: "🇻🇳" },
  in: { name: "India", flag: "🇮🇳" },
  ind: { name: "India", flag: "🇮🇳" },
  jp: { name: "Jepang", flag: "🇯🇵" },
  jpn: { name: "Jepang", flag: "🇯🇵" },
  kr: { name: "Korea Selatan", flag: "🇰🇷" },
  kor: { name: "Korea Selatan", flag: "🇰🇷" },
  cn: { name: "Tiongkok", flag: "🇨🇳" },
  chn: { name: "Tiongkok", flag: "🇨🇳" },
  au: { name: "Australia", flag: "🇦🇺" },
  aus: { name: "Australia", flag: "🇦🇺" },
  gb: { name: "Inggris", flag: "🇬🇧" },
  gbr: { name: "Inggris", flag: "🇬🇧" },
  de: { name: "Jerman", flag: "🇩🇪" },
  deu: { name: "Jerman", flag: "🇩🇪" },
  nl: { name: "Belanda", flag: "🇳🇱" },
  nld: { name: "Belanda", flag: "🇳🇱" },
  ph: { name: "Filipina", flag: "🇵🇭" },
  phl: { name: "Filipina", flag: "🇵🇭" },
};

export function getCountryDisplay(rawCode: string): { name: string; flag: string } {
  if (!rawCode) return { name: "Lainnya", flag: "🌐" };
  const lower = rawCode.toLowerCase().trim();
  if (COUNTRY_FLAGS[lower]) return COUNTRY_FLAGS[lower];
  return { name: rawCode, flag: "🌐" };
}

export function exportTableToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  if (typeof window === "undefined") return;

  const escapeCell = (cell: string | number | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((r) => r.map(escapeCell).join(",")).join("\r\n");
  const csvContent = "\uFEFF" + headerLine + "\r\n" + dataLines;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


"use client";

import { useMemo, useState } from "react";

const METRICS = [
  { key: "gsc.impressions", label: "Tayangan (GSC)" },
  { key: "gsc.clicks", label: "Klik (GSC)" },
  { key: "ga.sessions", label: "Sesi (GA)" },
  { key: "ga.active_users", label: "Pengguna Aktif (GA)" },
  { key: "ga.new_users", label: "Pengguna Baru (GA)" },
  { key: "ga.page_views", label: "Tampilan Halaman (GA)" },
  { key: "ga.click_to_chat", label: "Klik ke Chat (GA)" },
] as const;

const fmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

function fmtCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")} jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")} rb`;
  return fmt.format(value);
}

const MONTH_ABBR: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "Mei", "06": "Jun",
  "07": "Jul", "08": "Ags", "09": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
};

function monthAbbr(periodStart: string, withYear: boolean) {
  const parts = periodStart.split("-");
  const abbr = MONTH_ABBR[parts[1]] || parts[1];
  return withYear ? `${abbr} ${parts[0].slice(2)}` : abbr;
}

const WIDTH = 720;
const HEIGHT = 280;
const PAD_X = 52;
const PAD_TOP = 22;
const PAD_BOTTOM = 36;

type TrendPoint = { periodStart: string; periodLabel: string; metrics: Record<string, number> };

export function MonthlyTrend({ data }: { data: any }) {
  const series = (data?.monthlySeries || []) as TrendPoint[];
  const [metricKey, setMetricKey] = useState<string>(METRICS[0].key);
  const [hover, setHover] = useState<number | null>(null);
  const metric = METRICS.find((candidate) => candidate.key === metricKey) || METRICS[0];

  const values = useMemo(
    () => series.map((point) => Number(point.metrics?.[metricKey] || 0)),
    [series, metricKey],
  );
  let minVal = values.length ? Math.min(...values) : 0;
  let maxVal = values.length ? Math.max(...values) : 1;
  if (minVal === maxVal) {
    if (maxVal > 0) minVal = 0;
    else maxVal = 1;
  } else {
    const range = maxVal - minVal;
    minVal = Math.max(0, minVal - range * 0.1);
    maxVal = maxVal + range * 0.1;
  }
  const yRange = maxVal - minVal;
  
  const innerWidth = WIDTH - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const xAt = (index: number) =>
    PAD_X + (values.length <= 1 ? innerWidth / 2 : (index / (values.length - 1)) * innerWidth);
  const yAt = (value: number) => PAD_TOP + innerHeight - ((value - minVal) / yRange) * innerHeight;

  const linePoints = values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");
  const baseline = PAD_TOP + innerHeight;
  const areaPoints = `${PAD_X},${baseline} ${linePoints} ${xAt(values.length - 1)},${baseline}`;

  const first = values[0] || 0;
  const last = values[values.length - 1] || 0;
  const change = last - first;
  const changePercent = first ? (change / first) * 100 : null;
  const positive = change >= 0;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(minVal + yRange * ratio));

  const prevVal = values.length > 1 ? values[values.length - 2] : 0;
  const mom = last - prevVal;
  const momPct = prevVal ? (mom / prevVal) * 100 : null;

  function renderTooltip(index: number) {
    const x = xAt(index);
    const y = yAt(values[index]);
    const monthLabel = monthAbbr(series[index].periodStart, true);
    const value = values[index];
    const prev = index > 0 ? values[index - 1] : null;
    const delta = prev !== null ? value - prev : null;
    const deltaPct = prev && prev !== 0 ? ((delta || 0) / prev) * 100 : null;
    const boxW = 144;
    const boxH = 52;
    let bx = x - boxW / 2;
    bx = Math.max(PAD_X, Math.min(bx, WIDTH - PAD_X - boxW));
    let by = y - boxH - 14;
    if (by < PAD_TOP) by = y + 14;
    return (
      <g className="trend-tooltip" pointerEvents="none">
        <rect x={bx} y={by} width={boxW} height={boxH} rx={8} />
        <text x={bx + 11} y={by + 19} className="trend-tip-title">{monthLabel}</text>
        <text x={bx + 11} y={by + 37} className="trend-tip-value">{fmt.format(value)}</text>
        {deltaPct !== null && (
          <text
            x={bx + boxW - 11}
            y={by + 37}
            textAnchor="end"
            className={`trend-tip-delta ${(delta || 0) >= 0 ? "positive" : "negative"}`}
          >
            {`${(delta || 0) >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%`}
          </text>
        )}
      </g>
    );
  }

  return (
    <section className="section-card trend-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TREN 12 BULAN</p>
          <h2>Bagaimana perubahan metrik dari waktu ke waktu?</h2>
        </div>
        <label className="trend-controls">Metrik
          <select value={metricKey} onChange={(event) => setMetricKey(event.target.value)}>
            {METRICS.map((entry) => <option key={entry.key} value={entry.key}>{entry.label}</option>)}
          </select>
        </label>
      </div>

      <svg
        className="trend-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Grafik tren ${metric.label}`}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((tick, index) => {
          const y = yAt(tick);
          return (
            <g key={index}>
              <line x1={PAD_X} y1={y} x2={WIDTH - PAD_X} y2={y} className="trend-grid" />
              <text x={PAD_X - 10} y={y + 4} className="trend-axis-label" textAnchor="end">{fmt.format(tick)}</text>
            </g>
          );
        })}
        <polygon points={areaPoints} className="trend-area" />
        <polyline points={linePoints} className="trend-line" />
        {values.map((value, index) => (
          <g key={index}>
            <circle
              cx={xAt(index)}
              cy={yAt(value)}
              r={index === values.length - 1 ? 5 : 3.5}
              className={index === values.length - 1 ? "trend-dot last" : "trend-dot"}
            />
            <text
              x={xAt(index)}
              y={yAt(value) - 9}
              className="trend-value"
              textAnchor="middle"
            >
              {fmtCompact(value)}
            </text>
            <circle
              cx={xAt(index)}
              cy={yAt(value)}
              r={12}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(index)}
            />
          </g>
        ))}
        {series.map((point, index) => (
          <text
            key={index}
            x={xAt(index)}
            y={HEIGHT - 12}
            className="trend-axis-label"
            textAnchor="middle"
          >
            {monthAbbr(point.periodStart, index === values.length - 1)}
          </text>
        ))}
        {hover !== null && renderTooltip(hover)}
      </svg>

      <p className="trend-caption">
        <b>{monthAbbr(series[series.length - 1]?.periodStart || "", true)}</b>: {fmt.format(last)}
        <span className="trend-vs"> vs {monthAbbr(series[series.length - 2]?.periodStart || "", true)}: {fmt.format(prevVal)}</span>
        {momPct !== null && (
          <span className={`trend-change ${mom >= 0 ? "positive" : "negative"}`}>
            {mom >= 0 ? "+" : ""}{momPct.toFixed(1)}% MoM
          </span>
        )}
        {data.isPartialMonth && <span className="trend-partial"> · masih berjalan</span>}
      </p>
      <p className="trend-sub">
        {monthAbbr(series[0]?.periodStart || "", true)}: {fmt.format(first)} → sekarang {fmt.format(last)}
        {changePercent !== null && ` (${positive ? "+" : ""}${changePercent.toFixed(1)}% selama 12 bulan)`}
      </p>
    </section>
  );
}

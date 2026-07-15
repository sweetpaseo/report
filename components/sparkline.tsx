export function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return <div className="sparkline empty" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 120, height = 42, pad = 4;
  const points = values.map((value, index) => {
    const x = pad + (index / Math.max(1, values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / Math.max(1, max - min)) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik tren"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

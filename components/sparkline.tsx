export function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return <div className="sparkline empty" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 120, height = 42, pad = 4;
  const range = Math.max(1, max - min);
  const pointsArray = values.map((value, index) => {
    const x = pad + (index / Math.max(1, values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const pointsString = pointsArray.map(p => `${p.x},${p.y}`).join(" ");
  const lastVal = values[values.length - 1];
  const firstVal = values[0];
  const isUp = lastVal >= firstVal;
  const strokeColor = isUp ? "#34d399" : "#fb7185";
  const fillPoints = `${pad},${height} ${pointsString} ${width - pad},${height}`;

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik tren">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#sparkGrad)" />
      <polyline points={pointsString} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pointsArray.length > 0 && (
        <circle cx={pointsArray[pointsArray.length - 1].x} cy={pointsArray[pointsArray.length - 1].y} r="3" fill={strokeColor} />
      )}
    </svg>
  );
}


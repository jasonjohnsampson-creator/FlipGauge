export function HistoryChart({ values }: { values: number[] }) {
  const width = 700;
  const height = 220;
  const pad = 22;
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const points = values.map((value, index) => {
    const x = pad + (index / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `${pad},${height-pad} ${points} ${width-pad},${height-pad}`;

  return (
    <div className="chart-shell" aria-label="Price history chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {[0.25,0.5,0.75].map((fraction) => (
          <line key={fraction} x1={pad} x2={width-pad} y1={height*fraction} y2={height*fraction} className="chart-grid" />
        ))}
        <polygon points={area} className="chart-area" />
        <polyline points={points} className="chart-line" />
      </svg>
      <div className="chart-axis"><span>90 days ago</span><span>Today</span></div>
    </div>
  );
}

import {
  ResponsiveContainer, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell, ZAxis,
} from "recharts";

const AXIS = { fontSize: 11, fill: "hsl(var(--muted-foreground, 0 0% 45%))" };

/** Generic multi-series line chart for curves / convergence plots. */
export function LineFigure({
  series,
  xKey = "x",
  height = 320,
  xLabel,
  yLabel,
  refY,
}: {
  series: { name: string; data: any[]; color: string; dataKey: string; dot?: boolean; dash?: boolean }[];
  xKey?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  refY?: number;
}) {
  // Merge series by x into a single dataset for shared axis.
  const merged: Record<number, any> = {};
  series.forEach((s) => {
    s.data.forEach((pt) => {
      const xv = pt[xKey];
      if (!merged[xv]) merged[xv] = { [xKey]: xv };
      merged[xv][s.dataKey] = pt[s.dataKey] ?? pt.y ?? pt.estimate;
    });
  });
  const data = Object.values(merged).sort((a: any, b: any) => a[xKey] - b[xKey]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
        <XAxis dataKey={xKey} tick={AXIS} label={xLabel ? { value: xLabel, position: "insideBottom", offset: -8, fontSize: 11 } : undefined} />
        <YAxis tick={AXIS} label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} width={50} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {refY !== undefined && <ReferenceLine y={refY} stroke="#94a3b8" strokeDasharray="4 4" />}
        {series.map((s) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dash ? "6 4" : undefined}
            dot={s.dot ? { r: 2 } : false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Scatter figure with optional colour-by-group (used for Monte Carlo / fits). */
export function ScatterFigure({
  groups,
  height = 320,
  xLabel,
  yLabel,
  square = false,
}: {
  groups: { name: string; data: { x: number; y: number }[]; color: string }[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  square?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
        <XAxis type="number" dataKey="x" tick={AXIS} domain={square ? [0, 1] : ["auto", "auto"]}
          label={xLabel ? { value: xLabel, position: "insideBottom", offset: -8, fontSize: 11 } : undefined} />
        <YAxis type="number" dataKey="y" tick={AXIS} domain={square ? [0, 1] : ["auto", "auto"]} width={50}
          label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} />
        <ZAxis range={[18, 18]} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ strokeDasharray: "3 3" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {groups.map((g) => (
          <Scatter key={g.name} name={g.name} data={g.data} fill={g.color} isAnimationActive={false} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

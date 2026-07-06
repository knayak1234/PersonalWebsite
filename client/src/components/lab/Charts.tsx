import {
  ResponsiveContainer, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ZAxis,
} from "recharts";

/*
 * Manim-inspired chart theme: every figure is drawn on a deep-navy canvas
 * with a faint grid, bright glowing curves and an animated draw-in — the
 * look of a 3Blue1Brown scene.
 */

const TICK = { fontSize: 11, fill: "#8fa3c8", fontFamily: "ui-monospace, monospace" };
const GRID = "rgba(148, 163, 184, 0.14)";
const AXIS_LINE = { stroke: "rgba(148, 163, 184, 0.35)" };
const LABEL_FILL = "#a5b4d4";
const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  background: "#141b31",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  color: "#e2e8f0",
} as const;

/**
 * Lift a series colour to "manim brightness" so it pops on the dark canvas
 * (bright, slightly pastel — like BLUE_C / GREEN_C / RED_C in manim).
 */
function manimColor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) / 255, g = ((int >> 8) & 255) / 255, b = (int & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  return `hsl(${h.toFixed(0)} ${Math.max(s * 100, 60).toFixed(0)}% ${Math.max(l * 100, 64).toFixed(0)}%)`;
}

/** Invisible SVG carrying the shared glow filter referenced from CSS. */
function GlowDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="manim-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/** The dark manim-style scene the plots are drawn on. */
export function SceneFrame({ children, glowCurves = false }: { children: React.ReactNode; glowCurves?: boolean }) {
  return (
    <div
      className={`relative rounded-xl border border-slate-700/50 bg-[#0e1424] p-3 shadow-inner ${
        glowCurves ? "[&_.recharts-curve]:[filter:url(#manim-glow)]" : ""
      }`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.07), transparent 65%)",
      }}
    >
      <GlowDefs />
      {children}
    </div>
  );
}

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
    <SceneFrame glowCurves>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis
            dataKey={xKey}
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={AXIS_LINE}
            label={xLabel ? { value: xLabel, position: "insideBottom", offset: -8, fontSize: 11, fill: LABEL_FILL } : undefined}
          />
          <YAxis
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={AXIS_LINE}
            label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: LABEL_FILL } : undefined}
            width={50}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#cbd5e1" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
          {refY !== undefined && <ReferenceLine y={refY} stroke="#94a3b8" strokeDasharray="4 4" />}
          {series.map((s) => {
            const c = manimColor(s.color);
            return (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={c}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={s.dash ? "6 4" : undefined}
                dot={s.dot ? { r: 2.5, fill: c, stroke: "#0e1424", strokeWidth: 1 } : false}
                activeDot={{ r: 4.5, fill: c, stroke: "#e2e8f0", strokeWidth: 1.5 }}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </SceneFrame>
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
    <SceneFrame>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis
            type="number"
            dataKey="x"
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={AXIS_LINE}
            domain={square ? [0, 1] : ["auto", "auto"]}
            label={xLabel ? { value: xLabel, position: "insideBottom", offset: -8, fontSize: 11, fill: LABEL_FILL } : undefined}
          />
          <YAxis
            type="number"
            dataKey="y"
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={AXIS_LINE}
            domain={square ? [0, 1] : ["auto", "auto"]}
            width={50}
            label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: LABEL_FILL } : undefined}
          />
          <ZAxis range={[18, 18]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#cbd5e1" }} cursor={{ strokeDasharray: "3 3", stroke: "#64748b" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
          {groups.map((g) => (
            <Scatter
              key={g.name}
              name={g.name}
              data={g.data}
              fill={manimColor(g.color)}
              fillOpacity={0.85}
              isAnimationActive={false}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </SceneFrame>
  );
}

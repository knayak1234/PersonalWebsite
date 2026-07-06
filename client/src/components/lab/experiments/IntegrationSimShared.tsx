import { useMemo, useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { SceneFrame } from "@/components/lab/Charts";
import { compileExpression } from "@/lib/lab/expr";
import {
  simpson13, simpson38, trapezoidal, referenceIntegral, relErrorPct, sampleCurve,
} from "@/lib/lab/numerics";
import type { IntegrationResult } from "@/lib/lab/numerics";
import { NumberField, TextField } from "@/components/lab/ParamControl";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import { Callout } from "@/components/lab/Content";

type Rule = "s13" | "s38";

/** Reconstruct the piecewise-parabola used by Simpson's rule for plotting. */
function simpsonReconstruction(nodes: { x: number; y: number }[], rule: Rule) {
  const group = rule === "s13" ? 2 : 3;
  const out: { x: number; approx: number }[] = [];
  for (let i = 0; i + group < nodes.length; i += group) {
    const pts = nodes.slice(i, i + group + 1);
    // Lagrange interpolation across the group for a smooth segment
    const seg = 14;
    const x0 = pts[0].x, xe = pts[pts.length - 1].x;
    for (let s = 0; s <= seg; s++) {
      const x = x0 + ((xe - x0) * s) / seg;
      let y = 0;
      for (let k = 0; k < pts.length; k++) {
        let L = 1;
        for (let j = 0; j < pts.length; j++) if (j !== k) L *= (x - pts[j].x) / (pts[k].x - pts[j].x);
        y += L * pts[k].y;
      }
      out.push({ x: +x.toFixed(4), approx: y });
    }
  }
  return out;
}

export default function IntegrationSimShared({ rule }: { rule: Rule }) {
  const [fx, setFx] = useState("1/(1+x^2)");
  const [a, setA] = useState("0");
  const [b, setB] = useState("1");
  const [n, setN] = useState(rule === "s13" ? "8" : "9");
  const [run, setRun] = useState(0);

  const compiled = compileExpression(fx);
  const aN = parseFloat(a), bN = parseFloat(b), nN = parseInt(n, 10);
  const divisor = rule === "s13" ? 2 : 3;
  const ruleName = rule === "s13" ? "Simpson's 1/3" : "Simpson's 3/8";

  const errors: Record<string, string> = {};
  if (!compiled.ok) errors.fx = compiled.error || "Invalid function.";
  if (!Number.isFinite(aN)) errors.a = "Enter a number.";
  if (!Number.isFinite(bN)) errors.b = "Enter a number.";
  if (Number.isFinite(aN) && Number.isFinite(bN) && aN >= bN) errors.b = "Upper limit must exceed lower limit.";
  if (!Number.isInteger(nN) || nN < divisor) errors.n = `n must be ≥ ${divisor}.`;
  else if (nN % divisor !== 0) errors.n = `For ${ruleName}, n must be a multiple of ${divisor}.`;
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid || !compiled.fn) return null;
    const f = compiled.fn;
    const approx: IntegrationResult = rule === "s13" ? simpson13(f, aN, bN, nN) : simpson38(f, aN, bN, nN);
    const trap = trapezoidal(f, aN, bN, nN).value;
    const exact = referenceIntegral(f, aN, bN);
    const curve = sampleCurve(f, aN, bN, 240);
    return { approx, trap, exact, curve };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const chartData = useMemo(() => {
    if (!result) return [];
    const map: Record<number, any> = {};
    result.curve.forEach((p) => { map[+p.x.toFixed(4)] = { x: +p.x.toFixed(4), curve: p.y }; });
    simpsonReconstruction(result.approx.nodes, rule).forEach((p) => {
      map[p.x] = { ...(map[p.x] || { x: p.x }), approx: p.approx };
    });
    return Object.values(map).sort((a: any, b: any) => a.x - b.x);
  }, [result, rule]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setFx("1/(1+x^2)"); setA("0"); setB("1"); setN(rule === "s13" ? "8" : "9"); setRun((r) => r + 1); }}
      runLabel="Compute"
      controls={
        <>
          <TextField label="Function f(x)" value={fx} onChange={setFx} placeholder="e.g. 1/(1+x^2)"
            hint="Use x, +,-,*,/,^, sin, cos, exp, log, sqrt…" error={errors.fx} />
          <NumberField label="Lower limit a" value={a} onChange={setA} error={errors.a} />
          <NumberField label="Upper limit b" value={b} onChange={setB} error={errors.b} />
          <NumberField label={`Sub-intervals n (multiple of ${divisor})`} value={n} onChange={setN} min={divisor} step={divisor} error={errors.n} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Enter a valid function, limits, and a valid n.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label={`${ruleName} estimate`} value={result.approx.value.toFixed(8)} />
              <StatTile label="Reference value" value={result.exact.toFixed(8)} accent="text-emerald-600" />
              <StatTile label="Absolute error" value={Math.abs(result.exact - result.approx.value).toExponential(2)} accent="text-rose-600" />
              <StatTile label="Trapezoidal error" value={Math.abs(result.exact - result.trap).toExponential(2)} accent="text-amber-600" />
            </div>

            <OutputBlock title="Visualization — curve & parabolic approximation">
              <SceneFrame glowCurves>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" />
                  <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#8fa3c8" }} type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11, fill: "#8fa3c8" }} width={50} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#141b31", border: "1px solid rgba(148,163,184,0.25)", color: "#e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
                  <Area type="monotone" dataKey="approx" name={`${ruleName} fit`} stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.16} connectNulls isAnimationActive animationDuration={900} animationEasing="ease-out" dot={false} />
                  <Line type="monotone" dataKey="curve" name="f(x)" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive animationDuration={900} animationEasing="ease-out" />
                </ComposedChart>
              </ResponsiveContainer>
              </SceneFrame>
              <p className="text-xs text-muted-foreground mt-2">
                {ruleName} fits {rule === "s13" ? "parabolas through each pair" : "cubics through each triple"} of
                intervals — the approximation hugs the true curve far more tightly than straight trapezoidal lines,
                which is why its error is dramatically smaller above.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — node table">
              <div className="text-xs text-muted-foreground mb-3">
                <strong className="text-foreground">h = (b−a)/n =</strong> {result.approx.h.toFixed(6)} ·{" "}
                <strong className="text-foreground">Relative error =</strong> {relErrorPct(result.approx.value, result.exact).toFixed(6)}%
              </div>
              <ResultsTable
                rows={result.approx.steps}
                columns={[
                  { key: "i", header: "i" },
                  { key: "x", header: "xᵢ", render: (r) => r.x.toFixed(6) },
                  { key: "fx", header: "f(xᵢ)", render: (r) => r.fx.toFixed(6) },
                  { key: "weight", header: "weight", render: (r) => String(r.weight) },
                  { key: "contribution", header: "wᵢ·f(xᵢ)", render: (r) => r.contribution.toFixed(6) },
                ]}
                caption={`Estimate = (${rule === "s13" ? "h/3" : "3h/8"}) × Σ wᵢ f(xᵢ).`}
              />
            </OutputBlock>
          </>
        )
      }
    />
  );
}

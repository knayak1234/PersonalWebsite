import { useMemo, useState } from "react";
import { compileExpression } from "@/lib/lab/expr";
import { euler, rk2, rk4 } from "@/lib/lab/numerics";
import type { ODEFn, ODEResult } from "@/lib/lab/numerics";
import { NumberField } from "@/components/lab/ParamControl";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import { Callout } from "@/components/lab/Content";

export type ODEMethod = "euler" | "rk2" | "rk4";

/**
 * A preset ODE carries an f(x,y), a closed-form exact solution (so we can show
 * the true error), and sensible default initial conditions. Using presets keeps
 * the "compare with exact" feature exact and robust without a two-variable parser.
 */
interface Preset {
  id: string;
  label: string;
  f: ODEFn;
  exact: (x: number) => number;
  x0: number;
  y0: number;
  exactTex: string;
}

const PRESETS: Preset[] = [
  { id: "exp", label: "dy/dx = y", f: (_x, y) => y, exact: (x) => Math.exp(x), x0: 0, y0: 1, exactTex: "y = e^{x}" },
  { id: "decay", label: "dy/dx = −2y (decay)", f: (_x, y) => -2 * y, exact: (x) => Math.exp(-2 * x), x0: 0, y0: 1, exactTex: "y = e^{-2x}" },
  { id: "xplusy", label: "dy/dx = x + y", f: (x, y) => x + y, exact: (x) => 2 * Math.exp(x) - x - 1, x0: 0, y0: 1, exactTex: "y = 2e^{x} - x - 1" },
  { id: "xminusy", label: "dy/dx = x − y", f: (x, y) => x - y, exact: (x) => x - 1 + 2 * Math.exp(-x), x0: 0, y0: 1, exactTex: "y = x - 1 + 2e^{-x}" },
  { id: "xy", label: "dy/dx = x·y", f: (x, y) => x * y, exact: (x) => Math.exp((x * x) / 2), x0: 0, y0: 1, exactTex: "y = e^{x^2/2}" },
];

const METHOD_FN: Record<ODEMethod, (f: ODEFn, x0: number, y0: number, h: number, n: number, ex: ((x: number) => number) | null) => ODEResult> = {
  euler, rk2, rk4,
};

const METHOD_NAME: Record<ODEMethod, string> = { euler: "Euler", rk2: "RK2", rk4: "RK4" };
const METHOD_COLOR: Record<ODEMethod, string> = { euler: "#e11d48", rk2: "#f59e0b", rk4: "#16a34a" };

export default function ODESimShared({ method }: { method: ODEMethod }) {
  const [presetId, setPresetId] = useState("exp");
  const [h, setH] = useState("0.1");
  const [xEnd, setXEnd] = useState("1");
  const [y0, setY0] = useState("1");
  const [run, setRun] = useState(0);

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const hN = parseFloat(h), xEndN = parseFloat(xEnd), y0N = parseFloat(y0);

  const errors: Record<string, string> = {};
  if (!Number.isFinite(hN) || hN <= 0) errors.h = "Step size must be positive.";
  if (!Number.isFinite(xEndN) || xEndN <= preset.x0) errors.xEnd = `End x must exceed x₀ = ${preset.x0}.`;
  if (!Number.isFinite(y0N)) errors.y0 = "Enter a number.";
  if (Number.isFinite(hN) && hN > 0 && Number.isFinite(xEndN) && xEndN > preset.x0 && (xEndN - preset.x0) / hN > 2000) errors.h = "Too many steps — increase h.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const steps = Math.max(1, Math.round((xEndN - preset.x0) / hN));
    const res = METHOD_FN[method](preset.f, preset.x0, y0N, hN, steps, preset.exact);
    const last = res.steps[res.steps.length - 1];
    return { res, last, steps };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const chartSeries = result
    ? [
        { name: `Exact (${preset.exactTex.replace(/[{}\\]/g, "")})`, color: "#0f172a", dataKey: "exact", dash: true, data: result.res.steps.map((s) => ({ x: +s.x.toFixed(3), exact: s.exact })) },
        { name: METHOD_NAME[method], color: METHOD_COLOR[method], dataKey: "approx", dot: true, data: result.res.steps.map((s) => ({ x: +s.x.toFixed(3), approx: s.y })) },
      ]
    : [];

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setPresetId("exp"); setH("0.1"); setXEnd("1"); setY0("1"); setRun((r) => r + 1); }}
      runLabel="Integrate ODE"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Differential equation</Label>
            <Select value={presetId} onValueChange={(v) => { setPresetId(v); const p = PRESETS.find((q) => q.id === v)!; setY0(String(p.y0)); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => <SelectItem key={p.id} value={p.id} className="text-sm">{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Exact solution shown for error comparison.</p>
          </div>
          <NumberField label={`Initial value y(${preset.x0})`} value={y0} onChange={setY0} step="any" error={errors.y0} />
          <NumberField label="Step size h" value={h} onChange={setH} step="any" error={errors.h} />
          <NumberField label="Integrate up to x =" value={xEnd} onChange={setXEnd} step="any" error={errors.xEnd} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Choose an equation and valid step size.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label={`${METHOD_NAME[method]} y(${xEndN})`} value={result.last.y.toFixed(6)} />
              <StatTile label="Exact value" value={(result.last.exact ?? 0).toFixed(6)} accent="text-emerald-600" />
              <StatTile label="Abs error" value={(result.last.error ?? 0).toExponential(2)} accent="text-rose-600" />
              <StatTile label="Steps" value={String(result.steps)} accent="text-amber-600" />
            </div>

            <OutputBlock title="Visualization — numerical vs exact solution">
              <LineFigure height={300} xKey="x" xLabel="x" yLabel="y(x)" series={chartSeries} />
              <p className="text-xs text-muted-foreground mt-2">
                The dashed black curve is the exact solution; the coloured points are the {METHOD_NAME[method]}
                {" "}estimates. Shrink h to watch the numerical curve hug the exact one.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — step-by-step trace">
              <LineFigure
                height={240}
                xKey="x"
                xLabel="x"
                yLabel="error"
                series={[{ name: "Absolute error |y − exact|", color: METHOD_COLOR[method], dataKey: "err", dot: true, data: result.res.steps.map((s) => ({ x: +s.x.toFixed(3), err: s.error ?? 0 })) }]}
              />
              <p className="text-xs text-muted-foreground mt-1 mb-4">Error grows with x as local truncation errors accumulate.</p>
              <ResultsTable
                rows={result.res.steps}
                columns={[
                  { key: "i", header: "n" },
                  { key: "x", header: "xₙ", render: (r) => r.x.toFixed(4) },
                  { key: "y", header: `yₙ (${METHOD_NAME[method]})`, render: (r) => r.y.toFixed(8) },
                  { key: "exact", header: "exact", render: (r) => (r.exact ?? 0).toFixed(8) },
                  { key: "error", header: "abs error", render: (r) => (r.error ?? 0).toExponential(3) },
                ]}
                caption={`${METHOD_NAME[method]} marches from the initial condition; compare each step against the exact solution.`}
              />
            </OutputBlock>
          </>
        )
      }
    />
  );
}

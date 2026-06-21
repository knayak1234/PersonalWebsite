import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import LabShell from "@/components/lab/LabShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SliderField } from "@/components/lab/ParamControl";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import { StatTile } from "@/components/lab/SimLayout";
import { Callout } from "@/components/lab/Content";
import MathTeX from "@/components/lab/MathTeX";
import {
  trapezoidal, simpson13, simpson38, referenceIntegral,
  bisection, newtonRaphson, secant, centralDiff,
  euler, rk2, rk4, relErrorPct,
} from "@/lib/lab/numerics";
import {
  GitCompareArrows, Sigma, Crosshair, Activity, ArrowLeft, Trophy,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Comparison Dashboard — side-by-side study of competing numerical
   methods. Each tab fixes a canonical benchmark problem and reports the
   accuracy, error and cost of every method so students can see the
   trade-offs (accuracy ↔ stability ↔ computational cost) directly.
   ──────────────────────────────────────────────────────────── */

const cardGrid = "grid gap-4 sm:grid-cols-3";

/* ===== 1. Numerical Integration ============================== */
function IntegrationCompare() {
  const [nHalf, setNHalf] = useState(3); // n = 2*nHalf (always even, ≥2, multiple usable by all rules)
  const n = nHalf * 2;
  // Benchmark: ∫₀^π sin x dx = 2 (exact).
  const f = (x: number) => Math.sin(x);
  const a = 0, b = Math.PI;
  const exact = 2;

  const data = useMemo(() => {
    // Simpson's 3/8 needs n divisible by 3; use the nearest multiple of 6 for a fair n.
    const n38 = Math.max(6, Math.round(n / 6) * 6);
    const t = trapezoidal(f, a, b, n).value;
    const s13 = simpson13(f, a, b, n).value;
    const s38 = simpson38(f, a, b, n38).value;
    return [
      { method: "Trapezoidal", value: t, err: Math.abs(t - exact), pct: relErrorPct(t, exact), order: "O(h²)", evals: n + 1, n },
      { method: "Simpson 1/3", value: s13, err: Math.abs(s13 - exact), pct: relErrorPct(s13, exact), order: "O(h⁴)", evals: n + 1, n },
      { method: "Simpson 3/8", value: s38, err: Math.abs(s38 - exact), pct: relErrorPct(s38, exact), order: "O(h⁴)", evals: n38 + 1, n: n38 },
    ];
  }, [n]);

  const best = data.reduce((m, r) => (r.err < m.err ? r : m), data[0]);

  return (
    <div className="space-y-6">
      <Callout tone="info" title="Benchmark problem">
        Estimate <MathTeX tex="\int_0^{\pi}\sin x\,dx = 2" /> (exact). The three Newton–Cotes rules use the
        same number of strips so you can compare their accuracy fairly.
      </Callout>

      <div className="max-w-sm">
        <SliderField label="Sub-intervals n" value={n} onChange={(v) => setNHalf(Math.max(1, Math.round(v / 2)))} min={2} max={40} step={2} />
      </div>

      <div className={cardGrid}>
        {data.map((r) => (
          <Card key={r.method} className={r.method === best.method ? "ring-2 ring-emerald-400" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{r.method}</h4>
                {r.method === best.method && <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Most accurate</Badge>}
              </div>
              <div className="text-2xl font-bold stat-number">{r.value.toFixed(8)}</div>
              <div className="text-xs text-muted-foreground mt-1">abs error {r.err.toExponential(2)} · {r.order}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ResultsTable
        rows={data}
        columns={[
          { key: "method", header: "Method" },
          { key: "value", header: "Estimate", render: (r) => r.value.toFixed(8) },
          { key: "err", header: "Absolute error", render: (r) => r.err.toExponential(3) },
          { key: "pct", header: "Rel. error %", render: (r) => r.pct.toExponential(2) },
          { key: "order", header: "Error order" },
          { key: "evals", header: "f-evals (cost)", render: (r) => String(r.evals) },
        ]}
        caption="Simpson's rules are two orders more accurate than Trapezoidal at the same cost — the pay-off of higher-order interpolation."
      />
    </div>
  );
}

/* ===== 2. Root Finding ====================================== */
function RootCompare() {
  const [tolExp, setTolExp] = useState(6); // tol = 10^-tolExp
  const tol = Math.pow(10, -tolExp);
  // Benchmark: x³ − x − 2 = 0, root ≈ 1.52137971.
  const f = (x: number) => x ** 3 - x - 2;
  const df = (x: number) => centralDiff(f, x, 1e-6);
  const ROOT = 1.5213797068045676;

  const data = useMemo(() => {
    const bi = bisection(f, 1, 2, tol);
    const nr = newtonRaphson(f, df, 1.5, tol);
    const sc = secant(f, 1, 2, tol);
    return [
      { method: "Bisection", root: bi.root, iters: bi.steps.length, err: Math.abs(bi.root - ROOT), order: "Linear (1)", needs: "Bracket [a,b]", robust: "Guaranteed", steps: bi.steps },
      { method: "Newton–Raphson", root: nr.root, iters: nr.steps.length, err: Math.abs(nr.root - ROOT), order: "Quadratic (2)", needs: "f, f′, x₀", robust: "Can diverge", steps: nr.steps },
      { method: "Secant", root: sc.root, iters: sc.steps.length, err: Math.abs(sc.root - ROOT), order: "Superlinear (1.618)", needs: "x₀, x₁", robust: "Can diverge", steps: sc.steps },
    ];
  }, [tol]);

  const fastest = data.reduce((m, r) => (r.iters < m.iters ? r : m), data[0]);

  // Convergence curves (error vs iteration) for the chart.
  const series = [
    { name: "Bisection", color: "#e11d48", dataKey: "biErr", data: data[0].steps.map((s) => ({ iter: s.iter, biErr: Math.max(s.error, 1e-16) })) },
    { name: "Newton–Raphson", color: "#2563eb", dataKey: "nrErr", data: data[1].steps.map((s) => ({ iter: s.iter, nrErr: Math.max(s.error, 1e-16) })) },
    { name: "Secant", color: "#16a34a", dataKey: "scErr", data: data[2].steps.map((s) => ({ iter: s.iter, scErr: Math.max(s.error, 1e-16) })) },
  ];

  return (
    <div className="space-y-6">
      <Callout tone="info" title="Benchmark problem">
        Solve <MathTeX tex="x^3 - x - 2 = 0" /> (root ≈ 1.52138). Bisection brackets <MathTeX tex="[1,2]" />,
        Newton starts at <MathTeX tex="x_0=1.5" />, Secant uses <MathTeX tex="x_0=1,\,x_1=2" />.
      </Callout>

      <div className="max-w-sm">
        <SliderField label="Tolerance 10⁻ⁿ (n)" value={tolExp} onChange={(v) => setTolExp(Math.round(v))} min={2} max={12} step={1} />
      </div>

      <div className={cardGrid}>
        {data.map((r) => (
          <Card key={r.method} className={r.method === fastest.method ? "ring-2 ring-emerald-400" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{r.method}</h4>
                {r.method === fastest.method && <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Fewest steps</Badge>}
              </div>
              <div className="text-2xl font-bold stat-number">{r.iters}</div>
              <div className="text-xs text-muted-foreground mt-1">iterations · err {r.err.toExponential(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <LineFigure
        height={300}
        xKey="iter"
        xLabel="Iteration"
        yLabel="error"
        series={series}
      />
      <p className="text-xs text-muted-foreground -mt-2">
        Newton and Secant plunge far faster than Bisection's steady halving — the reward for using gradient
        information, at the cost of guaranteed convergence.
      </p>

      <ResultsTable
        rows={data}
        columns={[
          { key: "method", header: "Method" },
          { key: "iters", header: "Iterations" },
          { key: "err", header: "Final error", render: (r) => r.err.toExponential(3) },
          { key: "order", header: "Convergence order" },
          { key: "needs", header: "Requires" },
          { key: "robust", header: "Robustness" },
        ]}
        caption="The classic trade-off: Bisection is slow but cannot fail; Newton/Secant are fast but need a good guess."
      />
    </div>
  );
}

/* ===== 3. Differential Equations ============================ */
function ODECompare() {
  const [steps, setSteps] = useState(10);
  // Benchmark: y' = y, y(0)=1 → exact e^x; integrate to x=1.
  const f = (_x: number, y: number) => y;
  const exact = (x: number) => Math.exp(x);
  const h = 1 / steps;

  const data = useMemo(() => {
    const e = euler(f, 0, 1, h, steps, exact);
    const r2 = rk2(f, 0, 1, h, steps, exact);
    const r4 = rk4(f, 0, 1, h, steps, exact);
    const last = (r: typeof e) => r.steps[r.steps.length - 1];
    return {
      euler: e, rk2: r2, rk4: r4,
      rows: [
        { method: "Euler", yEnd: last(e).y, err: last(e).error ?? 0, order: "O(h)", slopes: 1 },
        { method: "RK2 (midpoint)", yEnd: last(r2).y, err: last(r2).error ?? 0, order: "O(h²)", slopes: 2 },
        { method: "RK4", yEnd: last(r4).y, err: last(r4).error ?? 0, order: "O(h⁴)", slopes: 4 },
      ],
    };
  }, [steps]);

  const best = data.rows.reduce((m, r) => (r.err < m.err ? r : m), data.rows[0]);

  const series = [
    { name: "Exact eˣ", color: "#0f172a", dataKey: "exact", dash: true, data: data.euler.steps.map((s) => ({ x: +s.x.toFixed(3), exact: s.exact })) },
    { name: "Euler", color: "#e11d48", dataKey: "euler", dot: true, data: data.euler.steps.map((s) => ({ x: +s.x.toFixed(3), euler: s.y })) },
    { name: "RK2", color: "#f59e0b", dataKey: "rk2", dot: true, data: data.rk2.steps.map((s) => ({ x: +s.x.toFixed(3), rk2: s.y })) },
    { name: "RK4", color: "#16a34a", dataKey: "rk4", dot: true, data: data.rk4.steps.map((s) => ({ x: +s.x.toFixed(3), rk4: s.y })) },
  ];

  return (
    <div className="space-y-6">
      <Callout tone="info" title="Benchmark problem">
        Solve <MathTeX tex="y' = y,\; y(0)=1" /> on <MathTeX tex="[0,1]" /> — exact solution <MathTeX tex="y=e^x" />,
        so <MathTeX tex="y(1)=e\approx 2.71828" />.
      </Callout>

      <div className="max-w-sm">
        <SliderField label="Number of steps (h = 1/steps)" value={steps} onChange={(v) => setSteps(Math.max(2, Math.round(v)))} min={2} max={40} step={1} />
      </div>

      <div className={cardGrid}>
        {data.rows.map((r) => (
          <Card key={r.method} className={r.method === best.method ? "ring-2 ring-emerald-400" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{r.method}</h4>
                {r.method === best.method && <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Most accurate</Badge>}
              </div>
              <div className="text-2xl font-bold stat-number">{r.yEnd.toFixed(6)}</div>
              <div className="text-xs text-muted-foreground mt-1">error {r.err.toExponential(2)} · {r.order}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <LineFigure height={300} xKey="x" xLabel="x" yLabel="y(x)" series={series} />
      <p className="text-xs text-muted-foreground -mt-2">
        Euler visibly lags the true curve; RK4 overlays it almost perfectly even with few steps.
      </p>

      <ResultsTable
        rows={data.rows}
        columns={[
          { key: "method", header: "Method" },
          { key: "yEnd", header: "y(1) estimate", render: (r) => r.yEnd.toFixed(6) },
          { key: "err", header: "Error at x=1", render: (r) => r.err.toExponential(3) },
          { key: "order", header: "Global error" },
          { key: "slopes", header: "Slope evals / step", render: (r) => String(r.slopes) },
        ]}
        caption="RK4 evaluates the slope four times per step but its error falls as h⁴ — far cheaper per digit of accuracy than Euler."
      />
    </div>
  );
}

export default function ComparisonDashboard() {
  useEffect(() => {
    document.title = "Method Comparison Dashboard — MSc Physics Computer Programming Lab | Dr. Kishora Nayak";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Compare numerical methods side by side: Trapezoidal vs Simpson integration, Bisection vs Newton–Raphson vs Secant root finding, and Euler vs RK2 vs RK4 for differential equations — accuracy, error and computational cost.");
    window.scrollTo(0, 0);
  }, []);

  return (
    <LabShell crumb="Comparison Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Trophy className="w-3.5 h-3.5" /> Method Trade-offs
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif gradient-text mb-2 flex items-center gap-3">
            <GitCompareArrows className="w-8 h-8 text-primary shrink-0" />
            Comparison Dashboard
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Numerical methods trade accuracy against stability and computational cost. Each tab runs a
            shared benchmark problem so you can see exactly how competing methods stack up — change the
            parameters and watch the rankings respond.
          </p>
        </div>

        <Tabs defaultValue="integration" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="integration" className="gap-1.5"><Sigma className="w-4 h-4" /> Integration</TabsTrigger>
            <TabsTrigger value="roots" className="gap-1.5"><Crosshair className="w-4 h-4" /> Root Finding</TabsTrigger>
            <TabsTrigger value="ode" className="gap-1.5"><Activity className="w-4 h-4" /> Differential Equations</TabsTrigger>
          </TabsList>
          <TabsContent value="integration"><IntegrationCompare /></TabsContent>
          <TabsContent value="roots"><RootCompare /></TabsContent>
          <TabsContent value="ode"><ODECompare /></TabsContent>
        </Tabs>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          <StatTile label="Method families compared" value="3" />
          <StatTile label="Methods benchmarked" value="9" accent="text-emerald-600" />
          <StatTile label="Live, adjustable benchmarks" value="3" accent="text-amber-600" />
        </div>

        <div className="mt-10 pt-8 border-t border-border">
          <Link
            href="/teaching/computer-programming"
            className="group inline-flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Back to</div>
              <div className="text-sm font-semibold">Laboratory Dashboard</div>
            </div>
          </Link>
        </div>
      </div>
    </LabShell>
  );
}

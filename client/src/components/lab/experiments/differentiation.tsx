import { useMemo, useState } from "react";
import { forwardDiff, backwardDiff, centralDiff } from "@/lib/lab/numerics";
import type { ScalarFn } from "@/lib/lab/expr";
import { NumberField } from "@/components/lab/ParamControl";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import { Callout, FactGrid } from "@/components/lab/Content";
import MathTeX from "@/components/lab/MathTeX";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

interface Preset {
  id: string;
  label: string;
  f: ScalarFn;
  df: ScalarFn; // exact derivative
  dfTex: string;
  x: number;
}

const PRESETS: Preset[] = [
  { id: "sin", label: "f(x) = sin x", f: Math.sin, df: Math.cos, dfTex: "f'(x) = \\cos x", x: 1 },
  { id: "exp", label: "f(x) = eˣ", f: Math.exp, df: Math.exp, dfTex: "f'(x) = e^{x}", x: 1 },
  { id: "cubic", label: "f(x) = x³", f: (x) => x ** 3, df: (x) => 3 * x * x, dfTex: "f'(x) = 3x^{2}", x: 2 },
  { id: "ln", label: "f(x) = ln x", f: Math.log, df: (x) => 1 / x, dfTex: "f'(x) = 1/x", x: 2 },
  { id: "gauss", label: "f(x) = e^(−x²)", f: (x) => Math.exp(-x * x), df: (x) => -2 * x * Math.exp(-x * x), dfTex: "f'(x) = -2x\\,e^{-x^2}", x: 0.5 },
];

function DiffSim() {
  const [presetId, setPresetId] = useState("sin");
  const [xStr, setXStr] = useState("1");
  const [hStr, setHStr] = useState("0.1");
  const [run, setRun] = useState(0);

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const x = parseFloat(xStr), h = parseFloat(hStr);

  const errors: Record<string, string> = {};
  if (!Number.isFinite(x)) errors.x = "Enter a number.";
  if (!Number.isFinite(h) || h <= 0) errors.h = "Step h must be positive.";
  if (Number.isFinite(h) && h > 0 && presetId === "ln" && Number.isFinite(x) && x - h <= 0) errors.h = "x − h must stay positive for ln x.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const exact = preset.df(x);
    const fwd = forwardDiff(preset.f, x, h);
    const bwd = backwardDiff(preset.f, x, h);
    const ctr = centralDiff(preset.f, x, h);
    const err = (v: number) => Math.abs(v - exact);
    // sweep h to show error scaling
    const sweep: { h: number; fwd: number; ctr: number }[] = [];
    for (let k = 0; k < 18; k++) {
      const hk = 0.5 ** k; // 1, 0.5, 0.25, ...
      if (presetId === "ln" && x - hk <= 0) continue;
      sweep.push({
        h: +hk.toFixed(8),
        fwd: Math.max(err(forwardDiff(preset.f, x, hk)), 1e-18),
        ctr: Math.max(err(centralDiff(preset.f, x, hk)), 1e-18),
      });
    }
    const rows = [
      { method: "Forward", formula: "[f(x+h) − f(x)] / h", value: fwd, error: err(fwd), order: "O(h)" },
      { method: "Backward", formula: "[f(x) − f(x−h)] / h", value: bwd, error: err(bwd), order: "O(h)" },
      { method: "Central", formula: "[f(x+h) − f(x−h)] / 2h", value: ctr, error: err(ctr), order: "O(h²)" },
    ];
    return { exact, fwd, bwd, ctr, err, sweep, rows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setPresetId("sin"); setXStr("1"); setHStr("0.1"); setRun((r) => r + 1); }}
      runLabel="Differentiate"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Function f(x)</Label>
            <Select value={presetId} onValueChange={(v) => { setPresetId(v); setXStr(String(PRESETS.find((q) => q.id === v)!.x)); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => <SelectItem key={p.id} value={p.id} className="text-sm">{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Exact derivative is known, so true error is shown.</p>
          </div>
          <NumberField label="Evaluate derivative at x =" value={xStr} onChange={setXStr} step="any" error={errors.x} />
          <NumberField label="Step size h" value={hStr} onChange={setHStr} step="any" error={errors.h} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Choose a function and a positive step size.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Exact f'(x)" value={result.exact.toFixed(6)} accent="text-emerald-600" />
              <StatTile label="Forward" value={result.fwd.toFixed(6)} />
              <StatTile label="Backward" value={result.bwd.toFixed(6)} />
              <StatTile label="Central" value={result.ctr.toFixed(6)} accent="text-violet-600" />
            </div>

            <OutputBlock title="Visualization — error vs step size h (log–log)">
              <LineFigure
                height={300}
                xKey="h"
                xLabel="h"
                yLabel="|error|"
                series={[
                  { name: "Forward (O(h))", color: "#0ea5e9", dataKey: "fwd", dot: true, data: result.sweep },
                  { name: "Central (O(h²))", color: "#7c3aed", dot: true, dataKey: "ctr", data: result.sweep },
                ]}
              />
              <p className="text-xs text-muted-foreground mt-2">
                As h shrinks, the central-difference error falls faster (slope 2 on log–log) than the
                forward-difference error (slope 1) — until <strong>round-off</strong> takes over at very small h
                and the error rises again, revealing the optimal step.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — three finite-difference formulas">
              <ResultsTable
                rows={result.rows}
                columns={[
                  { key: "method", header: "Method" },
                  { key: "formula", header: "Formula" },
                  { key: "value", header: "f'(x)", render: (r) => r.value.toFixed(8) },
                  { key: "error", header: "abs error", render: (r) => r.error.toExponential(3) },
                  { key: "order", header: "order" },
                ]}
                caption="Central difference is second-order accurate and usually the best choice for smooth functions."
              />
            </OutputBlock>
          </>
        )
      }
    />
  );
}

export default function build(meta: ExperimentMeta, prev?: any, next?: any): ExperimentContent {
  return {
    meta,
    prev: prev && { id: prev.id, name: prev.name },
    next: next && { id: next.id, name: next.name },
    intro: (
      <>
        <p>
          <strong>Numerical differentiation</strong> estimates the derivative of a function from its values at
          discrete points — essential when only tabulated or measured data is available and no analytic formula
          exists. The basic tools are the <strong>forward</strong>, <strong>backward</strong> and
          <strong> central</strong> difference formulas.
        </p>
        <p>
          In physics we constantly extract rates from data: velocity and acceleration from position
          measurements, currents from charge, gradients of fields. Numerical differentiation also underlies the
          finite-difference solution of differential equations.
        </p>
        <Callout tone="info" title="Slopes from samples">
          Each formula approximates the tangent slope <MathTeX tex="f'(x)" /> by the slope of a secant through
          nearby sample points separated by a small step <MathTeX tex="h" />.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Estimating derivatives numerically is everywhere in experimental and computational physics:</p>
        <ul>
          <li><strong>Kinematics from data:</strong> velocity v = dx/dt and acceleration a = dv/dt from tracked positions.</li>
          <li><strong>Field gradients:</strong> electric field E = −dV/dx from a potential profile.</li>
          <li><strong>Thermodynamics:</strong> specific heat C = dQ/dT and other response coefficients.</li>
          <li><strong>Finite-difference PDE solvers:</strong> discretising spatial derivatives in heat/wave equations.</li>
          <li><strong>Signal analysis:</strong> edge detection and rate-of-change of experimental time series.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>From Taylor expansions about <MathTeX tex="x" />, three first-derivative formulas follow:</p>
        <h3>Forward difference</h3>
        <MathTeX block tex="f'(x) \approx \frac{f(x+h)-f(x)}{h} + O(h)." />
        <h3>Backward difference</h3>
        <MathTeX block tex="f'(x) \approx \frac{f(x)-f(x-h)}{h} + O(h)." />
        <h3>Central difference</h3>
        <p>Subtracting the forward and backward expansions cancels the <MathTeX tex="h" /> term:</p>
        <MathTeX block tex="\boxed{\,f'(x) \approx \frac{f(x+h)-f(x-h)}{2h}\,} + O(h^2)." />
        <p>
          Forward and backward are <strong>first-order</strong> (<MathTeX tex="O(h)" />) while central is
          <strong> second-order</strong> (<MathTeX tex="O(h^2)" />) — far more accurate for the same step.
        </p>
        <h3>The round-off trade-off</h3>
        <p>
          The total error is the sum of <strong>truncation error</strong> (falls with smaller
          <MathTeX tex="\,h" />) and <strong>round-off error</strong> (grows as <MathTeX tex="\sim \varepsilon/h" />
          {" "}because we subtract nearly-equal numbers). There is therefore an <strong>optimal</strong>
          {" "}<MathTeX tex="h" /> — too small is as bad as too large.
        </p>
        <Callout tone="warn" title="Subtractive cancellation">
          Making <MathTeX tex="h" /> tiny does not keep improving accuracy: the difference of two close values
          loses significant digits, and the error eventually <em>increases</em>.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Works on tabulated/measured data; simple; central difference gives second-order accuracy at low cost." },
          { label: "Limitations", value: "Sensitive to round-off and noise; accuracy limited by step size; higher derivatives amplify errors." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Choose the point x and a small step size h." },
        { label: "Evaluate the function at the needed points: f(x−h), f(x), f(x+h)." },
        { label: "Forward: [f(x+h) − f(x)] / h." },
        { label: "Backward: [f(x) − f(x−h)] / h." },
        { label: "Central: [f(x+h) − f(x−h)] / (2h)." },
        { label: "Compare with the exact derivative (if known) and study how the error varies with h." },
      ],
      pseudocode: `INPUT f, x, h
fwd ← (f(x+h) - f(x)) / h          // O(h)
bwd ← (f(x)   - f(x-h)) / h        // O(h)
ctr ← (f(x+h) - f(x-h)) / (2*h)    // O(h^2)
OUTPUT fwd, bwd, ctr`,
      flowchart: ["Start", "Read f, x, h", "Compute f(x−h), f(x), f(x+h)", "Forward / Backward / Central", "Compare error vs h", "Output derivatives", "Stop"],
    },
    simulator: <DiffSim />,
    cFilename: "differentiation.c",
    cCode: `/* Numerical Differentiation - forward, backward, central differences
 * Compile: gcc differentiation.c -o diff -lm
 */
#include <stdio.h>
#include <math.h>

/* example: f(x) = sin(x), exact f'(x) = cos(x) */
double f(double x) { return sin(x); }

int main(void) {
    double x, h, fwd, bwd, ctr, exact;

    printf("Enter x and step h: ");
    scanf("%lf %lf", &x, &h);

    fwd = (f(x + h) - f(x)) / h;
    bwd = (f(x) - f(x - h)) / h;
    ctr = (f(x + h) - f(x - h)) / (2 * h);
    exact = cos(x);

    printf("Forward  : %.8lf  (err %.2e)\\n", fwd, fabs(fwd - exact));
    printf("Backward : %.8lf  (err %.2e)\\n", bwd, fabs(bwd - exact));
    printf("Central  : %.8lf  (err %.2e)\\n", ctr, fabs(ctr - exact));
    printf("Exact    : %.8lf\\n", exact);
    return 0;
}`,
    viva: [
      { q: "Write the forward, backward and central difference formulas.", a: "Forward: [f(x+h)−f(x)]/h; Backward: [f(x)−f(x−h)]/h; Central: [f(x+h)−f(x−h)]/(2h)." },
      { q: "What is the order of accuracy of each formula?", a: "Forward and backward are O(h); central is O(h²)." },
      { q: "Why is the central difference more accurate?", a: "Adding the forward and backward Taylor expansions cancels the first-order error term, leaving O(h²)." },
      { q: "From what are these formulas derived?", a: "From Taylor-series expansions of f(x±h) about x." },
      { q: "What two errors compete in numerical differentiation?", a: "Truncation error (decreases with smaller h) and round-off error (increases as h→0)." },
      { q: "Why does taking h extremely small hurt accuracy?", a: "Subtracting nearly equal function values causes subtractive cancellation, losing significant digits." },
      { q: "Is there an optimal step size?", a: "Yes — where truncation and round-off errors balance; for central difference it scales like h ≈ (ε)^{1/3}." },
      { q: "Give the second-derivative central formula.", a: "f″(x) ≈ [f(x+h) − 2f(x) + f(x−h)] / h², which is O(h²)." },
      { q: "Which formula is best near a boundary where only one side is available?", a: "Forward (at the left end) or backward (at the right end) difference." },
      { q: "How does noise in data affect numerical differentiation?", a: "It is amplified by dividing by small h; smoothing or fitting is often applied first." },
      { q: "How can accuracy be improved without shrinking h?", a: "Use higher-order formulas (more points) or Richardson extrapolation." },
      { q: "What is Richardson extrapolation?", a: "Combining estimates at h and h/2 to cancel the leading error term and raise the order of accuracy." },
      { q: "Why is numerical differentiation called ill-conditioned?", a: "Small input errors (round-off/noise) are magnified by the 1/h factor, unlike numerical integration which smooths errors." },
      { q: "How are these formulas used to solve PDEs?", a: "Finite-difference methods replace spatial/temporal derivatives with difference quotients on a grid." },
      { q: "Give a physics example of numerical differentiation.", a: "Computing velocity and acceleration from position-vs-time data, or E = −dV/dx from a potential profile." },
    ],
    problems: [
      { level: "Easy", text: "Estimate f'(1) for f(x)=sin x with h=0.1 using all three formulas and compare with cos 1.", hint: "cos 1 ≈ 0.5403." },
      { level: "Easy", text: "Compute f'(2) for f(x)=x³ with h=0.01 and compare with 12.", hint: "Central should be essentially exact for cubics? Check the O(h²) term." },
      { level: "Easy", text: "Find f'(1) for f(x)=eˣ with h=0.05 and report the absolute error.", hint: "Exact is e ≈ 2.71828." },
      { level: "Medium", text: "Tabulate the central-difference error for h = 0.1, 0.05, 0.025 and verify it falls ~4×.", hint: "O(h²) ⇒ ratio 4." },
      { level: "Medium", text: "Show numerically that for very small h (e.g. 1e−10) the error grows due to round-off.", hint: "Subtractive cancellation." },
      { level: "Medium", text: "Estimate the optimal h for central difference of sin x at x=1 in double precision.", hint: "≈ ε^{1/3} ≈ 6×10⁻⁶." },
      { level: "Medium", text: "Use the second-difference formula to estimate f″(1) for f(x)=sin x.", hint: "Exact f″ = −sin 1 ≈ −0.8415." },
      { level: "Advanced", text: "Apply Richardson extrapolation to central differences at h and h/2 and show the improved order.", hint: "D = (4D(h/2) − D(h))/3." },
      { level: "Advanced", text: "Add random noise to tabulated data and study how it corrupts the numerical derivative.", hint: "Noise/h blows up as h shrinks." },
      { level: "Advanced", text: "Derive a four-point O(h⁴) central formula for f'(x) and test it against sin x.", hint: "[−f(x+2h)+8f(x+h)−8f(x−h)+f(x−2h)]/(12h)." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 23 (numerical differentiation).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §5.7 (numerical derivatives).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. W. Hamming, <em>Numerical Methods for Scientists and Engineers</em>.</li>
      </ul>
    ),
  };
}

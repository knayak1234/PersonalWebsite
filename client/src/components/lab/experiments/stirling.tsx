import { useMemo, useState } from "react";
import { stirling } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { NumberField, TextField } from "@/components/lab/ParamControl";
import { LineFigure, ScatterFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function parseList(raw: string): number[] {
  return raw.split(/[,\s]+/).map((s) => parseFloat(s)).filter((v) => !Number.isNaN(v));
}

function equallySpaced(xs: number[]): boolean {
  if (xs.length < 2) return false;
  const h = xs[1] - xs[0];
  for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - xs[i - 1] - h) > 1e-9) return false;
  return true;
}

function StirlingSim() {
  const [xStr, setXStr] = useState("0, 1, 2, 3, 4");
  const [yStr, setYStr] = useState("1, 1.5431, 3.7622, 10.0677, 27.3082");
  const [xpStr, setXp] = useState("2.2");
  const [run, setRun] = useState(0);

  const xs = parseList(xStr), ys = parseList(yStr);
  const xp = parseFloat(xpStr);
  const errors: Record<string, string> = {};
  if (xs.length < 3) errors.x = "Enter at least three x-values.";
  else if (!equallySpaced(xs)) errors.x = "Stirling requires equally spaced x-values.";
  if (ys.length !== xs.length) errors.y = "x and y counts must match.";
  if (!Number.isFinite(xp)) errors.xp = "Enter a number.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const res = stirling(xs, ys, xp);
    const a = Math.min(...xs), b = Math.max(...xs);
    const curve: { x: number; y: number }[] = [];
    for (let i = 0; i <= 120; i++) {
      const xx = a + (i / 120) * (b - a);
      curve.push({ x: +xx.toFixed(4), y: stirling(xs, ys, xx).value });
    }
    const pts = xs.map((x, i) => ({ x, y: ys[i] }));
    return { res, curve, pts, midX: xs[res.mid] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setXStr("0, 1, 2, 3, 4"); setYStr("1, 1.5431, 3.7622, 10.0677, 27.3082"); setXp("2.2"); setRun((r) => r + 1); }}
      runLabel="Interpolate"
      controls={
        <>
          <TextField label="x-values (equally spaced)" value={xStr} onChange={setXStr} error={errors.x} hint="Constant step h; odd count works best." />
          <TextField label="y-values" value={yStr} onChange={setYStr} error={errors.y} />
          <NumberField label="Interpolate at x =" value={xpStr} onChange={setXp} step="any" error={errors.xp} hint="Best near the central node." />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">
            {errors.x ?? "Provide equally spaced data and a target x."}
          </Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label={`f(${xp})`} value={result.res.value.toFixed(6)} />
              <StatTile label="Central node x₀" value={String(result.midX)} accent="text-emerald-600" />
              <StatTile label="p = (x−x₀)/h" value={result.res.p.toFixed(4)} accent="text-violet-600" />
              <StatTile label="Points" value={String(xs.length)} accent="text-amber-600" />
            </div>

            {Math.abs(result.res.p) > 0.75 && (
              <Callout tone="warn" title="Target far from centre">
                Stirling's formula is most accurate for |p| ≤ ¼–½ (x near the central node). Here |p| is larger, so
                Bessel's or a forward/backward formula may be preferable.
              </Callout>
            )}

            <OutputBlock title="Visualization — Stirling interpolant through the data">
              <LineFigure
                height={300}
                xKey="x"
                xLabel="x"
                yLabel="f(x)"
                series={[{ name: "Stirling interpolant", color: "#e11d48", dataKey: "y", data: result.curve }]}
              />
              <div className="mt-3">
                <ScatterFigure
                  height={200}
                  xLabel="x"
                  yLabel="y"
                  groups={[
                    { name: "Data points", data: result.pts, color: "#e11d48" },
                    { name: `Interpolated (${xp}, ${result.res.value.toFixed(3)})`, data: [{ x: xp, y: result.res.value }], color: "#16a34a" },
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Stirling's formula averages the forward and backward Gauss formulas, giving high accuracy near the middle
                of the table.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — central difference table">
              <div className="overflow-x-auto">
                <table className="text-xs font-mono mx-auto">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="px-2 py-1 text-right">x</th><th className="px-2 py-1 text-right">y</th>
                      {result.res.table.slice(1).map((_, l) => <th key={l} className="px-2 py-1 text-right">Δ{l + 1}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {xs.map((x, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1 text-right">{x}</td>
                        {result.res.table.map((col, l) => (
                          <td key={l} className={`px-2 py-1 text-right ${i === result.res.mid && l === 0 ? "text-primary font-semibold" : ""}`}>
                            {i < col.length ? col[i].toFixed(4) : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                The formula combines the central row's differences with the parameter p = (x − x₀)/h.
              </p>
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
          <strong>Stirling's interpolation formula</strong> is a <em>central-difference</em> method for equally spaced
          data. Unlike Newton's forward or backward formulas — which are most accurate near the start or end of a table —
          Stirling gives its best accuracy near the <strong>middle</strong>, exactly where the other two are weakest.
        </p>
        <p>
          It is obtained by averaging Gauss's forward and backward central-difference formulas, and is the method of
          choice when the interpolation point lies close to a central tabulated value.
        </p>
        <Callout tone="info" title="Best in the middle">
          Choose the central node <MathTeX tex="x_0" /> nearest the target so that <MathTeX tex="p=(x-x_0)/h" /> is small
          (ideally <MathTeX tex="|p|\le \tfrac14" />) for maximum accuracy.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Central-difference interpolation is valued whenever a dense, evenly spaced table is available:</p>
        <ul>
          <li><strong>Mathematical tables:</strong> trigonometric, logarithmic and special-function tables.</li>
          <li><strong>Astronomical ephemerides:</strong> interpolating tabulated positions at mid-interval times.</li>
          <li><strong>Numerical differentiation:</strong> central-difference derivatives derive from these formulas.</li>
          <li><strong>Experimental data:</strong> smoothing and reading values from equally sampled measurements.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Let the data be equally spaced with step <MathTeX tex="h" />, central node <MathTeX tex="x_0" />, and
          <MathTeX tex="\,p = (x - x_0)/h" />. Stirling's formula is
        </p>
        <MathTeX block tex="f(x) = y_0 + p\,\frac{\Delta y_{-1} + \Delta y_{0}}{2} + \frac{p^2}{2!}\,\Delta^2 y_{-1} + \frac{p(p^2-1)}{3!}\,\frac{\Delta^3 y_{-2} + \Delta^3 y_{-1}}{2} + \frac{p^2(p^2-1)}{4!}\,\Delta^4 y_{-2} + \cdots" />
        <p>
          The odd-order terms use the <em>average</em> of two central differences, while the even-order terms use a
          single central difference — this symmetry is what concentrates the accuracy around <MathTeX tex="x_0" />.
        </p>
        <h3>Relation to Gauss's formulas</h3>
        <p>Stirling is the arithmetic mean of the Gauss forward and Gauss backward central-difference formulas:</p>
        <MathTeX block tex="\text{Stirling} = \tfrac12\big(\text{Gauss forward} + \text{Gauss backward}\big)." />
        <Callout tone="tip" title="When to use which">
          Use <strong>Newton forward</strong> near the top of the table, <strong>Newton backward</strong> near the bottom,
          <strong> Stirling</strong> near the centre (small <MathTeX tex="|p|" />), and <strong>Bessel</strong> when the
          target sits midway between two nodes (<MathTeX tex="p\approx\tfrac12" />).
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "High accuracy near the table centre; rapidly converging; symmetric use of differences." },
          { label: "Limitations", value: "Requires equal spacing; needs data on both sides of x₀; less accurate as |p| grows." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read equally spaced data (constant step h)." },
        { label: "Choose the central node x₀ nearest the target x." },
        { label: "Build the central difference table (Δ, Δ², Δ³, …)." },
        { label: "Compute p = (x − x₀)/h." },
        { label: "Apply Stirling's formula, averaging odd-order differences." },
        { label: "Output the interpolated value." },
      ],
      pseudocode: `INPUT x[], y[], xp        /* equally spaced */
h ← x[1]-x[0];  mid ← n/2
build central difference table Δ
p ← (xp - x[mid]) / h
value ← y[mid]
value += p*(Δ1[mid-1]+Δ1[mid])/2
value += p*p/2 * Δ2[mid-1]
value += p*(p*p-1)/6 * (Δ3[mid-2]+Δ3[mid-1])/2
value += p*p*(p*p-1)/24 * Δ4[mid-2]
OUTPUT value`,
      flowchart: ["Start", "Read equally spaced data", "Pick central x_0", "Build Δ table", "p = (x−x_0)/h", "Apply Stirling formula", "Output value", "Stop"],
    },
    simulator: <StirlingSim />,
    cFilename: "stirling.c",
    cCode: `/* Stirling's Central Difference Interpolation (equally spaced)
 * Compile: gcc stirling.c -o stir -lm
 */
#include <stdio.h>

int main(void) {
    int n, i, j, mid;
    double x[20], y[20][20], xp, h, p, value;

    printf("Enter number of points (odd): ");
    scanf("%d", &n);
    printf("Enter x and y:\\n");
    for (i = 0; i < n; i++) scanf("%lf %lf", &x[i], &y[i][0]);
    printf("Enter x to interpolate: ");
    scanf("%lf", &xp);

    for (j = 1; j < n; j++)
        for (i = 0; i < n-j; i++)
            y[i][j] = y[i+1][j-1] - y[i][j-1];

    h = x[1]-x[0];
    mid = n/2;
    p = (xp - x[mid]) / h;
    value = y[mid][0];
    value += p*(y[mid-1][1]+y[mid][1])/2.0;
    value += p*p/2.0 * y[mid-1][2];
    if (n > 3) {
        value += p*(p*p-1)/6.0 * (y[mid-2][3]+y[mid-1][3])/2.0;
        value += p*p*(p*p-1)/24.0 * y[mid-2][4];
    }

    printf("Interpolated value f(%.4lf) = %.6lf\\n", xp, value);
    return 0;
}`,
    viva: [
      { q: "What kind of data does Stirling's formula require?", a: "Equally spaced data (constant step h), with points on both sides of the central node." },
      { q: "Where is Stirling's formula most accurate?", a: "Near the middle of the table, where p = (x−x₀)/h is small (ideally |p| ≤ 1/4)." },
      { q: "How is Stirling's formula derived?", a: "By averaging Gauss's forward and backward central-difference interpolation formulas." },
      { q: "What is p in the formula?", a: "The normalised distance p = (x − x₀)/h from the central node x₀." },
      { q: "How do odd- and even-order terms differ?", a: "Odd-order terms use the average of two central differences; even-order terms use a single central difference." },
      { q: "When would you use Newton's forward formula instead?", a: "When the interpolation point is near the beginning of the table." },
      { q: "When is Bessel's formula preferred?", a: "When the target lies roughly midway between two nodes (p ≈ 1/2)." },
      { q: "What is a central difference?", a: "A difference formed symmetrically about a point, e.g. δy = y_{i+1} − y_{i−1} or the tabulated Δ centred on x₀." },
      { q: "Why does central differencing give better accuracy?", a: "Leading error terms cancel by symmetry, raising the effective order of accuracy." },
      { q: "Can Stirling's formula be used for differentiation?", a: "Yes; differentiating it at p = 0 yields accurate central-difference derivative formulas." },
      { q: "What happens to accuracy as |p| increases?", a: "It degrades; the formula is designed for interpolation close to the central node." },
    ],
    problems: [
      { level: "Easy", text: "Build the central difference table for y = 1,1.54,3.76,10.07,27.31 at x = 0..4.", hint: "Forward differences from y." },
      { level: "Easy", text: "Compute p for x = 2.2 with x₀ = 2 and h = 1.", hint: "p = 0.2." },
      { level: "Easy", text: "Interpolate f(2.2) using the first three Stirling terms.", hint: "y₀ + p·mean(Δ) + p²/2·Δ²." },
      { level: "Medium", text: "Compare Stirling and Newton-forward accuracy for the same target near the table centre.", hint: "Stirling should win." },
      { level: "Medium", text: "Show that Stirling equals the mean of Gauss forward and backward formulas.", hint: "Add and halve." },
      { level: "Medium", text: "Use Stirling's formula to interpolate tan(0.22) from a table at 0.0–0.4.", hint: "Central node 0.2." },
      { level: "Advanced", text: "Derive the central-difference first-derivative formula by differentiating Stirling at p = 0.", hint: "f'(x₀) ≈ (Δy_{-1}+Δy₀)/(2h) − …" },
      { level: "Advanced", text: "Investigate the error growth of Stirling's formula as p → 1.", hint: "Compare with Bessel." },
      { level: "Advanced", text: "Interpolate an astronomical ephemeris value at mid-interval and estimate the truncation error.", hint: "First neglected term." },
    ],
    references: (
      <ul>
        <li>B. S. Grewal, <em>Numerical Methods in Engineering &amp; Science</em> — central difference interpolation.</li>
        <li>S. S. Sastry, <em>Introductory Methods of Numerical Analysis</em>, PHI — Gauss, Stirling, Bessel formulas.</li>
        <li>M. K. Jain, S. R. K. Iyengar &amp; R. K. Jain, <em>Numerical Methods</em>.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

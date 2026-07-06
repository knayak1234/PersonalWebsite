import { useMemo, useState } from "react";
import { cubicSpline, sampleSpline } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { NumberField, TextField } from "@/components/lab/ParamControl";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure, ScatterFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function parseList(raw: string): number[] {
  return raw.split(/[,\s]+/).map((s) => parseFloat(s)).filter((v) => !Number.isNaN(v));
}

function CubicSplineSim() {
  const [xStr, setXStr] = useState("0, 1, 2, 3, 4");
  const [yStr, setYStr] = useState("0, 1, 0, 1, 0");
  const [xpStr, setXp] = useState("1.5");
  const [run, setRun] = useState(0);

  const xsRaw = parseList(xStr), ys = parseList(yStr);
  const paired = xsRaw.map((x, i) => [x, ys[i]] as [number, number]).sort((a, b) => a[0] - b[0]);
  const xs = paired.map((p) => p[0]);
  const ysSorted = paired.map((p) => p[1]);
  const xp = parseFloat(xpStr);

  const errors: Record<string, string> = {};
  if (xs.length < 3) errors.x = "Enter at least three x-values.";
  if (ys.length !== xsRaw.length) errors.y = "x and y counts must match.";
  if (new Set(xs).size !== xs.length) errors.x = "x-values must be distinct.";
  if (!Number.isFinite(xp)) errors.xp = "Enter a number.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const res = cubicSpline(xs, ysSorted, xp);
    const curve = sampleSpline(res, xs);
    const pts = xs.map((x, i) => ({ x, y: ysSorted[i] }));
    const rows = res.segments.map((s, i) => ({
      i: i + 1, range: `[${s.x0}, ${s.x1}]`, a: s.a, b: s.b, c: s.c, d: s.d,
    }));
    return { res, curve, pts, rows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setXStr("0, 1, 2, 3, 4"); setYStr("0, 1, 0, 1, 0"); setXp("1.5"); setRun((r) => r + 1); }}
      runLabel="Fit spline"
      controls={
        <>
          <TextField label="x-values (distinct)" value={xStr} onChange={setXStr} error={errors.x} hint="Any spacing; auto-sorted." />
          <TextField label="y-values" value={yStr} onChange={setYStr} error={errors.y} />
          <NumberField label="Evaluate at x =" value={xpStr} onChange={setXp} step="any" error={errors.xp} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Provide at least three distinct points and a target x.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatTile label={`S(${xp})`} value={result.res.value.toFixed(6)} />
              <StatTile label="Segments" value={String(result.res.segments.length)} accent="text-emerald-600" />
              <StatTile label="Data points" value={String(xs.length)} accent="text-violet-600" />
            </div>

            <OutputBlock title="Visualization — smooth natural cubic spline">
              <LineFigure
                height={300}
                xKey="x"
                xLabel="x"
                yLabel="S(x)"
                series={[{ name: "Cubic spline", color: "#db2777", dataKey: "spline", data: result.curve }]}
              />
              <div className="mt-3">
                <ScatterFigure
                  height={200}
                  xLabel="x"
                  yLabel="y"
                  groups={[
                    { name: "Knots (data points)", data: result.pts, color: "#db2777" },
                    { name: `Evaluated (${xp}, ${result.res.value.toFixed(3)})`, data: [{ x: xp, y: result.res.value }], color: "#16a34a" },
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Each interval carries its own cubic; the pieces join smoothly with matching first and second derivatives,
                so the curve looks like a single flexible strip through the knots.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — per-segment coefficients Sᵢ(x)=a+b(x−xᵢ)+c(x−xᵢ)²+d(x−xᵢ)³">
              <ResultsTable
                rows={result.rows}
                columns={[
                  { key: "i", header: "seg" },
                  { key: "range", header: "interval" },
                  { key: "a", header: "a", render: (r) => r.a.toFixed(4) },
                  { key: "b", header: "b", render: (r) => r.b.toFixed(4) },
                  { key: "c", header: "c", render: (r) => r.c.toFixed(4) },
                  { key: "d", header: "d", render: (r) => r.d.toFixed(4) },
                ]}
                caption="Natural spline: second derivative (c-related) is zero at the two end knots."
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
          A <strong>cubic spline</strong> fits a separate cubic polynomial to each interval between data points, then
          stitches the pieces together so that the curve and its first two derivatives are continuous everywhere. The
          result is the smoothest possible interpolant that still passes through every point — mimicking the flexible
          "spline" a draftsman once bent through pins.
        </p>
        <p>
          Splines avoid the wild oscillations (Runge phenomenon) that plague high-degree single polynomials, which makes
          them the standard tool for smooth interpolation and data smoothing.
        </p>
        <Callout tone="info" title="Local cubics, global smoothness">
          Low-degree pieces keep each interval well-behaved; the matching conditions at the knots deliver
          <MathTeX tex="\,C^2" /> smoothness across the whole range.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Cubic splines are ubiquitous in graphics, engineering and data analysis:</p>
        <ul>
          <li><strong>Computer graphics &amp; CAD:</strong> smooth curves and surfaces from control points.</li>
          <li><strong>Data smoothing:</strong> clean interpolation of noisy experimental measurements.</li>
          <li><strong>Trajectory &amp; path planning:</strong> smooth motion profiles for robots/animation.</li>
          <li><strong>Interpolating physical data:</strong> equations of state, cross-sections, calibration curves.</li>
          <li><strong>Numerical integration/differentiation:</strong> integrating or differentiating the spline.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          On each interval <MathTeX tex="[x_i, x_{i+1}]" /> the spline is a cubic
        </p>
        <MathTeX block tex="S_i(x) = a_i + b_i(x-x_i) + c_i(x-x_i)^2 + d_i(x-x_i)^3." />
        <p>The <MathTeX tex="n-1" /> cubics must satisfy, at the interior knots:</p>
        <MathTeX block tex="S_i(x_{i+1}) = S_{i+1}(x_{i+1}), \quad S_i'(x_{i+1}) = S_{i+1}'(x_{i+1}), \quad S_i''(x_{i+1}) = S_{i+1}''(x_{i+1})," />
        <p>
          i.e. the pieces meet with matching value, slope and curvature. Together with interpolation at every knot this
          determines all coefficients except for two boundary conditions.
        </p>
        <h3>Natural spline &amp; the tridiagonal system</h3>
        <p>
          The <em>natural</em> spline sets the second derivative to zero at the two ends,
          <MathTeX tex="\,S''(x_0)=S''(x_{n-1})=0" />. Writing <MathTeX tex="M_i = S''(x_i)" />, continuity of slope
          leads to a <strong>tridiagonal linear system</strong>:
        </p>
        <MathTeX block tex="h_{i-1}M_{i-1} + 2(h_{i-1}+h_i)M_i + h_i M_{i+1} = 6\!\left(\frac{y_{i+1}-y_i}{h_i} - \frac{y_i-y_{i-1}}{h_{i-1}}\right)," />
        <p>
          which is solved efficiently (Thomas algorithm) in <MathTeX tex="O(n)" />. The coefficients
          <MathTeX tex="\,a_i,b_i,c_i,d_i" /> then follow directly from the <MathTeX tex="M_i" />.
        </p>
        <Callout tone="tip" title="Boundary choices">
          Besides the natural spline, common end conditions are <em>clamped</em> (prescribed end slopes) and
          <em> not-a-knot</em> (third derivative continuous across the first/last interior knot).
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "C² smoothness; no Runge oscillation; local low-degree pieces; O(n) tridiagonal solve." },
          { label: "Limitations", value: "More setup than single polynomials; boundary conditions must be chosen; not the interpolant of a single formula." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Sort the data points by x and compute the interval widths hᵢ." },
        { label: "Assemble the tridiagonal system for the second derivatives Mᵢ." },
        { label: "Apply natural boundary conditions M₀ = Mₙ₋₁ = 0." },
        { label: "Solve the tridiagonal system (Thomas algorithm)." },
        { label: "Compute each segment's coefficients aᵢ, bᵢ, cᵢ, dᵢ from the Mᵢ." },
        { label: "To evaluate, locate the interval containing x and apply its cubic." },
      ],
      pseudocode: `INPUT x[], y[]
compute h[i] = x[i+1]-x[i]
build tridiagonal system for M[] (S'')
M[0] ← M[n-1] ← 0            /* natural */
solve tridiagonal → M[]
FOR each segment i:
    a ← y[i]
    c ← M[i]
    d ← (M[i+1]-M[i])/(3 h[i])
    b ← (y[i+1]-y[i])/h[i] - h[i](2M[i]+M[i+1])/3
EVALUATE: find interval, S(x)=a+b t+c t²+d t³, t=x-x[i]`,
      flowchart: ["Start", "Sort data, compute h", "Build tridiagonal system", "Natural BCs M₀=Mₙ=0", "Solve for M", "Coeffs a,b,c,d", "Evaluate S(x)", "Stop"],
    },
    simulator: <CubicSplineSim />,
    cFilename: "cubic_spline.c",
    cCode: `/* Natural Cubic Spline interpolation
 * Compile: gcc cubic_spline.c -o spline -lm
 */
#include <stdio.h>

int main(void) {
    int n, i, j;
    double x[50], y[50], h[50], al[50], l[50], mu[50], z[50], M[50], xp, t, val;

    printf("Enter number of points: ");
    scanf("%d", &n);
    printf("Enter x and y (increasing x):\\n");
    for (i = 0; i < n; i++) scanf("%lf %lf", &x[i], &y[i]);
    printf("Enter x to evaluate: ");
    scanf("%lf", &xp);

    for (i = 0; i < n-1; i++) h[i] = x[i+1]-x[i];
    for (i = 1; i < n-1; i++)
        al[i] = 3.0/h[i]*(y[i+1]-y[i]) - 3.0/h[i-1]*(y[i]-y[i-1]);

    l[0] = 1; mu[0] = z[0] = 0;
    for (i = 1; i < n-1; i++) {
        l[i]  = 2*(x[i+1]-x[i-1]) - h[i-1]*mu[i-1];
        mu[i] = h[i]/l[i];
        z[i]  = (al[i] - h[i-1]*z[i-1]) / l[i];
    }
    l[n-1] = 1; z[n-1] = M[n-1] = 0;
    for (j = n-2; j >= 0; j--) M[j] = z[j] - mu[j]*M[j+1];

    for (i = 0; i < n-1; i++)
        if (xp >= x[i] && xp <= x[i+1]) {
            double a = y[i];
            double b = (y[i+1]-y[i])/h[i] - h[i]*(2*M[i]+M[i+1])/3.0;
            double c = M[i];
            double d = (M[i+1]-M[i])/(3.0*h[i]);
            t = xp - x[i];
            val = a + b*t + c*t*t + d*t*t*t;
            printf("S(%.4lf) = %.6lf\\n", xp, val);
            break;
        }
    return 0;
}`,
    viva: [
      { q: "What is a cubic spline?", a: "A piecewise cubic interpolant whose pieces join with continuous value, first and second derivatives (C² smoothness)." },
      { q: "Why use piecewise cubics instead of one high-degree polynomial?", a: "To avoid the Runge phenomenon — large oscillations of high-degree polynomials between equally spaced nodes." },
      { q: "What continuity conditions are imposed at interior knots?", a: "Continuity of S, S′ and S″ across each interior knot, plus interpolation of the data." },
      { q: "What is a natural cubic spline?", a: "One with zero second derivative at both end points, S″(x₀)=S″(xₙ₋₁)=0." },
      { q: "What system must be solved for the spline?", a: "A tridiagonal linear system for the second derivatives Mᵢ at the knots." },
      { q: "How is the tridiagonal system solved efficiently?", a: "By the Thomas algorithm in O(n) operations." },
      { q: "Name alternative boundary conditions.", a: "Clamped (prescribed end slopes) and not-a-knot conditions." },
      { q: "How many cubic pieces are there for n points?", a: "n − 1 segments." },
      { q: "What degree of smoothness does a cubic spline have?", a: "C² — continuous up to the second derivative." },
      { q: "Where are cubic splines widely used?", a: "Computer graphics/CAD, data smoothing, path planning, and interpolating physical data." },
      { q: "How do you evaluate the spline at a point x?", a: "Locate the interval containing x, then evaluate that segment's cubic with t = x − xᵢ." },
    ],
    problems: [
      { level: "Easy", text: "Fit a natural cubic spline to (0,0),(1,1),(2,0) and evaluate at x = 0.5.", hint: "Solve for M₁ only." },
      { level: "Easy", text: "State the natural boundary conditions and explain their meaning.", hint: "Zero curvature at the ends." },
      { level: "Easy", text: "How many unknown coefficients does an n-point spline have, and how are they determined?", hint: "4(n−1) coeffs, matched by conditions." },
      { level: "Medium", text: "Set up (but need not solve) the tridiagonal system for five equally spaced points.", hint: "hᵢ constant simplifies it." },
      { level: "Medium", text: "Compare a cubic spline with a single degree-4 polynomial on 1/(1+25x²).", hint: "Spline avoids oscillation." },
      { level: "Medium", text: "Verify continuity of S′ at an interior knot for your fitted spline.", hint: "Match left/right derivative." },
      { level: "Advanced", text: "Implement a clamped spline with prescribed end slopes and compare with the natural spline.", hint: "Change first/last equations." },
      { level: "Advanced", text: "Use the spline to estimate an integral by integrating each cubic piece.", hint: "Analytic ∫ of a+bt+ct²+dt³." },
      { level: "Advanced", text: "Investigate the effect of unequal spacing on spline accuracy.", hint: "hᵢ enter the tridiagonal system." },
    ],
    references: (
      <ul>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §3.3 (cubic spline interpolation).</li>
        <li>R. L. Burden &amp; J. D. Faires, <em>Numerical Analysis</em> — natural &amp; clamped splines.</li>
        <li>C. de Boor, <em>A Practical Guide to Splines</em>, Springer.</li>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — spline interpolation.</li>
      </ul>
    ),
  };
}

import { useMemo, useState } from "react";
import { quadraticInterp } from "@/lib/lab/numerics";
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

function QuadraticInterpSim() {
  const [xStr, setXStr] = useState("1, 2, 3");
  const [yStr, setYStr] = useState("1, 8, 27");
  const [xpStr, setXp] = useState("2.5");
  const [run, setRun] = useState(0);

  const xs = parseList(xStr), ys = parseList(yStr);
  const xp = parseFloat(xpStr);
  const errors: Record<string, string> = {};
  if (xs.length !== 3) errors.x = "Enter exactly three x-values.";
  if (ys.length !== 3) errors.y = "Enter exactly three y-values.";
  if (xs.length === 3 && new Set(xs).size !== 3) errors.x = "x-values must be distinct.";
  if (!Number.isFinite(xp)) errors.xp = "Enter a number.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const { value, basis } = quadraticInterp(xs, ys, xp);
    const a = Math.min(...xs), b = Math.max(...xs);
    const pad = (b - a) * 0.1;
    const curve: { x: number; y: number }[] = [];
    for (let i = 0; i <= 120; i++) {
      const xx = a - pad + (i / 120) * (b - a + 2 * pad);
      curve.push({ x: +xx.toFixed(4), y: quadraticInterp(xs, ys, xx).value });
    }
    const pts = xs.map((x, i) => ({ x, y: ys[i] }));
    const rows = xs.map((x, i) => ({ i: i + 1, xi: x, yi: ys[i], Li: basis[i], term: basis[i] * ys[i] }));
    return { value, curve, pts, rows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setXStr("1, 2, 3"); setYStr("1, 8, 27"); setXp("2.5"); setRun((r) => r + 1); }}
      runLabel="Interpolate"
      controls={
        <>
          <TextField label="Three x-values" value={xStr} onChange={setXStr} error={errors.x} hint="Distinct; e.g. 1, 2, 3." />
          <TextField label="Three y-values" value={yStr} onChange={setYStr} error={errors.y} />
          <NumberField label="Interpolate at x =" value={xpStr} onChange={setXp} step="any" error={errors.xp} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Provide exactly three distinct points and a target x.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatTile label={`f(${xp})`} value={result.value.toFixed(6)} />
              <StatTile label="Polynomial degree" value="2" accent="text-emerald-600" />
              <StatTile label="Data points" value="3" accent="text-violet-600" />
            </div>

            <OutputBlock title="Visualization — parabola through the three points">
              <LineFigure
                height={300}
                xKey="x"
                xLabel="x"
                yLabel="f(x)"
                series={[{ name: "Quadratic (parabola)", color: "#c026d3", dataKey: "y", data: result.curve }]}
              />
              <div className="mt-3">
                <ScatterFigure
                  height={200}
                  xLabel="x"
                  yLabel="y"
                  groups={[
                    { name: "Data points", data: result.pts, color: "#c026d3" },
                    { name: `Interpolated (${xp}, ${result.value.toFixed(3)})`, data: [{ x: xp, y: result.value }], color: "#16a34a" },
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                A single parabola passes exactly through all three points; the green marker is the interpolated value.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — Lagrange weights (3-point)">
              <ResultsTable
                rows={result.rows}
                columns={[
                  { key: "i", header: "i" },
                  { key: "xi", header: "xᵢ" },
                  { key: "yi", header: "yᵢ" },
                  { key: "Li", header: "Lᵢ(x)", render: (r) => r.Li.toFixed(6) },
                  { key: "term", header: "Lᵢ(x)·yᵢ", render: (r) => r.term.toFixed(6) },
                ]}
                caption="f(x) = Σ Lᵢ(x)·yᵢ; the three basis weights always sum to 1."
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
          <strong>Quadratic interpolation</strong> fits a <em>parabola</em> — the unique second-degree polynomial —
          through three data points. By capturing curvature that a straight line misses, it gives markedly better
          accuracy for smoothly varying data while remaining cheap to compute.
        </p>
        <p>
          It is the natural next step after linear interpolation and the basis of Simpson's integration rule and of
          quadratic peak-finding.
        </p>
        <Callout tone="info" title="Three points, one parabola">
          Just as two points fix a line, three non-collinear points fix exactly one parabola
          <MathTeX tex="\,y = a_0 + a_1 x + a_2 x^2" />.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Quadratic interpolation is used wherever curvature matters:</p>
        <ul>
          <li><strong>Peak finding:</strong> locating a spectral line or maximum by fitting a parabola to three samples.</li>
          <li><strong>Simpson's rule:</strong> integration by interpolating the integrand with parabolas.</li>
          <li><strong>Smooth table look-up:</strong> more accurate than linear for curved data.</li>
          <li><strong>Optimization:</strong> successive parabolic interpolation to find a minimum.</li>
          <li><strong>Trajectory estimation:</strong> modelling projectile arcs from three positions.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          For three points <MathTeX tex="(x_0,y_0),(x_1,y_1),(x_2,y_2)" /> the interpolating parabola is written most
          cleanly in <strong>Lagrange form</strong>:
        </p>
        <MathTeX block tex="P_2(x) = \sum_{i=0}^{2} L_i(x)\,y_i, \qquad L_i(x) = \prod_{\substack{j=0\\ j\neq i}}^{2} \frac{x - x_j}{x_i - x_j}." />
        <p>Written out, the three basis polynomials are</p>
        <MathTeX block tex="L_0 = \frac{(x-x_1)(x-x_2)}{(x_0-x_1)(x_0-x_2)}, \; L_1 = \frac{(x-x_0)(x-x_2)}{(x_1-x_0)(x_1-x_2)}, \; L_2 = \frac{(x-x_0)(x-x_1)}{(x_2-x_0)(x_2-x_1)}." />
        <p>
          Each <MathTeX tex="L_i" /> equals 1 at its own node and 0 at the other two, so
          <MathTeX tex="\,P_2(x_i)=y_i" /> exactly.
        </p>
        <h3>Error term</h3>
        <MathTeX block tex="E(x) = \frac{(x-x_0)(x-x_1)(x-x_2)}{3!}\,f'''(\xi)," />
        <p>
          so the error is <em>third order</em> in the spacing and vanishes whenever the data comes from a cubic-or-lower
          polynomial's second derivative behaviour — a big improvement over linear interpolation.
        </p>
        <Callout tone="tip" title="Equal spacing shortcut">
          For equally spaced nodes, Newton's forward/backward difference formula truncated at the second difference is
          algebraically identical to this parabola.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Captures curvature; third-order accurate; only three points; basis of Simpson's rule and peak finding." },
          { label: "Limitations", value: "Needs exactly 3 points; can overshoot for non-smooth data; higher degree risks oscillation." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the three data points (x₀,y₀), (x₁,y₁), (x₂,y₂)." },
        { label: "Read the target x." },
        { label: "Form the three Lagrange basis polynomials L₀, L₁, L₂ at x." },
        { label: "Multiply each Lᵢ by its yᵢ." },
        { label: "Sum the three products to get P₂(x)." },
        { label: "Output the interpolated value." },
      ],
      pseudocode: `INPUT x0,y0, x1,y1, x2,y2, x
L0 ← (x-x1)(x-x2)/((x0-x1)(x0-x2))
L1 ← (x-x0)(x-x2)/((x1-x0)(x1-x2))
L2 ← (x-x0)(x-x1)/((x2-x0)(x2-x1))
P  ← L0*y0 + L1*y1 + L2*y2
OUTPUT P`,
      flowchart: ["Start", "Read 3 points, x", "Build L_0, L_1, L_2", "P = ΣL_i y_i", "Output P", "Stop"],
    },
    simulator: <QuadraticInterpSim />,
    cFilename: "quadratic_interp.c",
    cCode: `/* Quadratic (3-point) Lagrange Interpolation
 * Compile: gcc quadratic_interp.c -o quadint
 */
#include <stdio.h>

int main(void) {
    double x[3], y[3], xp, L, P = 0.0;
    int i, j;

    printf("Enter three x and y values:\\n");
    for (i = 0; i < 3; i++) scanf("%lf %lf", &x[i], &y[i]);
    printf("Enter x to interpolate: ");
    scanf("%lf", &xp);

    for (i = 0; i < 3; i++) {
        L = 1.0;
        for (j = 0; j < 3; j++)
            if (j != i) L *= (xp - x[j]) / (x[i] - x[j]);
        P += L * y[i];
    }

    printf("Interpolated value f(%.4lf) = %.6lf\\n", xp, P);
    return 0;
}`,
    viva: [
      { q: "How many points define a quadratic interpolant?", a: "Exactly three non-collinear points define one parabola." },
      { q: "Write the 3-point Lagrange formula.", a: "P₂(x) = L₀y₀ + L₁y₁ + L₂y₂ with Lᵢ = Π_{j≠i}(x−xⱼ)/(xᵢ−xⱼ)." },
      { q: "What is the degree of the interpolating polynomial?", a: "Degree 2 (a parabola)." },
      { q: "State the error term for quadratic interpolation.", a: "E(x) = (x−x₀)(x−x₁)(x−x₂) f'''(ξ)/3!." },
      { q: "What order of accuracy does it have?", a: "Third order in the node spacing — better than first-order linear interpolation." },
      { q: "What property do the basis polynomials satisfy at the nodes?", a: "Lᵢ(xᵢ)=1 and Lᵢ(xⱼ)=0 for j≠i, so the parabola reproduces the data exactly." },
      { q: "How is quadratic interpolation related to Simpson's rule?", a: "Simpson's 1/3 rule integrates the quadratic that interpolates the integrand over two subintervals." },
      { q: "When would you prefer quadratic over linear interpolation?", a: "When the data is curved; the parabola captures the second-derivative behaviour." },
      { q: "For equally spaced points, what equivalent formula exists?", a: "Newton's forward-difference formula truncated at the second difference." },
      { q: "What is a risk of using higher-degree interpolation?", a: "Oscillation between nodes (Runge phenomenon), especially with many equally spaced points." },
      { q: "Give an application of quadratic peak finding.", a: "Locating a spectral peak sub-sample by fitting a parabola to the peak and its two neighbours." },
    ],
    problems: [
      { level: "Easy", text: "Use (1,1),(2,8),(3,27) to interpolate f(2.5) and compare with x³.", hint: "Parabola gives 15.75, true 15.625." },
      { level: "Easy", text: "Interpolate f(1.5) from (1,1),(2,4),(3,9) and compare with x².", hint: "Exact, since data is quadratic ⇒ 2.25." },
      { level: "Easy", text: "Show the three basis weights sum to 1 at x = 2.5.", hint: "Partition of unity." },
      { level: "Medium", text: "Fit a parabola to three points of sin x near π/2 and estimate the maximum location.", hint: "Vertex of the parabola." },
      { level: "Medium", text: "Compare quadratic and linear interpolation error for eˣ at a chosen midpoint.", hint: "Quadratic error ∝ f'''." },
      { level: "Medium", text: "Derive Simpson's 1/3 rule by integrating the interpolating parabola.", hint: "∫ over [x₀,x₂]." },
      { level: "Advanced", text: "Implement successive parabolic interpolation to minimise a unimodal function.", hint: "Fit parabola, jump to vertex, repeat." },
      { level: "Advanced", text: "Show quadratic interpolation is exact for any polynomial of degree ≤ 2.", hint: "Uniqueness of the interpolant." },
      { level: "Advanced", text: "Investigate overshoot when the three points are nearly collinear with one outlier.", hint: "Large curvature term." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Newton &amp; Lagrange interpolation.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §3.1–3.2, §10.2 (parabolic interpolation).</li>
        <li>B. S. Grewal, <em>Numerical Methods in Engineering &amp; Science</em>.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

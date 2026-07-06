import { useMemo, useState } from "react";
import { lagrange } from "@/lib/lab/numerics";
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

function LagrangeSim() {
  const [xStr, setXStr] = useState("0, 1, 3, 4");
  const [yStr, setYStr] = useState("1, 3, 49, 129");
  const [xpStr, setXpStr] = useState("2");
  const [run, setRun] = useState(0);

  const xs = parseList(xStr), ys = parseList(yStr);
  const xp = parseFloat(xpStr);

  const errors: Record<string, string> = {};
  if (xs.length < 2) errors.x = "Enter at least two x-values.";
  if (ys.length !== xs.length) errors.y = "x and y must have the same count.";
  if (new Set(xs).size !== xs.length) errors.x = "x-values must be distinct.";
  if (!Number.isFinite(xp)) errors.xp = "Enter a number.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const { value, basis } = lagrange(xs, ys, xp);
    const a = Math.min(...xs), b = Math.max(...xs);
    const curve: { x: number; poly: number }[] = [];
    for (let i = 0; i <= 120; i++) {
      const xx = a + (i / 120) * (b - a);
      curve.push({ x: +xx.toFixed(4), poly: lagrange(xs, ys, xx).value });
    }
    const pts = xs.map((x, i) => ({ x, y: ys[i] }));
    const rows = xs.map((x, i) => ({ i: i + 1, xi: x, yi: ys[i], Li: basis[i], term: basis[i] * ys[i] }));
    const basisSum = basis.reduce((s, v) => s + v, 0);
    return { value, basis, curve, pts, rows, basisSum };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setXStr("0, 1, 3, 4"); setYStr("1, 3, 49, 129"); setXpStr("2"); setRun((r) => r + 1); }}
      runLabel="Interpolate"
      controls={
        <>
          <TextField label="x-values (any spacing, distinct)" value={xStr} onChange={setXStr} error={errors.x} hint="Comma or space separated." />
          <TextField label="y-values" value={yStr} onChange={setYStr} error={errors.y} />
          <NumberField label="Interpolate at x =" value={xpStr} onChange={setXpStr} step="any" error={errors.xp} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Provide distinct x-values and matching y-values.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label={`f(${xp})`} value={result.value.toFixed(6)} />
              <StatTile label="Data points" value={String(xs.length)} accent="text-emerald-600" />
              <StatTile label="Polynomial degree" value={String(xs.length - 1)} accent="text-amber-600" />
              <StatTile label="Σ Lᵢ(x)" value={result.basisSum.toFixed(4)} accent="text-violet-600" />
            </div>

            <OutputBlock title="Visualization — data points and Lagrange polynomial">
              <LineFigure
                height={300}
                xKey="x"
                xLabel="x"
                yLabel="f(x)"
                series={[{ name: "Lagrange polynomial", color: "#e11d48", dataKey: "poly", data: result.curve }]}
              />
              <div className="mt-3">
                <ScatterFigure
                  height={220}
                  xLabel="x"
                  yLabel="y"
                  groups={[
                    { name: "Data points", data: result.pts, color: "#e11d48" },
                    { name: `Interpolated (${xp}, ${result.value.toFixed(3)})`, data: [{ x: xp, y: result.value }], color: "#16a34a" },
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The degree-(n−1) polynomial passes through every data point regardless of spacing; the green
                marker is the interpolated value.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — Lagrange basis weights">
              <ResultsTable
                rows={result.rows}
                columns={[
                  { key: "i", header: "i" },
                  { key: "xi", header: "xᵢ" },
                  { key: "yi", header: "yᵢ" },
                  { key: "Li", header: "Lᵢ(x)", render: (r) => r.Li.toFixed(6) },
                  { key: "term", header: "Lᵢ(x)·yᵢ", render: (r) => r.term.toFixed(6) },
                ]}
                caption="The interpolated value is the sum of the last column: f(x) = Σ Lᵢ(x)·yᵢ. The weights Lᵢ(x) always sum to 1."
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
          <strong>Lagrange interpolation</strong> constructs the unique polynomial through a set of data points
          <em> without requiring equal spacing</em>. It writes the answer directly as a weighted sum of the
          measured <MathTeX tex="y" />-values, using specially built <strong>basis polynomials</strong> — no
          difference table or linear system needed.
        </p>
        <p>
          This flexibility makes it the go-to method when data is irregularly sampled, which is common with real
          experimental measurements. It is also the cleanest way to express the idea that <MathTeX tex="n" />
          {" "}points define one polynomial of degree <MathTeX tex="n-1" />.
        </p>
        <Callout tone="info" title="A weighted vote of the data">
          Each data value gets a weight <MathTeX tex="L_i(x)" /> that equals 1 at its own node and 0 at every
          other node — so the polynomial reproduces the data exactly.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Lagrange interpolation appears wherever irregular data must be evaluated or processed:</p>
        <ul>
          <li><strong>Irregularly sampled measurements:</strong> interpolating experimental data taken at uneven points.</li>
          <li><strong>Numerical integration:</strong> derivation of quadrature rules (including Gaussian quadrature).</li>
          <li><strong>Finite-element shape functions:</strong> Lagrange polynomials define element interpolation.</li>
          <li><strong>Signal reconstruction:</strong> rebuilding a smooth curve from scattered samples.</li>
          <li><strong>Calibration &amp; correction:</strong> mapping between non-uniform reference points.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Given <MathTeX tex="n" /> points <MathTeX tex="(x_i, y_i)" />, define the Lagrange basis polynomial
          for node <MathTeX tex="i" />:
        </p>
        <MathTeX block tex="L_i(x) = \prod_{\substack{j=0 \\ j\neq i}}^{n-1} \frac{x - x_j}{x_i - x_j}." />
        <p>
          By construction <MathTeX tex="L_i(x_i)=1" /> and <MathTeX tex="L_i(x_j)=0" /> for
          <MathTeX tex="\,j\neq i" />. The interpolating polynomial is then the weighted sum:
        </p>
        <MathTeX block tex="\boxed{\,P(x) = \sum_{i=0}^{n-1} L_i(x)\,y_i\,}." />
        <p>
          Evaluating at any node returns that node's <MathTeX tex="y" />-value exactly, so the curve passes
          through all data points. A useful check: the weights always satisfy
          <MathTeX tex="\,\sum_i L_i(x) = 1" /> for every <MathTeX tex="x" />.
        </p>
        <h3>Error term</h3>
        <MathTeX block tex="f(x) - P(x) = \frac{f^{(n)}(\xi)}{n!}\prod_{i=0}^{n-1}(x - x_i)," />
        <p>so the error grows with the spacing of the nodes and the size of the high-order derivative.</p>
        <Callout tone="warn" title="Recomputation cost">
          Lagrange interpolation is elegant but <em>not incremental</em>: adding a new data point forces every
          basis polynomial to be rebuilt. Newton's divided-difference form avoids this while giving the same
          polynomial.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Works for any (distinct) node spacing; no linear system to solve; conceptually clear; foundation of quadrature and FEM shape functions." },
          { label: "Limitations", value: "Adding a point requires full recomputation; O(n²) per evaluation; high degree oscillates (Runge); numerically less stable than barycentric form." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the data points (x₀,y₀), …, (xₙ₋₁,yₙ₋₁) — spacing may be arbitrary but xᵢ must be distinct." },
        { label: "Choose the target point x." },
        { label: "For each i, form the basis Lᵢ(x) = Π_{j≠i} (x − xⱼ)/(xᵢ − xⱼ)." },
        { label: "Multiply each Lᵢ(x) by its data value yᵢ." },
        { label: "Sum the products: P(x) = Σ Lᵢ(x)·yᵢ." },
        { label: "Report the interpolated value (optionally verify Σ Lᵢ = 1)." },
      ],
      pseudocode: `INPUT x[0..n-1], y[0..n-1], xp
value ← 0
FOR i = 0 TO n-1 DO
    L ← 1
    FOR j = 0 TO n-1, j ≠ i DO
        L ← L * (xp - x[j]) / (x[i] - x[j])
    value ← value + L * y[i]
OUTPUT value`,
      flowchart: ["Start", "Read points, x_p", "For each i: build L_i(x_p)", "Accumulate L_i·y_i", "P(x_p) = Σ", "Output P(xp)", "Stop"],
    },
    simulator: <LagrangeSim />,
    cFilename: "lagrange.c",
    cCode: `/* Lagrange Interpolation (arbitrary spacing)
 * Compile: gcc lagrange.c -o lag -lm
 */
#include <stdio.h>

int main(void) {
    int n, i, j;
    double x[50], y[50], xp, value = 0.0, L;

    printf("Enter number of points: ");
    scanf("%d", &n);
    printf("Enter x and y values:\\n");
    for (i = 0; i < n; i++) scanf("%lf %lf", &x[i], &y[i]);
    printf("Enter x to interpolate: ");
    scanf("%lf", &xp);

    for (i = 0; i < n; i++) {
        L = 1.0;
        for (j = 0; j < n; j++)
            if (j != i) L *= (xp - x[j]) / (x[i] - x[j]);
        value += L * y[i];
    }

    printf("Interpolated value f(%.4lf) = %.6lf\\n", xp, value);
    return 0;
}`,
    viva: [
      { q: "What is the main advantage of Lagrange interpolation?", a: "It works for arbitrarily spaced (distinct) data points and needs no difference table or linear system." },
      { q: "Write the Lagrange basis polynomial Lᵢ(x).", a: "Lᵢ(x) = Π_{j≠i} (x − xⱼ)/(xᵢ − xⱼ)." },
      { q: "What property does Lᵢ have at the nodes?", a: "Lᵢ(xᵢ) = 1 and Lᵢ(xⱼ) = 0 for j ≠ i (the cardinal property)." },
      { q: "Write the full Lagrange interpolation formula.", a: "P(x) = Σᵢ Lᵢ(x)·yᵢ." },
      { q: "What is the degree of the Lagrange polynomial for n points?", a: "n − 1." },
      { q: "What identity do the basis weights satisfy?", a: "Σᵢ Lᵢ(x) = 1 for all x (they form a partition of unity)." },
      { q: "State the Lagrange error/remainder term.", a: "f(x) − P(x) = f⁽ⁿ⁾(ξ)/n! · Π(x − xᵢ) for some ξ in the interval." },
      { q: "Why is Lagrange interpolation not incremental?", a: "Adding a data point changes every basis polynomial, forcing a full recomputation." },
      { q: "How does Newton's divided-difference form improve on this?", a: "It gives the same polynomial but lets you add points by appending one term, without redoing earlier work." },
      { q: "When is Lagrange preferred over Newton's forward formula?", a: "When the data is not equally spaced (Newton forward requires constant h)." },
      { q: "What is the Runge phenomenon?", a: "Severe oscillation of high-degree interpolants near interval ends, worst with equally spaced nodes." },
      { q: "How can the Runge phenomenon be reduced?", a: "Use lower-degree piecewise interpolation (splines) or Chebyshev node spacing." },
      { q: "What is the barycentric form of Lagrange interpolation?", a: "A rearrangement using precomputed weights that is faster (O(n) per evaluation) and numerically more stable." },
      { q: "How is Lagrange interpolation used in numerical integration?", a: "Integrating the Lagrange polynomial yields quadrature rules, including Newton–Cotes and Gaussian quadrature." },
      { q: "Give a physics application of Lagrange interpolation.", a: "Interpolating irregularly sampled experimental data, or defining shape functions in finite-element analysis." },
    ],
    problems: [
      { level: "Easy", text: "Use (0,1),(1,3),(3,49),(4,129) to interpolate f(2) by Lagrange.", hint: "Build L₀…L₃ at x=2 and sum Lᵢyᵢ." },
      { level: "Easy", text: "Interpolate f(2.5) from (1,1),(2,4),(4,16) and compare with x².", hint: "Should be close to 6.25." },
      { level: "Easy", text: "Verify that Σ Lᵢ(x) = 1 for any three distinct nodes at a chosen x.", hint: "Partition of unity." },
      { level: "Medium", text: "Show that Lagrange and Newton's divided-difference give the identical polynomial.", hint: "Same unique interpolant." },
      { level: "Medium", text: "Interpolate ln at x=2 using nodes 1, 1.5, 3, 4 and estimate the error.", hint: "Use the remainder term with f⁽⁴⁾." },
      { level: "Medium", text: "Demonstrate the cardinal property by evaluating each Lᵢ at every node.", hint: "You should get the identity pattern (1 on diagonal)." },
      { level: "Medium", text: "Compare interpolation accuracy for 3 vs 5 nodes on a smooth function.", hint: "More nodes ⇒ smaller error (for smooth f)." },
      { level: "Advanced", text: "Implement the barycentric form and compare its speed/stability with the naïve form.", hint: "Precompute weights wᵢ." },
      { level: "Advanced", text: "Illustrate the Runge phenomenon with 1/(1+25x²) on 11 equally spaced nodes.", hint: "Watch the edges oscillate." },
      { level: "Advanced", text: "Derive the two-point and three-point Newton–Cotes rules by integrating the Lagrange polynomial.", hint: "Gives trapezoidal and Simpson's rules." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 18 (Lagrange interpolation).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §3.1–3.2 (polynomial interpolation, barycentric form).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>J.-P. Berrut &amp; L. N. Trefethen, "Barycentric Lagrange Interpolation," <em>SIAM Review</em> 46 (2004).</li>
        <li>B. S. Grewal, <em>Numerical Methods in Engineering &amp; Science</em>.</li>
      </ul>
    ),
  };
}

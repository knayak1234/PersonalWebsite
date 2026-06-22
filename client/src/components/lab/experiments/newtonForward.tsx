import { useMemo, useState } from "react";
import { newtonForward } from "@/lib/lab/numerics";
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

function NewtonForwardSim() {
  const [xStr, setXStr] = useState("1, 2, 3, 4, 5");
  const [yStr, setYStr] = useState("1, 8, 27, 64, 125");
  const [xpStr, setXpStr] = useState("2.5");
  const [run, setRun] = useState(0);

  const xs = parseList(xStr), ys = parseList(yStr);
  const xp = parseFloat(xpStr);

  const errors: Record<string, string> = {};
  if (xs.length < 2) errors.x = "Enter at least two x-values.";
  if (ys.length !== xs.length) errors.y = "x and y must have the same count.";
  let h = 0;
  if (xs.length >= 2) {
    h = xs[1] - xs[0];
    const equal = xs.every((v, i) => i === 0 || Math.abs((v - xs[i - 1]) - h) < 1e-9);
    if (!equal || Math.abs(h) < 1e-12) errors.x = "x-values must be equally spaced (constant h).";
  }
  if (!Number.isFinite(xp)) errors.xp = "Enter a number.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const { value, table, p } = newtonForward(xs, ys, xp);
    // sample interpolating polynomial across the range for the curve
    const a = xs[0], b = xs[xs.length - 1];
    const curve: { x: number; poly: number }[] = [];
    for (let i = 0; i <= 120; i++) {
      const xx = a + (i / 120) * (b - a);
      curve.push({ x: +xx.toFixed(4), poly: newtonForward(xs, ys, xx).value });
    }
    const pts = xs.map((x, i) => ({ x, y: ys[i] }));
    return { value, table, p, curve, pts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setXStr("1, 2, 3, 4, 5"); setYStr("1, 8, 27, 64, 125"); setXpStr("2.5"); setRun((r) => r + 1); }}
      runLabel="Interpolate"
      controls={
        <>
          <TextField label="x-values (equally spaced)" value={xStr} onChange={setXStr} error={errors.x} hint="Comma or space separated." />
          <TextField label="y-values" value={yStr} onChange={setYStr} error={errors.y} />
          <NumberField label="Interpolate at x =" value={xpStr} onChange={setXpStr} step="any" error={errors.xp}
            hint="Best near the start of the table (forward formula)." />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Provide equally spaced x-values and matching y-values.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label={`f(${xp})`} value={result.value.toFixed(6)} />
              <StatTile label="Step h" value={h.toFixed(4)} accent="text-amber-600" />
              <StatTile label="p = (x−x₀)/h" value={result.p.toFixed(4)} accent="text-violet-600" />
              <StatTile label="Data points" value={String(xs.length)} accent="text-emerald-600" />
            </div>

            <OutputBlock title="Visualization — data points and interpolating polynomial">
              <div className="relative">
                <LineFigure
                  height={300}
                  xKey="x"
                  xLabel="x"
                  yLabel="f(x)"
                  series={[{ name: "Newton polynomial", color: "#db2777", dataKey: "poly", data: result.curve }]}
                />
              </div>
              <div className="mt-3">
                <ScatterFigure
                  height={220}
                  xLabel="x"
                  yLabel="y"
                  groups={[
                    { name: "Data points", data: result.pts, color: "#db2777" },
                    { name: `Interpolated (${xp}, ${result.value.toFixed(3)})`, data: [{ x: xp, y: result.value }], color: "#16a34a" },
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The single polynomial of degree n−1 passes through all n data points; the green marker is the
                interpolated value at the requested x.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — forward difference table">
              <div className="overflow-x-auto">
                <table className="text-sm font-mono mx-auto">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="px-3 py-1.5 text-right">x</th>
                      <th className="px-3 py-1.5 text-right">y</th>
                      {result.table.slice(1).map((_, k) => (
                        <th key={k} className="px-3 py-1.5 text-right">Δ{k + 1 > 1 ? <sup>{k + 1}</sup> : ""}y</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {xs.map((xv, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-right">{xv}</td>
                        {result.table.map((col, level) =>
                          i < col.length ? (
                            <td key={level} className={`px-3 py-1.5 text-right ${level === 0 ? "" : "text-muted-foreground"} ${i === 0 && level > 0 ? "text-primary font-semibold" : ""}`}>
                              {col[i].toFixed(4)}
                            </td>
                          ) : (
                            <td key={level} />
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                The highlighted top diagonal (Δy, Δ²y, …) supplies the coefficients of Newton's forward formula.
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
          <strong>Newton's forward-difference interpolation</strong> builds a single polynomial that passes
          through a set of <strong>equally spaced</strong> data points, then uses it to estimate the function at
          intermediate values. It is the natural tool for interpolating near the <em>beginning</em> of a table.
        </p>
        <p>
          Experimental physics produces tabulated data — calibration curves, measured spectra, lookup tables.
          Interpolation lets us read values <em>between</em> the tabulated points without re-measuring, and is
          the basis of many integration and differentiation formulas.
        </p>
        <Callout tone="info" title="One polynomial through every point">
          For <MathTeX tex="n" /> points there is a unique polynomial of degree <MathTeX tex="n-1" /> through
          them; Newton's forward formula constructs it efficiently from a difference table.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Interpolation on tabulated data is used throughout physics:</p>
        <ul>
          <li><strong>Calibration curves:</strong> reading instrument values between calibration points.</li>
          <li><strong>Lookup tables:</strong> thermodynamic, atomic, and material-property tables.</li>
          <li><strong>Spectra &amp; histograms:</strong> estimating values between measured bins.</li>
          <li><strong>Numerical integration/differentiation:</strong> Newton–Cotes rules derive from interpolating polynomials.</li>
          <li><strong>Resampling:</strong> putting non-matching datasets onto a common grid.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          With equally spaced nodes <MathTeX tex="x_i = x_0 + ih" /> define the forward difference
          <MathTeX tex="\,\Delta y_i = y_{i+1} - y_i" />, and higher differences
          <MathTeX tex="\,\Delta^k y_i = \Delta^{k-1}y_{i+1} - \Delta^{k-1}y_i" />. Introducing
          <MathTeX tex="\,p = (x - x_0)/h" />, Newton's forward formula is:
        </p>
        <MathTeX block tex="y(x) = y_0 + p\,\Delta y_0 + \frac{p(p-1)}{2!}\Delta^2 y_0 + \frac{p(p-1)(p-2)}{3!}\Delta^3 y_0 + \cdots" />
        <p>
          The coefficients are the leading forward differences <MathTeX tex="\Delta^k y_0" /> — the top diagonal
          of the difference table built in the lab.
        </p>
        <h3>When to use it</h3>
        <p>
          Because the powers of <MathTeX tex="p" /> grow as we move away from <MathTeX tex="x_0" />, the formula
          is most accurate for <MathTeX tex="x" /> <strong>near the start</strong> of the table
          (<MathTeX tex="0 \le p \lesssim 1" />). For points near the end, Newton's <em>backward</em> formula is
          preferred.
        </p>
        <Callout tone="warn" title="Equally spaced data required">
          Newton's forward formula needs a <strong>constant step</strong> <MathTeX tex="h" />. For arbitrarily
          spaced data, use <strong>Lagrange</strong> or Newton's divided-difference interpolation instead.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Efficient for equally spaced data; reuses the difference table; adding a point only adds one column; basis of Newton–Cotes integration." },
          { label: "Limitations", value: "Requires equal spacing; high-degree polynomials oscillate (Runge phenomenon); best only near the start of the table." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Tabulate the equally spaced data (x₀,y₀), …, (xₙ,yₙ) with step h." },
        { label: "Build the forward-difference table: Δy, Δ²y, Δ³y, …" },
        { label: "Compute p = (x − x₀) / h for the target x." },
        { label: "Take the leading differences Δᵏy₀ from the top diagonal." },
        { label: "Sum the series y₀ + pΔy₀ + p(p−1)/2! Δ²y₀ + …" },
        { label: "Report the interpolated value y(x)." },
      ],
      pseudocode: `INPUT x[0..n], y[0..n], xp
h ← x[1] - x[0]
/* forward difference table */
FOR k = 1 TO n DO
    FOR i = 0 TO n-k DO  d[k][i] ← d[k-1][i+1] - d[k-1][i]
p ← (xp - x[0]) / h
value ← y[0];  term ← 1
FOR k = 1 TO n DO
    term ← term * (p - (k-1)) / k
    value ← value + term * d[k][0]
OUTPUT value`,
      flowchart: ["Start", "Read table, xp", "Build Δ-table", "p = (xp − x0)/h", "Sum Newton forward series", "Output y(xp)", "Stop"],
    },
    simulator: <NewtonForwardSim />,
    cFilename: "newton_forward.c",
    cCode: `/* Newton's Forward Interpolation (equally spaced data)
 * Compile: gcc newton_forward.c -o nf -lm
 */
#include <stdio.h>

int main(void) {
    int n, i, k;
    double x[50], y[50][50], xp, h, p, term, value;

    printf("Enter number of points: ");
    scanf("%d", &n);
    printf("Enter x and y values:\\n");
    for (i = 0; i < n; i++) scanf("%lf %lf", &x[i], &y[i][0]);

    /* forward difference table */
    for (k = 1; k < n; k++)
        for (i = 0; i < n - k; i++)
            y[i][k] = y[i + 1][k - 1] - y[i][k - 1];

    printf("Enter x to interpolate: ");
    scanf("%lf", &xp);

    h = x[1] - x[0];
    p = (xp - x[0]) / h;
    value = y[0][0];
    term = 1.0;
    for (k = 1; k < n; k++) {
        term *= (p - (k - 1)) / k;
        value += term * y[0][k];
    }

    printf("Interpolated value f(%.4lf) = %.6lf\\n", xp, value);
    return 0;
}`,
    viva: [
      { q: "When is Newton's forward interpolation used?", a: "For equally spaced data, especially to interpolate near the beginning of the table." },
      { q: "Define the forward difference operator.", a: "Δyᵢ = yᵢ₊₁ − yᵢ; higher orders Δᵏyᵢ = Δᵏ⁻¹yᵢ₊₁ − Δᵏ⁻¹yᵢ." },
      { q: "Write Newton's forward interpolation formula.", a: "y = y₀ + pΔy₀ + p(p−1)/2! Δ²y₀ + p(p−1)(p−2)/3! Δ³y₀ + …, with p = (x−x₀)/h." },
      { q: "What is p in the formula?", a: "p = (x − x₀)/h, the number of steps of size h from the first node to the target x." },
      { q: "What is the degree of the interpolating polynomial for n points?", a: "n − 1 — a unique polynomial of that degree passes through all n points." },
      { q: "Why must the data be equally spaced?", a: "The forward-difference formula and the factor p = (x−x₀)/h assume a constant step h." },
      { q: "When should the backward formula be used instead?", a: "When interpolating near the end of the table (p close to n)." },
      { q: "What if the data is not equally spaced?", a: "Use Lagrange or Newton's divided-difference interpolation, which allow arbitrary spacing." },
      { q: "Where do the coefficients come from?", a: "From the leading (top-diagonal) forward differences Δᵏy₀ of the difference table." },
      { q: "What is the Runge phenomenon?", a: "Large oscillations of high-degree interpolating polynomials near the ends of an interval, especially with equally spaced nodes." },
      { q: "How is the difference table extended when a new point is added?", a: "Append one row and compute one new entry in each difference column — earlier work is reused." },
      { q: "How does interpolation relate to numerical integration?", a: "Integrating the interpolating polynomial gives the Newton–Cotes formulas (trapezoidal, Simpson, etc.)." },
      { q: "Distinguish interpolation from extrapolation.", a: "Interpolation estimates within the data range; extrapolation goes beyond it and is far less reliable." },
      { q: "What does Δⁿy being (nearly) constant indicate?", a: "That the data is well represented by a degree-n polynomial (constant nth differences ⇔ degree-n behaviour)." },
      { q: "Give a physics use of interpolation.", a: "Reading a value off a calibration curve or thermodynamic table between tabulated entries." },
    ],
    problems: [
      { level: "Easy", text: "Given (1,1),(2,8),(3,27),(4,64),(5,125) interpolate f(2.5).", hint: "Data is x³; check against 2.5³ = 15.625." },
      { level: "Easy", text: "Build the forward-difference table for y = 1,8,27,64 and note that Δ³y is constant.", hint: "Constant 3rd difference ⇒ cubic." },
      { level: "Easy", text: "Interpolate sin at x=0.15 from a table at 0,0.1,0.2,0.3,0.4.", hint: "p = (0.15−0)/0.1 = 1.5." },
      { level: "Medium", text: "Show numerically that the forward formula is most accurate near x₀.", hint: "Compare error at small vs large p." },
      { level: "Medium", text: "From population data at 1961,1971,1981,1991 estimate the population in 1976.", hint: "h = 10 years." },
      { level: "Medium", text: "Use the first three terms only and quantify the truncation error vs the full series.", hint: "Compare 2nd-degree vs full polynomial." },
      { level: "Medium", text: "Demonstrate that constant 4th differences imply a quartic fits the data exactly.", hint: "Δ⁴y constant, Δ⁵y = 0." },
      { level: "Advanced", text: "Use Newton's forward formula to derive the trapezoidal and Simpson integration rules.", hint: "Integrate the truncated polynomial over one/two intervals." },
      { level: "Advanced", text: "Illustrate the Runge phenomenon by interpolating 1/(1+25x²) on equally spaced nodes.", hint: "Oscillations grow near the ends." },
      { level: "Advanced", text: "Differentiate Newton's forward formula to get a derivative formula at x₀.", hint: "f'(x₀) ≈ (1/h)(Δy₀ − ½Δ²y₀ + …)." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 18 (interpolation).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §3.1 (polynomial interpolation).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI — Finite differences.</li>
        <li>B. S. Grewal, <em>Numerical Methods in Engineering &amp; Science</em>.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
      </ul>
    ),
  };
}

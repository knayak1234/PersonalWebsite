import { useMemo, useState } from "react";
import { linearInterp } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { NumberField } from "@/components/lab/ParamControl";
import { LineFigure, ScatterFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function LinearSim() {
  const [x0s, setX0] = useState("10");
  const [y0s, setY0] = useState("2.3026");
  const [x1s, setX1] = useState("20");
  const [y1s, setY1] = useState("2.9957");
  const [xps, setXp] = useState("15");
  const [run, setRun] = useState(0);

  const x0 = parseFloat(x0s), y0 = parseFloat(y0s), x1 = parseFloat(x1s), y1 = parseFloat(y1s), xp = parseFloat(xps);
  const errors: Record<string, string> = {};
  if (![x0, y0, x1, y1, xp].every(Number.isFinite)) errors.g = "All fields must be numbers.";
  if (x0 === x1) errors.g = "x₀ and x₁ must differ.";
  const valid = !errors.g;

  const result = useMemo(() => {
    if (!valid) return null;
    const { value, slope } = linearInterp(x0, y0, x1, y1, xp);
    const line = [{ x: x0, y: y0 }, { x: x1, y: y1 }];
    const inside = xp >= Math.min(x0, x1) && xp <= Math.max(x0, x1);
    return { value, slope, line, inside };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setX0("10"); setY0("2.3026"); setX1("20"); setY1("2.9957"); setXp("15"); setRun((r) => r + 1); }}
      runLabel="Interpolate"
      controls={
        <>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="x₀" value={x0s} onChange={setX0} step="any" />
            <NumberField label="y₀" value={y0s} onChange={setY0} step="any" />
            <NumberField label="x₁" value={x1s} onChange={setX1} step="any" />
            <NumberField label="y₁" value={y1s} onChange={setY1} step="any" />
          </div>
          <NumberField label="Interpolate at x =" value={xps} onChange={setXp} step="any" error={errors.g} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Provide two distinct points and a target x.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatTile label={`f(${xp})`} value={result.value.toFixed(6)} />
              <StatTile label="Slope (y₁−y₀)/(x₁−x₀)" value={result.slope.toFixed(6)} accent="text-emerald-600" />
              <StatTile label={result.inside ? "Interpolation" : "Extrapolation"} value={result.inside ? "inside" : "outside"} accent={result.inside ? "text-violet-600" : "text-rose-600"} />
            </div>

            {!result.inside && (
              <Callout tone="warn" title="Extrapolation">
                The target x lies outside [x₀, x₁]. Linear extrapolation is far less reliable than interpolation and can
                diverge from the true function quickly.
              </Callout>
            )}

            <OutputBlock title="Visualization — the interpolating line through the two points">
              <LineFigure
                height={300}
                xKey="x"
                xLabel="x"
                yLabel="y"
                series={[{ name: "Line through (x₀,y₀)-(x₁,y₁)", color: "#e11d48", dataKey: "y", data: result.line }]}
              />
              <div className="mt-3">
                <ScatterFigure
                  height={200}
                  xLabel="x"
                  yLabel="y"
                  groups={[
                    { name: "Data points", data: result.line, color: "#e11d48" },
                    { name: `Interpolated (${xp}, ${result.value.toFixed(3)})`, data: [{ x: xp, y: result.value }], color: "#16a34a" },
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The green marker is the interpolated value, sitting on the straight line joining the two known points.
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
          <strong>Linear interpolation</strong> estimates a value between two known data points by assuming the function
          behaves like a straight line over that interval. It is the simplest and most widely used interpolation method —
          the one implicitly used every time you "read between the lines" of a table.
        </p>
        <p>
          Given two points <MathTeX tex="(x_0, y_0)" /> and <MathTeX tex="(x_1, y_1)" />, it returns the height of the
          connecting chord at any intermediate <MathTeX tex="x" />.
        </p>
        <Callout tone="info" title="A chord, not a curve">
          Linear interpolation replaces the true curve between two samples with the straight chord joining them —
          exact only if the underlying function really is linear there.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Linear interpolation is everywhere in laboratory and computational physics:</p>
        <ul>
          <li><strong>Table look-up:</strong> steam tables, logarithm tables, thermodynamic data.</li>
          <li><strong>Sensor calibration:</strong> converting raw ADC counts to physical units.</li>
          <li><strong>Graphics &amp; animation:</strong> blending values between key frames.</li>
          <li><strong>Resampling:</strong> aligning two datasets on a common grid.</li>
          <li><strong>Root bracketing:</strong> the secant/false-position methods use linear interpolation of f(x).</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>The straight line through <MathTeX tex="(x_0,y_0)" /> and <MathTeX tex="(x_1,y_1)" /> has slope</p>
        <MathTeX block tex="m = \frac{y_1 - y_0}{x_1 - x_0}," />
        <p>so the interpolated value at <MathTeX tex="x" /> is</p>
        <MathTeX block tex="\boxed{\,y = y_0 + \frac{y_1 - y_0}{x_1 - x_0}\,(x - x_0)\,}." />
        <p>An equivalent, symmetric form uses weights that sum to one:</p>
        <MathTeX block tex="y = \frac{x_1 - x}{x_1 - x_0}\,y_0 + \frac{x - x_0}{x_1 - x_0}\,y_1." />
        <h3>Error of linear interpolation</h3>
        <p>If the true function is twice differentiable, the error on <MathTeX tex="[x_0,x_1]" /> is</p>
        <MathTeX block tex="E(x) = \frac{(x - x_0)(x - x_1)}{2}\,f''(\xi)," />
        <p>
          which is largest at the midpoint and grows with the interval width and the curvature
          <MathTeX tex="\,|f''|" />. Smaller spacing therefore gives much smaller error.
        </p>
        <Callout tone="tip" title="Interpolate, don't extrapolate">
          Using the same line for <MathTeX tex="x" /> outside <MathTeX tex="[x_0,x_1]" /> (extrapolation) is unreliable —
          the error term has no upper bracket there.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Trivial to compute; always stable; exact for linear data; foundation of table look-up and false-position." },
          { label: "Limitations", value: "Only first-order accurate; poor for strongly curved data; extrapolation is risky." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the two bracketing points (x₀,y₀) and (x₁,y₁)." },
        { label: "Read the target x at which the value is required." },
        { label: "Compute the slope m = (y₁ − y₀)/(x₁ − x₀)." },
        { label: "Evaluate y = y₀ + m·(x − x₀)." },
        { label: "Optionally warn if x lies outside [x₀, x₁] (extrapolation)." },
        { label: "Output the interpolated value." },
      ],
      pseudocode: `INPUT x0, y0, x1, y1, x
m ← (y1 - y0) / (x1 - x0)
y ← y0 + m * (x - x0)
OUTPUT y`,
      flowchart: ["Start", "Read points and x", "m = (y_1−y_0)/(x_1−x_0)", "y = y_0 + m(x−x_0)", "Output y", "Stop"],
    },
    simulator: <LinearSim />,
    cFilename: "linear_interp.c",
    cCode: `/* Linear Interpolation between two points
 * Compile: gcc linear_interp.c -o lin
 */
#include <stdio.h>

int main(void) {
    double x0, y0, x1, y1, x, y;

    printf("Enter (x0, y0): ");
    scanf("%lf %lf", &x0, &y0);
    printf("Enter (x1, y1): ");
    scanf("%lf %lf", &x1, &y1);
    printf("Enter x to interpolate: ");
    scanf("%lf", &x);

    if (x1 == x0) { printf("x0 and x1 must differ.\\n"); return 0; }

    y = y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    printf("Interpolated value f(%.4lf) = %.6lf\\n", x, y);
    return 0;
}`,
    viva: [
      { q: "What assumption does linear interpolation make?", a: "That the function is (approximately) a straight line between the two known points." },
      { q: "Write the linear interpolation formula.", a: "y = y₀ + (y₁ − y₀)(x − x₀)/(x₁ − x₀)." },
      { q: "What is the order of accuracy?", a: "First order — it is exact only for linear functions." },
      { q: "State the error term.", a: "E(x) = ½ (x − x₀)(x − x₁) f''(ξ); largest at the midpoint and proportional to curvature." },
      { q: "Where is the interpolation error largest?", a: "Near the middle of the interval [x₀, x₁]." },
      { q: "What is the difference between interpolation and extrapolation?", a: "Interpolation estimates within the data range; extrapolation goes beyond it and is far less reliable." },
      { q: "Give the symmetric (weighted) form.", a: "y = (x₁−x)/(x₁−x₀)·y₀ + (x−x₀)/(x₁−x₀)·y₁, weights summing to 1." },
      { q: "Which root-finding methods use linear interpolation?", a: "The secant method and the false-position (regula falsi) method." },
      { q: "How can accuracy be improved?", a: "Reduce the spacing between points, or use higher-order (quadratic, spline) interpolation." },
      { q: "Is linear interpolation continuous across intervals?", a: "The values are continuous (the pieces meet), but the slope is generally discontinuous at data points." },
      { q: "Give a practical use of linear interpolation.", a: "Reading intermediate values from a physical table such as a steam or logarithm table." },
    ],
    problems: [
      { level: "Easy", text: "Given ln 10 = 2.3026 and ln 20 = 2.9957, estimate ln 15 by linear interpolation.", hint: "≈ 2.649 (true 2.708)." },
      { level: "Easy", text: "From (0,0) and (2,8) estimate y at x = 1 and compare with y = x³.", hint: "Line gives 4, true 1." },
      { level: "Easy", text: "Interpolate the resistance at 35 °C from R(30)=110 Ω and R(40)=120 Ω.", hint: "115 Ω." },
      { level: "Medium", text: "Estimate the error of linear interpolation of sin x on [0, π/2] at the midpoint.", hint: "Use E = ½(x−x₀)(x−x₁)f''." },
      { level: "Medium", text: "Show that halving the interval reduces the max error by a factor of four.", hint: "Error ∝ (interval)²." },
      { level: "Medium", text: "Use linear interpolation to find where a tabulated f(x) crosses zero (false position).", hint: "Interpolate between sign change." },
      { level: "Advanced", text: "Compare linear vs quadratic interpolation error for eˣ on a coarse grid.", hint: "Quadratic is second order." },
      { level: "Advanced", text: "Build a table look-up routine that linearly interpolates an arbitrary sorted dataset.", hint: "Binary search then interpolate." },
      { level: "Advanced", text: "Explain why extrapolating a linear fit far outside the data is dangerous, with an example.", hint: "No error bracket beyond [x₀,x₁]." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — interpolation.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §3.1 (polynomial interpolation).</li>
        <li>B. S. Grewal, <em>Numerical Methods in Engineering &amp; Science</em>.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

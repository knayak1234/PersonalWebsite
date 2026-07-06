import { useMemo, useState } from "react";
import {
  ComposedChart, Line, ReferenceLine, ReferenceDot, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { compileExpression } from "@/lib/lab/expr";
import { secant, sampleCurve } from "@/lib/lab/numerics";
import { NumberField, TextField } from "@/components/lab/ParamControl";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function SecantSim() {
  const [fx, setFx] = useState("x^3 - x - 2");
  const [x0, setX0] = useState("1");
  const [x1, setX1] = useState("2");
  const [tol, setTol] = useState("0.0001");
  const [run, setRun] = useState(0);

  const compiled = compileExpression(fx);
  const x0N = parseFloat(x0), x1N = parseFloat(x1), tolN = parseFloat(tol);

  const errors: Record<string, string> = {};
  if (!compiled.ok) errors.fx = compiled.error || "Invalid function.";
  if (!Number.isFinite(x0N)) errors.x0 = "Enter a number.";
  if (!Number.isFinite(x1N)) errors.x1 = "Enter a number.";
  if (Number.isFinite(x0N) && Number.isFinite(x1N) && x0N === x1N) errors.x1 = "x₀ and x₁ must differ.";
  if (!Number.isFinite(tolN) || tolN <= 0) errors.tol = "Tolerance must be positive.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid || !compiled.fn) return null;
    const f = compiled.fn;
    const res = secant(f, x0N, x1N, tolN);
    const lo = Math.min(x0N, x1N, res.root) - 1;
    const hi = Math.max(x0N, x1N, res.root) + 1;
    // first secant line through (x0,f(x0)) and (x1,f(x1))
    const f0 = f(x0N), f1 = f(x1N);
    const m = (f1 - f0) / (x1N - x0N);
    const raw = sampleCurve(f, lo, hi, 240);
    const ys = raw.map((p) => p.y).filter((v) => Number.isFinite(v));
    const yMin = ys.length ? Math.min(...ys) : -1;
    const yMax = ys.length ? Math.max(...ys) : 1;
    const pad = (yMax - yMin) * 0.5 || 1;
    // Single dataset: function value y and secant value s at each x (secant
    // clamped to the visible band so a steep line can't distort the y-axis).
    const curve = raw.map((p) => {
      const x = +p.x.toFixed(4);
      const s = f1 + m * (x - x1N);
      return { x, y: p.y, s: s >= yMin - pad && s <= yMax + pad ? s : null };
    });
    return { res, curve, f };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setFx("x^3 - x - 2"); setX0("1"); setX1("2"); setTol("0.0001"); setRun((r) => r + 1); }}
      runLabel="Find root"
      controls={
        <>
          <TextField label="Function f(x)" value={fx} onChange={setFx} placeholder="e.g. x^3 - x - 2"
            hint="No derivative needed — two starting points instead." error={errors.fx} />
          <NumberField label="First point x₀" value={x0} onChange={setX0} step="any" error={errors.x0} />
          <NumberField label="Second point x₁" value={x1} onChange={setX1} step="any" error={errors.x1} />
          <NumberField label="Tolerance" value={tol} onChange={setTol} step="any" error={errors.tol} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Enter a valid function and two distinct starting points.</Callout>
        ) : !result.res.converged ? (
          <Callout tone="warn" title="Did not converge">{result.res.message || "Try different starting points."}</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Root estimate" value={result.res.root.toFixed(6)} />
              <StatTile label="f(root)" value={result.f(result.res.root).toExponential(2)} accent="text-emerald-600" />
              <StatTile label="Iterations" value={String(result.res.steps.length)} accent="text-amber-600" />
              <StatTile label="Final error" value={(result.res.steps.at(-1)?.error ?? 0).toExponential(2)} accent="text-rose-600" />
            </div>

            <OutputBlock title="Visualization — curve, first secant & root">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={result.curve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Line type="monotone" dataKey="y" name="f(x)" stroke="#ea580c" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="linear" dataKey="s" name="secant through x₀,x₁" stroke="#0891b2" strokeWidth={1.5} strokeDasharray="6 4" dot={false} connectNulls isAnimationActive={false} />
                  <ReferenceDot x={+result.res.root.toFixed(4)} y={0} r={5} fill="#16a34a" stroke="white" />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">
                The secant (cyan) replaces the tangent of Newton's method — each step uses the line through the
                two latest points, so no derivative is required.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — convergence">
              <LineFigure
                height={260}
                xKey="iter"
                xLabel="Iteration"
                yLabel="Error"
                series={[{ name: "Step size |xₖ₊₁ − xₖ|", data: result.res.steps, color: "#0891b2", dataKey: "error", dot: true }]}
              />
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Convergence is <em>superlinear</em> (order ≈ 1.618) — slower than Newton but faster than bisection,
                and with no derivative.
              </p>
              <ResultsTable
                rows={result.res.steps}
                columns={[
                  { key: "iter", header: "k" },
                  { key: "x", header: "xₖ", render: (r) => r.x.toFixed(8) },
                  { key: "fx", header: "f(xₖ)", render: (r) => r.fx.toExponential(3) },
                  { key: "error", header: "|Δx|", render: (r) => r.error.toExponential(3) },
                ]}
                caption="Secant iterates converge superlinearly toward the root."
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
          The <strong>Secant method</strong> is a derivative-free cousin of Newton–Raphson. Instead of the
          tangent line, it uses the <em>secant</em> line through the two most recent points to estimate where
          the function crosses zero. This avoids computing <MathTeX tex="f'(x)" /> entirely — invaluable when
          the derivative is unavailable or expensive.
        </p>
        <p>
          It converges <strong>superlinearly</strong> with order <MathTeX tex="\varphi \approx 1.618" /> (the
          golden ratio): slower than Newton's quadratic rate, but far faster than bisection, and at the cost of
          only one function evaluation per step.
        </p>
        <Callout tone="info" title="Newton without the derivative">
          Replace <MathTeX tex="f'(x_k)" /> in Newton's formula by the finite-difference slope
          <MathTeX tex="\,[f(x_k)-f(x_{k-1})]/(x_k-x_{k-1})" /> and you get exactly the secant method.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>The secant method is preferred whenever derivatives are hard to obtain:</p>
        <ul>
          <li><strong>Black-box functions:</strong> roots of simulation outputs where no analytic <MathTeX tex="f'" /> exists.</li>
          <li><strong>Experimental data:</strong> finding where a measured curve crosses a threshold.</li>
          <li><strong>Expensive derivatives:</strong> when each <MathTeX tex="f'" /> evaluation costs a full simulation.</li>
          <li><strong>Equation of state &amp; freeze-out:</strong> same physics targets as Newton, without coding the derivative.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Approximate the derivative in Newton's formula by the slope of the secant line through the last two
          iterates:
        </p>
        <MathTeX block tex="f'(x_k) \approx \frac{f(x_k) - f(x_{k-1})}{x_k - x_{k-1}}." />
        <p>Substituting gives the secant iteration:</p>
        <MathTeX block tex="\boxed{\,x_{k+1} = x_k - f(x_k)\,\frac{x_k - x_{k-1}}{f(x_k) - f(x_{k-1})}\,}" />
        <h3>Convergence</h3>
        <p>
          The error satisfies <MathTeX tex="\varepsilon_{k+1} \approx C\,\varepsilon_k\,\varepsilon_{k-1}" />,
          which leads to an asymptotic order equal to the golden ratio,
        </p>
        <MathTeX block tex="p = \frac{1+\sqrt 5}{2} \approx 1.618." />
        <p>
          So the secant method is <strong>superlinear</strong>. Although each step is less powerful than
          Newton's, it needs only one new function evaluation per step (Newton needs <MathTeX tex="f" /> and
          <MathTeX tex="\,f'" />), so in <em>cost per digit</em> the two are often comparable.
        </p>
        <Callout tone="warn" title="Watch the denominator">
          If <MathTeX tex="f(x_k)\approx f(x_{k-1})" /> the secant slope blows up. Unlike regula falsi the secant
          method does <em>not</em> keep the root bracketed, so it can diverge.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "No derivative required; superlinear (≈1.618); only one new f-evaluation per step; simple to code." },
          { label: "Limitations", value: "Not guaranteed to converge; needs two starting points; can fail if f(xₖ)≈f(xₖ₋₁); slower than Newton." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Choose two starting points x₀, x₁ and a tolerance ε." },
        { label: "Evaluate f(x₀) and f(x₁)." },
        { label: "Compute xₖ₊₁ = xₖ − f(xₖ)(xₖ − xₖ₋₁)/(f(xₖ) − f(xₖ₋₁))." },
        { label: "If |xₖ₊₁ − xₖ| < ε or |f(xₖ₊₁)| < ε, accept xₖ₊₁." },
        { label: "Otherwise shift xₖ₋₁ ← xₖ, xₖ ← xₖ₊₁ and repeat." },
        { label: "Guard against equal function values and a maximum iteration count." },
      ],
      pseudocode: `INPUT f, x0, x1, tol, maxIter
FOR k = 1 TO maxIter DO
    f0 ← f(x0);  f1 ← f(x1)
    IF |f1 − f0| < eps THEN STOP "flat secant"
    x2 ← x1 − f1 * (x1 − x0) / (f1 − f0)
    IF |x2 − x1| < tol THEN RETURN x2
    x0 ← x1;  x1 ← x2
END FOR
OUTPUT x1`,
      flowchart: ["Start", "Read f, x_0, x_1, tol", "x_2 = x_1 − f_1(x_1−x_0)/(f_1−f_0)", "|x_2 − x_1| < tol ?", "x_0=x_1; x_1=x_2", "Output root x_2", "Stop"],
    },
    simulator: <SecantSim />,
    cFilename: "secant.c",
    cCode: `/* Secant Method - derivative-free root finding
 * Compile: gcc secant.c -o secant -lm
 */
#include <stdio.h>
#include <math.h>

double f(double x) { return x*x*x - x - 2.0; }  /* root near 1.5214 */

int main(void) {
    double x0, x1, x2, tol;
    int k = 0, maxIter = 100;

    printf("Enter two starting points x0, x1: ");
    scanf("%lf %lf", &x0, &x1);
    printf("Enter tolerance: ");
    scanf("%lf", &tol);

    do {
        double f0 = f(x0), f1 = f(x1);
        if (fabs(f1 - f0) < 1e-14) {
            printf("Flat secant - division by zero.\\n");
            return 1;
        }
        x2 = x1 - f1 * (x1 - x0) / (f1 - f0);     /* secant update */
        printf("Iter %2d: x = %.8lf, f(x) = %.3e\\n", ++k, x2, f(x2));
        if (fabs(x2 - x1) < tol) break;
        x0 = x1;  x1 = x2;
    } while (k < maxIter);

    printf("Root = %.8lf  after %d iterations\\n", x2, k);
    return 0;
}`,
    viva: [
      { q: "How does the secant method approximate the derivative?", a: "By the slope of the secant line through the two latest points: [f(xₖ)−f(xₖ₋₁)]/(xₖ−xₖ₋₁)." },
      { q: "Write the secant iteration formula.", a: "xₖ₊₁ = xₖ − f(xₖ)(xₖ − xₖ₋₁)/(f(xₖ) − f(xₖ₋₁))." },
      { q: "What is its order of convergence?", a: "Superlinear, order = golden ratio φ = (1+√5)/2 ≈ 1.618." },
      { q: "How many starting points does it need?", a: "Two (x₀ and x₁), but they need not bracket the root." },
      { q: "How many function evaluations per iteration?", a: "One new evaluation per step (the other value is reused from the previous step)." },
      { q: "How does the secant method relate to Newton–Raphson?", a: "It is Newton's method with the derivative replaced by a finite-difference (secant) approximation." },
      { q: "How does it differ from regula falsi (false position)?", a: "Regula falsi keeps the root bracketed (always guaranteed); the secant method does not bracket and can diverge but is usually faster." },
      { q: "When can the secant method fail?", a: "When f(xₖ) ≈ f(xₖ₋₁) (flat secant ⇒ division by near-zero), or with poor starting points causing divergence." },
      { q: "Is the secant method guaranteed to converge?", a: "No — like Newton it can diverge; it lacks the safety of a bracketing method." },
      { q: "Compare cost-per-digit of secant vs Newton.", a: "Newton is order 2 but needs f and f′; secant is order 1.618 but only one f-eval — per-evaluation efficiency is often comparable." },
      { q: "What stopping criteria are used?", a: "|xₖ₊₁ − xₖ| < ε, |f(xₖ₊₁)| < ε, or a maximum iteration limit." },
      { q: "Why is the secant method attractive for black-box functions?", a: "It needs only function values, so it works when no analytic derivative is available (e.g. simulation outputs)." },
      { q: "Derive the error recurrence of the secant method.", a: "εₖ₊₁ ≈ C·εₖ·εₖ₋₁; assuming εₖ ∝ εₖ₋₁^p gives p² = p + 1, so p = φ ≈ 1.618." },
      { q: "What happens if you start both points on the same side of the root?", a: "It can still converge (it is not a bracketing method), but may first move away before homing in." },
      { q: "Give a practical scenario favouring secant over Newton.", a: "Finding where an expensive simulation's output crosses a threshold, where evaluating a derivative would require a second costly run." },
    ],
    problems: [
      { level: "Easy", text: "Find the root of x³ − x − 2 = 0 with x₀ = 1, x₁ = 2 to 10⁻⁶ and count iterations.", hint: "Root ≈ 1.521380." },
      { level: "Easy", text: "Solve cos x − x = 0 by the secant method from x₀ = 0, x₁ = 1.", hint: "Root ≈ 0.739085." },
      { level: "Easy", text: "Estimate √5 via the secant method on f(x) = x² − 5 from x₀ = 2, x₁ = 3.", hint: "Root ≈ 2.236068." },
      { level: "Medium", text: "Compare the iteration count of secant vs Newton for x³ − x − 2 to the same tolerance.", hint: "Secant ~6–7, Newton ~4–5." },
      { level: "Medium", text: "Solve x·e^x − 1 = 0 (the omega constant) using the secant method.", hint: "Root ≈ 0.567143." },
      { level: "Medium", text: "Demonstrate numerically that the secant order is ≈ 1.618 by tracking log|εₖ₊₁|/log|εₖ|.", hint: "Use a high-precision reference root." },
      { level: "Medium", text: "Find the smallest positive root of tan x − x = 0 with carefully chosen starting points.", hint: "Stay within one branch of tan." },
      { level: "Advanced", text: "Modify the algorithm into regula falsi (keep the bracket) and compare convergence on x² − 2.", hint: "Replace the older point only if the sign condition holds." },
      { level: "Advanced", text: "Use the secant method to find the freeze-out temperature from a thermal-model number-density equation n(T) = n₀.", hint: "Provide two physically reasonable temperatures." },
      { level: "Advanced", text: "Investigate a case where the secant method diverges and explain the geometry that causes it.", hint: "Try a starting pair straddling a near-flat region." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 6 (Secant method).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §9.2 (Secant &amp; false position).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

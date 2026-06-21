import { useMemo, useState } from "react";
import {
  ComposedChart, Line, ReferenceLine, ReferenceDot, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { compileExpression } from "@/lib/lab/expr";
import { newtonRaphson, centralDiff, sampleCurve } from "@/lib/lab/numerics";
import { NumberField, TextField } from "@/components/lab/ParamControl";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function NewtonSim() {
  const [fx, setFx] = useState("x^3 - x - 2");
  const [x0, setX0] = useState("1.5");
  const [tol, setTol] = useState("0.0001");
  const [run, setRun] = useState(0);

  const compiled = compileExpression(fx);
  const x0N = parseFloat(x0), tolN = parseFloat(tol);

  const errors: Record<string, string> = {};
  if (!compiled.ok) errors.fx = compiled.error || "Invalid function.";
  if (!Number.isFinite(x0N)) errors.x0 = "Enter a number.";
  if (!Number.isFinite(tolN) || tolN <= 0) errors.tol = "Tolerance must be positive.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid || !compiled.fn) return null;
    const f = compiled.fn;
    const df = (x: number) => centralDiff(f, x, 1e-6);
    const res = newtonRaphson(f, df, x0N, tolN);
    // sample curve around the action
    const lo = Math.min(x0N, res.root) - 1.5;
    const hi = Math.max(x0N, res.root) + 1.5;
    const slope = df(x0N), fx0 = f(x0N);
    const raw = sampleCurve(f, lo, hi, 240);
    const ys = raw.map((p) => p.y).filter((v) => Number.isFinite(v));
    const yMin = ys.length ? Math.min(...ys) : -1;
    const yMax = ys.length ? Math.max(...ys) : 1;
    const pad = (yMax - yMin) * 0.5 || 1;
    // Single dataset: function value y and tangent value t at each x (tangent
    // clamped to the visible band so a steep slope can't blow up the y-axis).
    const curve = raw.map((p) => {
      const x = +p.x.toFixed(4);
      const t = fx0 + slope * (x - x0N);
      return { x, y: p.y, t: t >= yMin - pad && t <= yMax + pad ? t : null };
    });
    return { res, curve, f };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setFx("x^3 - x - 2"); setX0("1.5"); setTol("0.0001"); setRun((r) => r + 1); }}
      runLabel="Find root"
      controls={
        <>
          <TextField label="Function f(x)" value={fx} onChange={setFx} placeholder="e.g. x^3 - x - 2"
            hint="The derivative f′(x) is computed numerically." error={errors.fx} />
          <NumberField label="Initial guess x₀" value={x0} onChange={setX0} step="any" error={errors.x0} />
          <NumberField label="Tolerance" value={tol} onChange={setTol} step="any" error={errors.tol} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Enter a valid function and starting guess.</Callout>
        ) : !result.res.converged ? (
          <Callout tone="warn" title="Did not converge">{result.res.message || "Try a different starting point — Newton can diverge or oscillate."}</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Root estimate" value={result.res.root.toFixed(6)} />
              <StatTile label="f(root)" value={result.f(result.res.root).toExponential(2)} accent="text-emerald-600" />
              <StatTile label="Iterations" value={String(result.res.steps.length)} accent="text-amber-600" />
              <StatTile label="Final error" value={(result.res.steps.at(-1)?.error ?? 0).toExponential(2)} accent="text-rose-600" />
            </div>

            <OutputBlock title="Visualization — curve, first tangent & root">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={result.curve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Line type="monotone" dataKey="y" name="f(x)" stroke="#dc2626" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="linear" dataKey="t" name="tangent at x₀" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="6 4" dot={false} connectNulls isAnimationActive={false} />
                  <ReferenceDot x={+result.res.root.toFixed(4)} y={0} r={5} fill="#16a34a" stroke="white" />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">
                Each step replaces the curve by its tangent (blue) and jumps to where the tangent crosses zero;
                the green dot is the converged root.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — convergence">
              <LineFigure
                height={260}
                xKey="iter"
                xLabel="Iteration"
                yLabel="Error"
                series={[{ name: "Step size |xₖ₊₁ − xₖ|", data: result.res.steps, color: "#2563eb", dataKey: "error", dot: true }]}
              />
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Notice how the error roughly <em>squares</em> each step — the hallmark of quadratic convergence.
              </p>
              <ResultsTable
                rows={result.res.steps}
                columns={[
                  { key: "iter", header: "k" },
                  { key: "x", header: "xₖ", render: (r) => r.x.toFixed(8) },
                  { key: "fx", header: "f(xₖ)", render: (r) => r.fx.toExponential(3) },
                  { key: "error", header: "|Δx|", render: (r) => r.error.toExponential(3) },
                ]}
                caption="Successive Newton iterates converge quadratically to the root."
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
          The <strong>Newton–Raphson method</strong> finds a root of <MathTeX tex="f(x)=0" /> by repeatedly
          following the tangent line of the curve down to the x-axis. Starting from a guess
          <MathTeX tex="\,x_0" />, it produces a sequence that, when it works, converges
          <strong> quadratically</strong> — roughly doubling the number of correct digits every step.
        </p>
        <p>
          It is the fastest of the classical root finders and underlies countless physics computations,
          from inverting an equation of state to solving the dispersion relations of waves.
        </p>
        <Callout tone="tip" title="Speed vs. safety">
          Newton is blazingly fast near a simple root but needs the derivative and a good starting guess;
          a poor guess can send it diverging or oscillating. Bracketing methods like bisection trade speed
          for guaranteed convergence.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Newton–Raphson appears everywhere a fast nonlinear solve is needed:</p>
        <ul>
          <li><strong>Equation of state:</strong> solving <MathTeX tex="P(\rho,T)=P_0" /> for density in stellar and nuclear matter.</li>
          <li><strong>Saha &amp; freeze-out equations:</strong> ionisation and chemical-equilibrium balances.</li>
          <li><strong>Kepler's equation:</strong> solving <MathTeX tex="M = E - e\sin E" /> for orbital position.</li>
          <li><strong>Root of dispersion relations:</strong> plasma and waveguide mode frequencies.</li>
          <li><strong>Optimisation:</strong> the core update inside many minimisers and ML training loops.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Expand <MathTeX tex="f" /> in a first-order Taylor series about the current estimate
          <MathTeX tex="\,x_k" /> and demand the linear approximation vanish:
        </p>
        <MathTeX block tex="f(x) \approx f(x_k) + f'(x_k)\,(x - x_k) = 0." />
        <p>Solving for <MathTeX tex="x" /> gives the iteration formula:</p>
        <MathTeX block tex="\boxed{\,x_{k+1} = x_k - \dfrac{f(x_k)}{f'(x_k)}\,}" />
        <h3>Convergence</h3>
        <p>
          Writing the error <MathTeX tex="\varepsilon_k = x_k - r" /> about a simple root <MathTeX tex="r" />, a
          Taylor analysis gives
        </p>
        <MathTeX block tex="\varepsilon_{k+1} \approx \frac{f''(r)}{2 f'(r)}\,\varepsilon_k^{2}," />
        <p>
          i.e. the error is proportional to the <em>square</em> of the previous error —
          <strong> second-order (quadratic) convergence</strong>. Each step roughly doubles the number of
          accurate digits.
        </p>
        <Callout tone="warn" title="When it fails">
          If <MathTeX tex="f'(x_k)\to 0" /> the step explodes; near an inflection it can overshoot; for a root
          of multiplicity <MathTeX tex="m>1" /> convergence degrades to linear.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Quadratic convergence; very few iterations; extends naturally to systems via the Jacobian." },
          { label: "Limitations", value: "Needs f′; sensitive to the initial guess; can diverge or cycle; fails when f′ ≈ 0." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Choose an initial guess x₀ and a tolerance ε." },
        { label: "Evaluate f(xₖ) and f′(xₖ)." },
        { label: "Compute the next iterate xₖ₊₁ = xₖ − f(xₖ)/f′(xₖ)." },
        { label: "If |xₖ₊₁ − xₖ| < ε or |f(xₖ₊₁)| < ε, accept xₖ₊₁ as the root." },
        { label: "Otherwise set xₖ ← xₖ₊₁ and repeat." },
        { label: "Guard against f′(xₖ) ≈ 0 and a maximum iteration count." },
      ],
      pseudocode: `INPUT f, f', x0, tol, maxIter
x ← x0
FOR k = 1 TO maxIter DO
    IF |f'(x)| < eps THEN STOP "derivative ~ 0"
    xnew ← x − f(x) / f'(x)
    IF |xnew − x| < tol THEN RETURN xnew
    x ← xnew
END FOR
OUTPUT x`,
      flowchart: ["Start", "Read f, f', x0, tol", "xnew = x − f(x)/f'(x)", "|xnew − x| < tol ?", "x = xnew", "Output root xnew", "Stop"],
    },
    simulator: <NewtonSim />,
    cFilename: "newton_raphson.c",
    cCode: `/* Newton-Raphson Method - root finding
 * Compile: gcc newton_raphson.c -o newton -lm
 */
#include <stdio.h>
#include <math.h>

/* f(x) = x^3 - x - 2, root near 1.5214 */
double f(double x)  { return x*x*x - x - 2.0; }
double df(double x) { return 3.0*x*x - 1.0;   }  /* analytic derivative */

int main(void) {
    double x, xnew, tol;
    int k = 0, maxIter = 100;

    printf("Enter initial guess x0: ");
    scanf("%lf", &x);
    printf("Enter tolerance: ");
    scanf("%lf", &tol);

    do {
        if (fabs(df(x)) < 1e-12) {
            printf("Derivative near zero - method fails.\\n");
            return 1;
        }
        xnew = x - f(x) / df(x);             /* Newton update */
        printf("Iter %2d: x = %.8lf, f(x) = %.3e\\n", ++k, xnew, f(xnew));
        if (fabs(xnew - x) < tol) break;
        x = xnew;
    } while (k < maxIter);

    printf("Root = %.8lf  after %d iterations\\n", xnew, k);
    return 0;
}`,
    viva: [
      { q: "On what mathematical idea is Newton–Raphson based?", a: "A first-order Taylor expansion: replace f by its tangent line at xₖ and solve the linear approximation f(xₖ)+f′(xₖ)(x−xₖ)=0." },
      { q: "Write the Newton–Raphson iteration formula.", a: "xₖ₊₁ = xₖ − f(xₖ)/f′(xₖ)." },
      { q: "What is the order of convergence?", a: "Quadratic (order 2) for a simple root — the error is proportional to the square of the previous error." },
      { q: "What geometric quantity does each iteration use?", a: "The tangent (slope f′) to the curve at the current point; the next iterate is where that tangent meets the x-axis." },
      { q: "When does Newton–Raphson fail or diverge?", a: "When f′(xₖ) ≈ 0, near inflection points, for a bad initial guess, or for roots of multiplicity > 1 (where convergence drops to linear)." },
      { q: "How does convergence change for a root of multiplicity m?", a: "It degrades from quadratic to linear; a modified iteration xₖ₊₁ = xₖ − m·f/f′ restores quadratic convergence." },
      { q: "What is the main disadvantage compared with bisection?", a: "It is not guaranteed to converge and it requires the derivative; bisection always converges but only linearly." },
      { q: "How is the derivative obtained if f is only known numerically?", a: "By a finite-difference approximation (e.g. central difference) — which effectively turns Newton into the secant method." },
      { q: "What stopping criteria are used?", a: "|xₖ₊₁ − xₖ| < ε, |f(xₖ₊₁)| < ε, or a maximum iteration count, often combined." },
      { q: "Give the error recurrence near a simple root.", a: "εₖ₊₁ ≈ [f″(r)/2f′(r)] εₖ², showing quadratic convergence." },
      { q: "How does Newton extend to systems of equations?", a: "x_{k+1} = x_k − J⁻¹ F(x_k), where J is the Jacobian matrix of the system F." },
      { q: "Why might Newton oscillate between two values?", a: "If the iterates land symmetrically about the root on a curve with the wrong concavity, they can cycle without converging (a limit cycle)." },
      { q: "How many iterations does Newton typically need vs. bisection for 6-digit accuracy?", a: "Often 4–6 iterations vs. ~20 for bisection, because each Newton step roughly doubles the correct digits." },
      { q: "What is the relationship between Newton–Raphson and fixed-point iteration?", a: "Newton is a fixed-point iteration x = g(x) with g(x) = x − f(x)/f′(x); g′(r) = 0 at a simple root, which gives quadratic convergence." },
      { q: "State a physics example solved by Newton–Raphson.", a: "Solving Kepler's equation M = E − e sin E for the eccentric anomaly E in orbital mechanics." },
    ],
    problems: [
      { level: "Easy", text: "Find the root of x³ − x − 2 = 0 from x₀ = 1.5 and count the iterations to 10⁻⁶.", hint: "Root ≈ 1.521380." },
      { level: "Easy", text: "Compute √2 by applying Newton to f(x) = x² − 2 with x₀ = 1.", hint: "Iteration becomes xₖ₊₁ = (xₖ + 2/xₖ)/2." },
      { level: "Easy", text: "Find a root of cos x − x = 0 starting from x₀ = 0.5.", hint: "Root ≈ 0.739085." },
      { level: "Medium", text: "Derive the Newton iteration for computing the reciprocal 1/a without division, using f(x) = 1/x − a.", hint: "xₖ₊₁ = xₖ(2 − a·xₖ)." },
      { level: "Medium", text: "Solve Kepler's equation E − 0.3 sin E = 1 (radians) for E by Newton's method.", hint: "f′(E) = 1 − 0.3 cos E." },
      { level: "Medium", text: "Show numerically that Newton converges only linearly for f(x) = (x − 1)² and explain why.", hint: "Double root ⇒ f′(r) = 0." },
      { level: "Medium", text: "Find the cube root of 7 using Newton on f(x) = x³ − 7.", hint: "Root ≈ 1.912931." },
      { level: "Advanced", text: "Implement Newton with a numerical derivative and compare iteration counts with the analytic-derivative version for x³ − x − 2.", hint: "Use central difference with small h." },
      { level: "Advanced", text: "Solve the transcendental finite-square-well equation √(V₀ − E)·tan(a√E) = √E by Newton for the ground state.", hint: "Choose x₀ from a rough plot of both sides." },
      { level: "Advanced", text: "Extend Newton to the 2×2 system x² + y² = 4, x·y = 1 using the Jacobian.", hint: "Solve J·Δ = −F each step." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 6 (Open methods).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §9.4 (Newton–Raphson).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. H. Landau, M. J. Páez &amp; C. C. Bordeianu, <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

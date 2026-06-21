import { useMemo, useState } from "react";
import {
  ComposedChart, Line, ReferenceLine, ReferenceDot, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { compileExpression } from "@/lib/lab/expr";
import { bisection, sampleCurve } from "@/lib/lab/numerics";
import { NumberField, TextField } from "@/components/lab/ParamControl";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function BisectionSim() {
  const [fx, setFx] = useState("x^3 - x - 2");
  const [a, setA] = useState("1");
  const [b, setB] = useState("2");
  const [tol, setTol] = useState("0.0001");
  const [run, setRun] = useState(0);

  const compiled = compileExpression(fx);
  const aN = parseFloat(a), bN = parseFloat(b), tolN = parseFloat(tol);

  const errors: Record<string, string> = {};
  if (!compiled.ok) errors.fx = compiled.error || "Invalid function.";
  if (!Number.isFinite(aN)) errors.a = "Enter a number.";
  if (!Number.isFinite(bN)) errors.b = "Enter a number.";
  if (!Number.isFinite(tolN) || tolN <= 0) errors.tol = "Tolerance must be positive.";
  if (compiled.ok && compiled.fn && Number.isFinite(aN) && Number.isFinite(bN)) {
    if (compiled.fn(aN) * compiled.fn(bN) > 0) errors.b = "f(a) and f(b) must have opposite signs (bracket a root).";
  }
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid || !compiled.fn) return null;
    const f = compiled.fn;
    const res = bisection(f, aN, bN, tolN);
    const curve = sampleCurve(f, aN, bN, 240).map((p) => ({ x: +p.x.toFixed(4), y: p.y }));
    return { res, curve, f };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setFx("x^3 - x - 2"); setA("1"); setB("2"); setTol("0.0001"); setRun((r) => r + 1); }}
      runLabel="Find root"
      controls={
        <>
          <TextField label="Function f(x)" value={fx} onChange={setFx} placeholder="e.g. x^3 - x - 2"
            hint="Need f(a)·f(b) < 0." error={errors.fx} />
          <NumberField label="Bracket start a" value={a} onChange={setA} error={errors.a} />
          <NumberField label="Bracket end b" value={b} onChange={setB} error={errors.b} />
          <NumberField label="Tolerance" value={tol} onChange={setTol} step="any" error={errors.tol} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">
            Make sure f(a) and f(b) have opposite signs so a root is bracketed.
          </Callout>
        ) : !result.res.converged && Number.isNaN(result.res.root) ? (
          <Callout tone="warn" title="No sign change">{result.res.message}</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Root estimate" value={result.res.root.toFixed(6)} />
              <StatTile label="f(root)" value={result.f(result.res.root).toExponential(2)} accent="text-emerald-600" />
              <StatTile label="Iterations" value={String(result.res.steps.length)} accent="text-amber-600" />
              <StatTile label="Final error" value={(result.res.steps.at(-1)?.error ?? 0).toExponential(2)} accent="text-rose-600" />
            </div>

            <OutputBlock title="Visualization — function & converged root">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={result.curve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Line type="monotone" dataKey="y" name="f(x)" stroke="#e11d48" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <ReferenceDot x={+result.res.root.toFixed(4)} y={0} r={5} fill="#16a34a" stroke="white" />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">
                The green dot marks where f(x) crosses zero — the root the method has bracketed and squeezed.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — convergence">
              <LineFigure
                height={260}
                xKey="iter"
                xLabel="Iteration"
                yLabel="Error"
                series={[{ name: "Bracket half-width (error)", data: result.res.steps, color: "#7c3aed", dataKey: "error", dot: true }]}
              />
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                The error halves every step — a straight line on a log scale — confirming <em>linear</em> convergence.
              </p>
              <ResultsTable
                rows={result.res.steps}
                columns={[
                  { key: "iter", header: "k" },
                  { key: "a", header: "aₖ", render: (r) => r.a!.toFixed(6) },
                  { key: "b", header: "bₖ", render: (r) => r.b!.toFixed(6) },
                  { key: "x", header: "cₖ = (a+b)/2", render: (r) => r.x.toFixed(6) },
                  { key: "fx", header: "f(cₖ)", render: (r) => r.fx.toExponential(3) },
                  { key: "error", header: "error", render: (r) => r.error.toExponential(3) },
                ]}
                caption="Each row halves the bracket; the midpoint cₖ converges to the root."
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
          The <strong>Bisection Method</strong> is the most robust way to find a root of a continuous
          function <MathTeX tex="f(x)=0" />. Given an interval where the function changes sign, it
          repeatedly halves the interval, always keeping the half that still contains the root. It is
          guaranteed to converge — it can never diverge — which makes it the safe fallback when faster
          methods misbehave.
        </p>
        <p>
          Root finding is one of the most common tasks in physics: solving transcendental equations,
          locating energy eigenvalues, or finding the temperature at which two expressions balance.
        </p>
        <Callout tone="info" title="The one condition">
          You must start with <MathTeX tex="a,b" /> such that <MathTeX tex="f(a)\,f(b)<0" /> — opposite
          signs guarantee at least one root lies between them (Intermediate Value Theorem).
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Bracketing root finders are used throughout physics:</p>
        <ul>
          <li><strong>Transcendental equations:</strong> solving <MathTeX tex="\tan x = x" /> for infinite-square-well or waveguide modes.</li>
          <li><strong>Freeze-out temperature:</strong> solving thermal-model equations for chemical freeze-out in heavy-ion collisions.</li>
          <li><strong>Equation of state:</strong> inverting <MathTeX tex="P(\rho,T)" /> to find density at a given pressure.</li>
          <li><strong>Energy eigenvalues:</strong> shooting-method matching conditions in the Schrödinger equation.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          <strong>Intermediate Value Theorem.</strong> If <MathTeX tex="f" /> is continuous on
          <MathTeX tex="\,[a,b]" /> and <MathTeX tex="f(a)f(b)<0" />, then there exists at least one
          <MathTeX tex="\,c\in(a,b)" /> with <MathTeX tex="f(c)=0" />.
        </p>
        <p>Each step computes the midpoint and decides which half retains the sign change:</p>
        <MathTeX block tex="c = \frac{a+b}{2}, \qquad \begin{cases} \text{root in }[a,c] & \text{if } f(a)f(c)<0,\\[2pt] \text{root in }[c,b] & \text{otherwise.}\end{cases}" />
        <h3>Convergence</h3>
        <p>After <MathTeX tex="k" /> iterations the bracket width is</p>
        <MathTeX block tex="|b_k - a_k| = \frac{b-a}{2^k}," />
        <p>so the error halves every step — <strong>linear convergence</strong> with rate 1/2. The number of iterations to reach tolerance <MathTeX tex="\varepsilon" /> is</p>
        <MathTeX block tex="k \ge \log_2\!\left(\frac{b-a}{\varepsilon}\right)." />
        <Callout tone="tip" title="Robust but steady">
          Bisection always converges but slowly — it gains exactly one bit of accuracy per step (~3.3
          steps per decimal digit). Faster methods (Newton, secant) converge superlinearly but can fail;
          bisection never does.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Guaranteed convergence; only needs sign of f; extremely robust; error bound known in advance." },
          { label: "Limitations", value: "Slow (linear) convergence; needs an initial bracket; finds only one root per bracket; cannot find even-multiplicity roots." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Choose a, b with f(a)·f(b) < 0 and set a tolerance ε." },
        { label: "Compute the midpoint c = (a + b) / 2 and evaluate f(c)." },
        { label: "If |f(c)| < ε or (b − a)/2 < ε, accept c as the root." },
        { label: "Else if f(a)·f(c) < 0, set b = c (root is in the left half)." },
        { label: "Otherwise set a = c (root is in the right half)." },
        { label: "Repeat from step 2 until the tolerance is met." },
      ],
      pseudocode: `INPUT f, a, b, tol
WHILE (b − a)/2 > tol DO
    c ← (a + b) / 2
    IF f(c) = 0 THEN BREAK
    IF f(a) × f(c) < 0 THEN b ← c
    ELSE                    a ← c
END WHILE
OUTPUT c = (a + b)/2`,
      flowchart: ["Start", "Read f, a, b, tol", "c = (a+b)/2", "f(a)·f(c) < 0 ? b=c : a=c", "(b−a)/2 > tol ?", "Output root c", "Stop"],
    },
    simulator: <BisectionSim />,
    cFilename: "bisection.c",
    cCode: `/* Bisection Method — root finding
 * Compile: gcc bisection.c -o bisection -lm
 */
#include <stdio.h>
#include <math.h>

double f(double x) {
    return x * x * x - x - 2.0;   /* example: x^3 - x - 2, root near 1.5214 */
}

int main(void) {
    double a, b, c, tol;
    int iter = 0;

    printf("Enter bracket a, b: ");
    scanf("%lf %lf", &a, &b);
    printf("Enter tolerance: ");
    scanf("%lf", &tol);

    if (f(a) * f(b) > 0) {
        printf("Error: f(a) and f(b) must have opposite signs.\\n");
        return 1;
    }

    while ((b - a) / 2.0 > tol) {
        c = (a + b) / 2.0;            /* midpoint */
        printf("Iter %2d: c = %.6lf, f(c) = %.6e\\n", ++iter, c, f(c));
        if (f(c) == 0.0) break;       /* exact root */
        if (f(a) * f(c) < 0) b = c;   /* root in left half  */
        else                 a = c;   /* root in right half */
    }

    printf("Root = %.6lf  after %d iterations\\n", (a + b) / 2.0, iter);
    return 0;
}`,
    viva: [
      { q: "On what theorem is the bisection method based?", a: "The Intermediate Value Theorem: a continuous function that changes sign on [a,b] has a root in (a,b)." },
      { q: "What is the necessary condition to start bisection?", a: "f(a) and f(b) must have opposite signs, i.e. f(a)·f(b) < 0." },
      { q: "What is the order/rate of convergence of bisection?", a: "Linear convergence with rate 1/2 — the error is halved each iteration." },
      { q: "How many iterations are needed to reach tolerance ε?", a: "k ≥ log₂((b−a)/ε); about 3.3 iterations per decimal digit of accuracy." },
      { q: "Is bisection guaranteed to converge?", a: "Yes, as long as f is continuous and the initial bracket has a sign change — it cannot diverge." },
      { q: "What is the error bound after k steps?", a: "|error| ≤ (b−a)/2^{k+1}; the bracket width is (b−a)/2^k." },
      { q: "What is a drawback of bisection compared with Newton–Raphson?", a: "It converges only linearly (slowly); Newton–Raphson converges quadratically when it works." },
      { q: "Can bisection find a root of even multiplicity, e.g. f(x) = (x−1)²?", a: "No — there is no sign change at an even-multiplicity root, so it cannot be bracketed." },
      { q: "What happens if there are multiple roots in [a,b]?", a: "Bisection converges to just one of them; which one depends on the sign pattern at the midpoints." },
      { q: "Why is bisection called a bracketing method?", a: "Because it always maintains an interval [a,b] that is guaranteed to contain the root, shrinking it each step." },
      { q: "What stopping criteria can be used?", a: "Interval width (b−a)/2 < ε, |f(c)| < ε, or a maximum iteration count — often a combination." },
      { q: "How do you choose the initial interval in practice?", a: "By tabulating or plotting f to locate a sign change, or by incremental search stepping along x." },
      { q: "Does bisection need the derivative of f?", a: "No — it only needs the sign of f, which makes it very robust for non-smooth functions." },
      { q: "Compare bisection with the false-position (regula falsi) method.", a: "Both bracket the root; regula falsi uses a secant interpolation and is often faster, but can converge one-sidedly and stall, while bisection's bound is guaranteed." },
      { q: "Give a physics example where bisection is useful.", a: "Solving the transcendental equation for bound-state energies of a finite square well, or finding the chemical freeze-out temperature in a thermal model." },
    ],
    problems: [
      { level: "Easy", text: "Find the root of x³ − x − 2 = 0 in [1,2] to tolerance 10⁻³ and count the iterations.", hint: "Root ≈ 1.5214." },
      { level: "Easy", text: "Solve cos x − x = 0 in [0,1] using bisection.", hint: "Root ≈ 0.739 (the Dottie number)." },
      { level: "Easy", text: "Locate √2 by finding the root of x² − 2 = 0 in [1,2].", hint: "Root ≈ 1.41421." },
      { level: "Medium", text: "Determine how many iterations bisection needs to find a root in [0,1] to 10⁻⁶ accuracy.", hint: "k ≥ log₂(10⁶) ≈ 20." },
      { level: "Medium", text: "Solve x·e^x = 1 (i.e. x = e^{−x}) in [0,1] and identify the constant you obtain.", hint: "It is the omega constant ≈ 0.5671." },
      { level: "Medium", text: "Find the smallest positive root of tan x = x and explain the bracketing care needed near the asymptote.", hint: "Avoid brackets straddling a pole of tan." },
      { level: "Medium", text: "For f(x) = x² − 2, compare the number of bisection steps with Newton's method from x₀ = 2.", hint: "Newton converges in ~4 steps." },
      { level: "Advanced", text: "Implement an incremental-search routine that auto-detects all sign changes of f on [a,b], then bisects each.", hint: "Step in small increments and watch for sign flips." },
      { level: "Advanced", text: "Solve the finite square well transcendental equation k·tan(k a) = κ for the ground-state energy by bisection.", hint: "Express κ in terms of k and the well depth." },
      { level: "Advanced", text: "Prove the error bound |c_k − root| ≤ (b−a)/2^{k+1} and verify it numerically for a chosen f.", hint: "The root lies in a bracket of width (b−a)/2^k." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 5 (Bracketing methods).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §9.1 (Bisection).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI — Solution of equations.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

import { useMemo, useState } from "react";
import { seriesSum, type SeriesKind } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { NumberField, SliderField } from "@/components/lab/ParamControl";
import { Label } from "@/components/ui/label";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

const KINDS: { id: SeriesKind; label: string; tex: string }[] = [
  { id: "sin", label: "sin(x)", tex: "\\sin x = \\sum_{k=0}^{\\infty} \\frac{(-1)^k x^{2k+1}}{(2k+1)!}" },
  { id: "cos", label: "cos(x)", tex: "\\cos x = \\sum_{k=0}^{\\infty} \\frac{(-1)^k x^{2k}}{(2k)!}" },
  { id: "exp", label: "eˣ", tex: "e^{x} = \\sum_{k=0}^{\\infty} \\frac{x^{k}}{k!}" },
  { id: "log", label: "log(1+x)", tex: "\\ln(1+x) = \\sum_{k=1}^{\\infty} \\frac{(-1)^{k-1} x^{k}}{k}" },
];

function SeriesSim() {
  const [kind, setKind] = useState<SeriesKind>("sin");
  const [xStr, setX] = useState("1");
  const [terms, setTerms] = useState(8);
  const [run, setRun] = useState(0);

  const x = parseFloat(xStr);
  const errors: Record<string, string> = {};
  if (!Number.isFinite(x)) errors.x = "Enter a number.";
  if (kind === "log" && Math.abs(x) >= 1) errors.x = "log(1+x) series converges only for |x| < 1.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const res = seriesSum(kind, x, terms);
    const conv = res.terms.map((t, i) => ({ n: i + 1, partial: t.partial, exact: res.exact }));
    return { res, conv };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const absErr = result ? Math.abs(result.res.sum - result.res.exact) : 0;

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setKind("sin"); setX("1"); setTerms(8); setRun((r) => r + 1); }}
      runLabel="Sum series"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Function</Label>
            <div className="grid grid-cols-2 gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${kind === k.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
                >{k.label}</button>
              ))}
            </div>
          </div>
          <NumberField label="x (radians for sin/cos)" value={xStr} onChange={setX} step="any" error={errors.x} />
          <SliderField label="Number of terms" value={terms} onChange={setTerms} min={1} max={20} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">
            {errors.x ?? "Provide a valid x."}
          </Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label={`Series sum (${terms} terms)`} value={result.res.sum.toFixed(8)} />
              <StatTile label="Library value" value={result.res.exact.toFixed(8)} accent="text-emerald-600" />
              <StatTile label="Absolute error" value={absErr.toExponential(2)} accent="text-rose-600" />
              <StatTile label="Terms used" value={String(terms)} accent="text-violet-600" />
            </div>

            <OutputBlock title="Visualization — partial sum converging to the true value">
              <LineFigure
                height={300}
                xKey="n"
                xLabel="terms included"
                yLabel="value"
                refY={result.res.exact}
                series={[
                  { name: "Partial sum", color: "#a21caf", dataKey: "partial", data: result.conv, dot: true },
                  { name: "Exact", color: "#16a34a", dataKey: "exact", data: result.conv, dash: true },
                ]}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Each added term nudges the partial sum toward the dashed exact value. Alternating series (sin, cos,
                log) bracket the answer from both sides.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — term-by-term accumulation">
              <ResultsTable
                rows={result.res.terms}
                columns={[
                  { key: "k", header: "k" },
                  { key: "term", header: "term", render: (r) => r.term.toExponential(4) },
                  { key: "partial", header: "partial sum", render: (r) => r.partial.toFixed(8) },
                  { key: "err", header: "|error|", render: (r) => Math.abs(r.partial - result.res.exact).toExponential(2) },
                ]}
                caption="The magnitude of each term shrinks toward zero; the sum stops when the next term is below the desired tolerance."
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
          Elementary functions such as <MathTeX tex="\sin x" />, <MathTeX tex="\cos x" />, <MathTeX tex="e^x" /> and
          <MathTeX tex="\,\ln(1+x)" /> are computed on a machine by summing their <strong>Maclaurin (Taylor) series</strong>.
          This experiment evaluates a chosen function by accumulating terms one at a time and watching the partial sum
          converge to the true value.
        </p>
        <p>
          It teaches how libraries actually evaluate transcendental functions, how convergence depends on the number of
          terms and on <MathTeX tex="x" />, and how to stop the summation once a term falls below a tolerance.
        </p>
        <Callout tone="info" title="Why series?">
          A computer only adds and multiplies. Series turn <MathTeX tex="\sin" />, <MathTeX tex="\cos" />,
          <MathTeX tex="\,\exp" /> and <MathTeX tex="\ln" /> into sequences of additions and multiplications.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Series evaluation is the backbone of scientific computing:</p>
        <ul>
          <li><strong>Function libraries:</strong> <code>sin</code>, <code>cos</code>, <code>exp</code>, <code>log</code> are internally series/CORDIC based.</li>
          <li><strong>Oscillations:</strong> sin/cos series model waves and simple harmonic motion.</li>
          <li><strong>Decay &amp; growth:</strong> eˣ appears in radioactive decay and RC circuits.</li>
          <li><strong>Small-angle &amp; perturbation:</strong> truncated series give handy approximations.</li>
          <li><strong>Special functions:</strong> Bessel, error and gamma functions are defined by series.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>The Maclaurin expansion of a function about <MathTeX tex="x=0" /> is</p>
        <MathTeX block tex="f(x) = \sum_{k=0}^{\infty} \frac{f^{(k)}(0)}{k!}\,x^{k}." />
        <p>For the four standard functions this gives:</p>
        <MathTeX block tex="\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots" />
        <MathTeX block tex="\cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots" />
        <MathTeX block tex="e^{x} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots" />
        <MathTeX block tex="\ln(1+x) = x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots \quad (|x|<1)." />
        <h3>Recurrence for efficiency</h3>
        <p>
          Rather than recomputing powers and factorials, each term is obtained from the previous one. For
          <MathTeX tex="\,e^x" />, <MathTeX tex="t_{k} = t_{k-1}\cdot x/k" />; for <MathTeX tex="\sin x" />,
          <MathTeX tex="\,t_{k} = -t_{k-1}\cdot x^2/[(2k)(2k+1)]" />. This keeps the cost at one multiply and divide per
          term and avoids overflow of <MathTeX tex="k!" />.
        </p>
        <h3>Convergence and stopping</h3>
        <p>
          The series for <MathTeX tex="\sin, \cos, \exp" /> converge for all <MathTeX tex="x" />, but many terms are
          needed when <MathTeX tex="|x|" /> is large; reducing the argument (e.g. <MathTeX tex="x \bmod 2\pi" />) helps.
          Summation stops when <MathTeX tex="|t_k| < \varepsilon" />.
        </p>
        <Callout tone="warn" title="Range reduction matters">
          For large <MathTeX tex="x" />, alternating series suffer cancellation. Real libraries first reduce the
          argument to a small interval before summing.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Uses only + and ×; recurrence avoids factorial overflow; error controllable by term count/tolerance." },
          { label: "Limitations", value: "Slow convergence for large |x|; cancellation in alternating series; log series needs |x| < 1." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Choose the function and read x and the tolerance (or number of terms)." },
        { label: "Initialise the sum with the first term and set up the recurrence." },
        { label: "Compute each next term from the previous one using the ratio rule." },
        { label: "Add the term to the running sum." },
        { label: "Stop when |term| < ε or the term limit is reached." },
        { label: "Output the sum and compare with the library value." },
      ],
      pseudocode: `INPUT x, N            /* e.g. e^x */
term ← 1;  sum ← 1
FOR k = 1 TO N DO
    term ← term * x / k     /* recurrence */
    sum  ← sum + term
    IF |term| < eps THEN break
OUTPUT sum`,
      flowchart: ["Start", "Read x, N", "Init term, sum", "Update term by recurrence", "sum += term", "|term| < ε ?", "Output sum", "Stop"],
    },
    simulator: <SeriesSim />,
    cFilename: "series_sum.c",
    cCode: `/* Series summation: sin, cos, e^x, log(1+x) via Maclaurin series
 * Compile: gcc series_sum.c -o series -lm
 */
#include <stdio.h>
#include <math.h>

int main(void) {
    int choice, k, N;
    double x, term, sum;

    printf("1=sin  2=cos  3=exp  4=log(1+x)\\nChoice: ");
    scanf("%d", &choice);
    printf("Enter x and number of terms N: ");
    scanf("%lf %d", &x, &N);

    if (choice == 3) {                 /* e^x */
        term = 1.0; sum = 1.0;
        for (k = 1; k < N; k++) { term *= x / k; sum += term; }
    } else if (choice == 4) {          /* log(1+x), |x|<1 */
        term = x; sum = 0.0;
        for (k = 1; k <= N; k++) { sum += (k%2 ? 1 : -1) * pow(x,k)/k; }
    } else {                           /* sin or cos */
        int start = (choice == 1) ? 1 : 0;   /* power of first term */
        sum = 0.0;
        for (k = 0; k < N; k++) {
            int p = start + 2*k;
            double t = pow(-1.0, k) * pow(x, p);
            double f = 1.0; int i;
            for (i = 2; i <= p; i++) f *= i;   /* p! */
            sum += t / f;
        }
    }

    printf("Series sum = %.8lf\\n", sum);
    return 0;
}`,
    viva: [
      { q: "What is a Maclaurin series?", a: "A Taylor series expanded about x = 0: f(x) = Σ f⁽ᵏ⁾(0) xᵏ / k!." },
      { q: "Write the series for sin x.", a: "sin x = x − x³/3! + x⁵/5! − … = Σ (−1)ᵏ x^(2k+1)/(2k+1)!." },
      { q: "Write the series for eˣ.", a: "eˣ = 1 + x + x²/2! + x³/3! + … = Σ xᵏ/k!." },
      { q: "For what x does the log(1+x) series converge?", a: "For |x| < 1 (and conditionally at x = 1)." },
      { q: "Why use a recurrence between terms?", a: "It avoids recomputing powers and factorials and prevents factorial overflow, giving one multiply/divide per term." },
      { q: "State the recurrence for the eˣ series.", a: "tₖ = tₖ₋₁ · x / k, starting from t₀ = 1." },
      { q: "When do you stop summing?", a: "When |tₖ| < ε (a tolerance) or a maximum number of terms is reached." },
      { q: "Why is range reduction used for large x?", a: "Large x needs many terms and causes cancellation; reducing x modulo 2π (for sin/cos) restores fast, accurate convergence." },
      { q: "What causes error in a truncated series?", a: "The remainder — the sum of all omitted terms — bounded by the first neglected term for alternating series." },
      { q: "Which series converge for all x?", a: "sin, cos and exp converge for every real x; the log(1+x) series does not." },
      { q: "Why can alternating series lose accuracy?", a: "Large terms of opposite sign nearly cancel, amplifying round-off (catastrophic cancellation)." },
      { q: "How is factorial overflow avoided in code?", a: "By building each term from the previous one via multiplication/division instead of computing k! directly." },
    ],
    problems: [
      { level: "Easy", text: "Compute sin(1) using 5 terms and compare with the library value.", hint: "≈ 0.841471." },
      { level: "Easy", text: "Sum eˣ at x = 1 with 10 terms; how close to e?", hint: "≈ 2.718282." },
      { level: "Easy", text: "Evaluate cos(0.5) with 4 terms.", hint: "≈ 0.877583." },
      { level: "Medium", text: "Use the recurrence tₖ = −tₖ₋₁ x²/[(2k)(2k+1)] for sin x and count multiplications saved.", hint: "One ×/÷ per term." },
      { level: "Medium", text: "Sum log(1+x) at x = 0.5 to 10⁻⁶ accuracy and report the term count.", hint: "Alternating, |x|<1." },
      { level: "Medium", text: "Show numerically that summing sin(10) directly needs many terms; then reduce the argument mod 2π.", hint: "10 − 2π·1 ≈ 3.717." },
      { level: "Advanced", text: "Compare the truncation error bound (first neglected term) with the actual error for cos(1).", hint: "Alternating series estimate." },
      { level: "Advanced", text: "Demonstrate cancellation by computing e^(−20) via its series vs 1/e^20.", hint: "The direct series loses precision." },
      { level: "Advanced", text: "Implement adaptive stopping when |term/sum| < 10⁻⁸.", hint: "Relative-tolerance test." },
    ],
    references: (
      <ul>
        <li>M. Abramowitz &amp; I. Stegun, <em>Handbook of Mathematical Functions</em> — series expansions.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §5 (series &amp; function evaluation).</li>
        <li>E. Balagurusamy, <em>Programming in ANSI C</em> — loops &amp; math functions.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

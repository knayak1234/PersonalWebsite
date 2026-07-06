import { useMemo, useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { compileExpression } from "@/lib/lab/expr";
import { trapezoidal, referenceIntegral, relErrorPct, sampleCurve } from "@/lib/lab/numerics";
import { NumberField, TextField } from "@/components/lab/ParamControl";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import ResultsTable from "@/components/lab/ResultsTable";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function TrapezoidalSim() {
  const [fx, setFx] = useState("exp(-x^2)");
  const [a, setA] = useState("0");
  const [b, setB] = useState("1");
  const [n, setN] = useState("8");
  const [run, setRun] = useState(0);

  const compiled = compileExpression(fx);
  const aN = parseFloat(a), bN = parseFloat(b), nN = parseInt(n, 10);

  const errors: Record<string, string> = {};
  if (!compiled.ok) errors.fx = compiled.error || "Invalid function.";
  if (!Number.isFinite(aN)) errors.a = "Enter a number.";
  if (!Number.isFinite(bN)) errors.b = "Enter a number.";
  if (Number.isFinite(aN) && Number.isFinite(bN) && aN >= bN) errors.b = "Upper limit must exceed lower limit.";
  if (!Number.isInteger(nN) || nN < 1) errors.n = "n must be a positive integer.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid || !compiled.fn) return null;
    const f = compiled.fn;
    const approx = trapezoidal(f, aN, bN, nN);
    const exact = referenceIntegral(f, aN, bN);
    const curve = sampleCurve(f, aN, bN, 240);
    return { approx, exact, curve, f };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  // Build chart data: true curve sampled finely + trapezoid nodes (linear area).
  const chartData = useMemo(() => {
    if (!result) return [];
    const map: Record<number, any> = {};
    result.curve.forEach((p) => { map[p.x] = { x: +p.x.toFixed(4), curve: p.y }; });
    result.approx.nodes.forEach((p) => {
      const key = +p.x.toFixed(4);
      map[key] = { ...(map[key] || { x: key }), trap: p.y };
    });
    return Object.values(map).sort((a: any, b: any) => a.x - b.x);
  }, [result]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setFx("exp(-x^2)"); setA("0"); setB("1"); setN("8"); setRun((r) => r + 1); }}
      runLabel="Compute"
      controls={
        <>
          <TextField label="Function f(x)" value={fx} onChange={setFx} placeholder="e.g. exp(-x^2)"
            hint="Use x, +,-,*,/,^, sin, cos, exp, log, sqrt…" error={errors.fx} />
          <NumberField label="Lower limit a" value={a} onChange={setA} error={errors.a} />
          <NumberField label="Upper limit b" value={b} onChange={setB} error={errors.b} />
          <NumberField label="Sub-intervals n" value={n} onChange={setN} min={1} step={1} error={errors.n}
            hint="More intervals → smaller error (≈ 1/n²)." />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Enter a valid function and limits, then press Compute.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Trapezoidal estimate" value={result.approx.value.toFixed(6)} />
              <StatTile label="Reference value" value={result.exact.toFixed(6)} accent="text-emerald-600" />
              <StatTile label="Absolute error" value={Math.abs(result.exact - result.approx.value).toExponential(2)} accent="text-rose-600" />
              <StatTile label="Relative error" value={relErrorPct(result.approx.value, result.exact).toFixed(4) + "%"} accent="text-amber-600" />
            </div>

            <OutputBlock title="Visualization — curve & trapezoidal strips">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80% / 0.3)" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="linear" dataKey="trap" name="Trapezoidal strips" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} connectNulls isAnimationActive={false} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="curve" name="f(x)" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">
                The shaded polygon is the trapezoidal approximation; the gap between it and the smooth
                curve f(x) is the error. Increase n to shrink it.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — node table">
              <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                <span><strong className="text-foreground">h = (b−a)/n =</strong> {result.approx.h.toFixed(6)}</span>
              </div>
              <ResultsTable
                rows={result.approx.steps}
                columns={[
                  { key: "i", header: "i" },
                  { key: "x", header: "xᵢ", render: (r) => r.x.toFixed(6) },
                  { key: "fx", header: "f(xᵢ)", render: (r) => r.fx.toFixed(6) },
                  { key: "weight", header: "weight", render: (r) => (r.weight === 1 ? "1 (end)" : "2") },
                  { key: "contribution", header: "wᵢ·f(xᵢ)", render: (r) => r.contribution.toFixed(6) },
                ]}
                caption="Estimate = (h/2) × Σ wᵢ f(xᵢ)."
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
          The <strong>Trapezoidal Rule</strong> is the simplest practical method for evaluating a
          definite integral numerically. Many integrals that arise in physics — the area under a
          measured spectrum, the work done by a tabulated force, the total charge from a current
          profile — have no closed-form antiderivative, or the integrand is known only at discrete
          data points. In these cases we approximate the integral numerically.
        </p>
        <p>
          The idea is geometric: instead of finding the exact area under the curve <MathTeX tex="y=f(x)" />,
          we slice <MathTeX tex="[a,b]" /> into <MathTeX tex="n" /> strips and replace the curve over each
          strip by a straight line, turning each strip into a <strong>trapezium</strong> whose area we
          can compute exactly. Summing the trapezia gives the estimate.
        </p>
        <Callout tone="info" title="Why it matters">
          It requires only function values (no derivatives), works on raw experimental data, and is the
          conceptual foundation for the more accurate Simpson and Romberg rules.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Numerical integration is ubiquitous in experimental and high-energy physics:</p>
        <ul>
          <li><strong>Particle spectra integration:</strong> integrating a transverse-momentum spectrum <MathTeX tex="dN/dp_T" /> to obtain the total yield.</li>
          <li><strong>Total multiplicity:</strong> integrating <MathTeX tex="dN/d\eta" /> over pseudorapidity to count produced particles.</li>
          <li><strong>Flow coefficient averaging:</strong> <MathTeX tex="p_T" />-weighted integrals of <MathTeX tex="v_2(p_T)" /> to get <MathTeX tex="\langle v_2\rangle" />.</li>
          <li><strong>Thermodynamics:</strong> entropy and energy density integrals over distribution functions.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>We wish to evaluate</p>
        <MathTeX block tex="I = \int_a^b f(x)\,dx." />
        <p>
          Divide <MathTeX tex="[a,b]" /> into <MathTeX tex="n" /> equal sub-intervals of width
          <MathTeX tex="\,h=\dfrac{b-a}{n}" />, with nodes <MathTeX tex="x_i = a + i h" />,
          <MathTeX tex="\,i=0,1,\dots,n" />. Over a single strip <MathTeX tex="[x_i, x_{i+1}]" /> we
          approximate <MathTeX tex="f" /> by the straight line joining the endpoints. The area of that
          trapezium is
        </p>
        <MathTeX block tex="\int_{x_i}^{x_{i+1}} f(x)\,dx \approx \frac{h}{2}\,\big[f(x_i)+f(x_{i+1})\big]." />
        <p>Summing over all strips and collecting repeated interior terms gives the <strong>composite trapezoidal rule</strong>:</p>
        <MathTeX block tex="I \approx \frac{h}{2}\Big[f(x_0) + 2\sum_{i=1}^{n-1} f(x_i) + f(x_n)\Big]." />
        <h3>Error term</h3>
        <p>
          Expanding <MathTeX tex="f" /> in a Taylor series on each strip, the local error is
          <MathTeX tex="\,-\frac{h^3}{12}f''(\xi)" />. Summing over <MathTeX tex="n" /> strips gives the
          global truncation error
        </p>
        <MathTeX block tex="E_T = -\frac{(b-a)h^2}{12}\,f''(\xi), \qquad \xi\in(a,b)." />
        <Callout tone="tip" title="Order of accuracy">
          The error scales as <MathTeX tex="h^2" />, so halving the step size cuts the error by a factor
          of four. The rule integrates linear functions <em>exactly</em> (since <MathTeX tex="f''=0" />).
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Very simple; needs only sampled values; robust on noisy/tabulated data; exact for linear integrands." },
          { label: "Limitations", value: "Only O(h²) accuracy; poor for strongly curved integrands; overestimates concave-down areas." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the function f(x), the limits a and b, and the number of intervals n." },
        { label: "Compute the step size h = (b − a) / n." },
        { label: "Initialise sum = f(a) + f(b) (the two end points)." },
        { label: "For i = 1 to n−1, add 2·f(a + i·h) to the sum." },
        { label: "Multiply the total by h/2 to obtain the integral estimate." },
        { label: "Report the result; optionally compare with the exact value and error." },
      ],
      pseudocode: `INPUT f, a, b, n
h ← (b − a) / n
sum ← f(a) + f(b)
FOR i ← 1 TO n−1 DO
    sum ← sum + 2 × f(a + i×h)
END FOR
I ← (h / 2) × sum
OUTPUT I`,
      flowchart: ["Start", "Read f, a, b, n", "h = (b−a)/n", "sum = f(a)+f(b)", "Loop i=1..n−1: sum += 2f(x_i)", "I = (h/2)·sum", "Output I", "Stop"],
    },
    simulator: <TrapezoidalSim />,
    cFilename: "trapezoidal.c",
    cCode: `/* Trapezoidal Rule — composite numerical integration
 * Compile: gcc trapezoidal.c -o trap -lm
 */
#include <stdio.h>
#include <math.h>

/* Integrand: change this to integrate a different function */
double f(double x) {
    return exp(-x * x);          /* example: e^(-x^2) */
}

int main(void) {
    double a, b, h, sum;
    int n, i;

    printf("Enter lower limit a, upper limit b: ");
    scanf("%lf %lf", &a, &b);
    printf("Enter number of intervals n: ");
    scanf("%d", &n);

    h = (b - a) / n;             /* step size */
    sum = f(a) + f(b);           /* end-point contributions */

    for (i = 1; i < n; i++)      /* interior points, weight 2 */
        sum += 2.0 * f(a + i * h);

    double integral = (h / 2.0) * sum;
    printf("Trapezoidal estimate = %.8lf\\n", integral);
    return 0;
}`,
    viva: [
      { q: "State the composite trapezoidal rule.", a: "I ≈ (h/2)[f(x₀) + 2(f(x₁)+…+f(x_{n-1})) + f(xₙ)], where h = (b−a)/n and xᵢ = a + ih." },
      { q: "What is the geometrical interpretation of the trapezoidal rule?", a: "The area under the curve in each sub-interval is approximated by the area of a trapezium formed by joining the two end ordinates with a straight line." },
      { q: "What is the order of the error in the trapezoidal rule?", a: "The global truncation error is O(h²); it is proportional to (b−a)h²f''(ξ)/12." },
      { q: "For which class of functions is the trapezoidal rule exact?", a: "Linear (first-degree) polynomials, because their second derivative is zero, making the error term vanish." },
      { q: "How does the error change if you double the number of intervals?", a: "Doubling n halves h, and since the error ∝ h², the error reduces by a factor of about 4." },
      { q: "Why is the weight of interior points 2 and of end points 1?", a: "Each interior node is shared by two adjacent trapezia so it is counted twice; the two extreme nodes belong to only one trapezium each." },
      { q: "What does the sign of the error tell you?", a: "Because E ∝ −f''(ξ), for a concave-up function (f''>0) the rule overestimates the integral, and for concave-down it underestimates." },
      { q: "Is the trapezoidal rule a Newton–Cotes formula?", a: "Yes — it is the closed Newton–Cotes formula of degree 1 (two points, straight-line fit)." },
      { q: "Can the trapezoidal rule be applied to tabulated data?", a: "Yes. It only needs the sampled values f(xᵢ) at equally spaced points; no analytic form is required." },
      { q: "What happens if the integrand is highly oscillatory?", a: "Accuracy degrades unless n is large enough to resolve the oscillations; otherwise the linear pieces miss the oscillations." },
      { q: "How is the step size h defined and why must the spacing be uniform here?", a: "h = (b−a)/n. The composite formula derived above assumes equal spacing; for unequal spacing each trapezium must be summed individually." },
      { q: "Compare the trapezoidal rule with Simpson's 1/3 rule.", a: "Simpson's rule fits parabolas and has O(h⁴) error, so it is far more accurate than the O(h²) trapezoidal rule for smooth functions." },
      { q: "What is Romberg integration?", a: "A systematic Richardson extrapolation of trapezoidal estimates at successively halved step sizes that rapidly cancels the leading error terms." },
      { q: "How would you estimate the error without knowing the exact value?", a: "Compute the estimate for n and 2n intervals; the difference (scaled) approximates the error, since the error ∝ h²." },
      { q: "Why might one prefer the trapezoidal rule despite its lower accuracy?", a: "It is simple, numerically stable, robust on noisy experimental data, and the natural choice when only discrete measurements are available." },
    ],
    problems: [
      { level: "Easy", text: "Evaluate ∫₀¹ x² dx with n = 4 using the trapezoidal rule and compare with the exact value 1/3.", hint: "h = 0.25; nodes at 0, 0.25, 0.5, 0.75, 1." },
      { level: "Easy", text: "Use the rule with n = 6 to estimate ∫₀³ (x+1) dx and verify it is exact. Explain why.", hint: "The integrand is linear, so f''=0." },
      { level: "Easy", text: "Compute ∫₁² (1/x) dx with n = 5 and compare with ln 2 ≈ 0.6931.", hint: "Watch the rapid curvature near x = 1." },
      { level: "Medium", text: "Estimate ∫₀^π sin x dx with n = 4 and n = 8. By what factor does the error shrink?", hint: "Expect roughly a factor of 4." },
      { level: "Medium", text: "A force F(x) is tabulated at x = 0,1,2,3,4 m as 0, 3, 7, 8, 6 N. Find the work done using the trapezoidal rule.", hint: "Work = ∫F dx; h = 1." },
      { level: "Medium", text: "Determine the minimum n needed to evaluate ∫₀¹ e^x dx to within 10⁻⁴ using the error bound.", hint: "Use |E| ≤ (b−a)h²M/12 with M = max|f''|." },
      { level: "Medium", text: "Integrate a measured pT spectrum dN/dpT given at pT = 0.5,1.0,…,3.0 GeV to obtain the yield.", hint: "Apply the composite rule directly to the data." },
      { level: "Advanced", text: "Derive the error term E = −(b−a)h²f''(ξ)/12 from the single-strip Taylor expansion.", hint: "Integrate the remainder of the linear interpolant over one strip, then sum." },
      { level: "Advanced", text: "Combine T(h) and T(h/2) via Richardson extrapolation to obtain a higher-order estimate of ∫₀¹ e^{-x²} dx. Show it equals Simpson's 1/3 result.", hint: "(4T(h/2) − T(h))/3." },
      { level: "Advanced", text: "Write a C program that automatically doubles n until successive trapezoidal estimates agree to 10⁻⁶, and test it on ∫₀^{π/2} cos x dx.", hint: "Loop, comparing |I_{2n} − I_n|." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em>, McGraw-Hill — Ch. 21 (Newton–Cotes formulas).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em>, Cambridge — §4.1 (Classical formulas for equally spaced abscissas).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI — Numerical Integration.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em> — numerical integration techniques.</li>
        <li>R. H. Landau, M. J. Páez &amp; C. C. Bordeianu, <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

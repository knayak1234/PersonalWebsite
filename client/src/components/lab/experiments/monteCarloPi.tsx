import { useMemo, useState } from "react";
import { monteCarloPi } from "@/lib/lab/numerics";
import { NumberField } from "@/components/lab/ParamControl";
import { SliderField } from "@/components/lab/ParamControl";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { ScatterFigure, LineFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function MonteCarloPiSim() {
  const [nPow, setNPow] = useState(3); // 10^3
  const [run, setRun] = useState(0);
  const n = Math.pow(10, nPow);

  const result = useMemo(() => monteCarloPi(n), [run, n]);

  const inside = result.points.filter((p) => p.inside).map((p) => ({ x: p.x, y: p.y }));
  const outside = result.points.filter((p) => !p.inside).map((p) => ({ x: p.x, y: p.y }));

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setNPow(3); setRun((r) => r + 1); }}
      runLabel="Throw darts"
      controls={
        <>
          <SliderField label="Number of points (10ⁿ)" value={nPow} onChange={setNPow} min={2} max={6} step={1} suffix={` → ${n.toLocaleString()}`} />
          <Callout tone="info">Each press scatters new random points and re-estimates π.</Callout>
        </>
      }
      output={
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Estimated π" value={result.estimate.toFixed(6)} />
            <StatTile label="True π" value={Math.PI.toFixed(6)} accent="text-emerald-600" />
            <StatTile label="Absolute error" value={Math.abs(Math.PI - result.estimate).toExponential(2)} accent="text-rose-600" />
            <StatTile label="Inside / Total" value={`${result.inside}/${result.total}`} accent="text-amber-600" />
          </div>

          <OutputBlock title="Visualization — random points in the unit square">
            <div className="max-w-md mx-auto">
              <ScatterFigure
                square
                height={360}
                xLabel="x" yLabel="y"
                groups={[
                  { name: "Inside circle", data: inside, color: "#16a34a" },
                  { name: "Outside circle", data: outside, color: "#dc2626" },
                ]}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Fraction of points landing inside the quarter circle ≈ area ratio = π/4. (Up to 4000 points shown.)
            </p>
          </OutputBlock>

          <OutputBlock title="Numerical results — convergence">
            <LineFigure
              height={280}
              xKey="n"
              xLabel="Number of points"
              yLabel="π estimate"
              refY={Math.PI}
              series={[{ name: "Running estimate of π", data: result.convergence, color: "#7c3aed", dataKey: "estimate" }]}
            />
            <p className="text-xs text-muted-foreground mt-2">
              The estimate fluctuates around the dashed line (true π) and the error shrinks as 1/√N —
              the hallmark of Monte Carlo convergence.
            </p>
          </OutputBlock>
        </>
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
          <strong>Monte Carlo</strong> methods estimate quantities using random sampling. Estimating
          <MathTeX tex="\,\pi" /> by "throwing darts" at a square is the classic first example: it shows
          how randomness can compute a deterministic number, and how the accuracy improves with the
          number of samples.
        </p>
        <p>
          The same principle scales to integrals in hundreds of dimensions that no grid-based rule can
          touch — which is exactly why Monte Carlo is the backbone of event generators and detector
          simulations in particle physics.
        </p>
        <Callout tone="info" title="The idea in one line">
          Scatter points uniformly in a unit square; the fraction landing inside the quarter circle
          approximates the area ratio <MathTeX tex="\pi/4" />.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Monte Carlo sampling is everywhere in high-energy and statistical physics:</p>
        <ul>
          <li><strong>Event generation:</strong> PYTHIA, HIJING and AMPT generate collision events by sampling distributions.</li>
          <li><strong>Particle production simulation:</strong> sampling momenta from thermal/blast-wave spectra.</li>
          <li><strong>Detector simulation:</strong> GEANT propagates particles through matter via random interactions.</li>
          <li><strong>High-dimensional integration:</strong> phase-space and path integrals where grid methods fail.</li>
          <li><strong>Statistical mechanics:</strong> the Metropolis algorithm for the Ising model and lattice QCD.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Consider a unit square <MathTeX tex="[0,1]\times[0,1]" /> and the quarter disc
          <MathTeX tex="\,x^2+y^2\le 1" /> inside it. Their areas are
        </p>
        <MathTeX block tex="A_{\text{square}} = 1, \qquad A_{\text{quarter circle}} = \frac{\pi}{4}." />
        <p>
          If we drop <MathTeX tex="N" /> points uniformly at random in the square and
          <MathTeX tex="\,N_{\text{in}}" /> fall inside the circle, then by the law of large numbers
        </p>
        <MathTeX block tex="\frac{N_{\text{in}}}{N} \;\longrightarrow\; \frac{\pi/4}{1} \quad\Rightarrow\quad \pi \approx 4\,\frac{N_{\text{in}}}{N}." />
        <h3>Monte Carlo integration</h3>
        <p>
          More generally, <MathTeX tex="\int_0^1 g(x)\,dx \approx \frac{1}{N}\sum_{i=1}^N g(x_i)" /> for
          uniform samples <MathTeX tex="x_i" />. The π estimate is the special case
          <MathTeX tex="\,g = \mathbb{1}[x^2+y^2\le 1]" />.
        </p>
        <h3>Error and convergence</h3>
        <p>
          The statistical error of a Monte Carlo estimate decreases as
        </p>
        <MathTeX block tex="\sigma_{\text{MC}} \;\propto\; \frac{1}{\sqrt{N}}." />
        <Callout tone="tip" title="Why √N matters">
          To gain one extra decimal digit of accuracy you need <strong>100×</strong> more points. Monte
          Carlo is slow in 1-D, but its <MathTeX tex="1/\sqrt{N}" /> rate is <em>independent of dimension</em>,
          which is why it wins in high-dimensional problems.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Trivially simple; dimension-independent error; ideal for complex domains and high-dimensional integrals." },
          { label: "Limitations", value: "Slow 1/√N convergence; results are stochastic (vary run to run); needs a good random number generator." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Set the number of samples N and a counter N_in = 0." },
        { label: "Repeat N times: draw x and y uniformly in [0,1)." },
        { label: "If x² + y² ≤ 1, the point is inside the quarter circle: increment N_in." },
        { label: "After all samples, estimate π ≈ 4 · N_in / N." },
        { label: "Optionally track the running estimate to study convergence." },
      ],
      pseudocode: `INPUT N
count ← 0
FOR i ← 1 TO N DO
    x ← random(0,1)
    y ← random(0,1)
    IF x*x + y*y ≤ 1 THEN count ← count + 1
END FOR
pi ← 4 × count / N
OUTPUT pi`,
      flowchart: ["Start", "Read N, count = 0", "Sample (x,y) in [0,1)^2", "x^2+y^2 ≤ 1 ? count++", "Repeat N times", "π = 4·count/N", "Output π", "Stop"],
    },
    simulator: <MonteCarloPiSim />,
    cFilename: "monte_carlo_pi.c",
    cCode: `/* Monte Carlo estimation of PI
 * Compile: gcc monte_carlo_pi.c -o mcpi
 */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void) {
    long n, i, count = 0;
    double x, y;

    printf("Enter number of random points N: ");
    scanf("%ld", &n);

    srand((unsigned) time(NULL));   /* seed the generator */

    for (i = 0; i < n; i++) {
        x = (double) rand() / RAND_MAX;   /* x in [0,1] */
        y = (double) rand() / RAND_MAX;   /* y in [0,1] */
        if (x * x + y * y <= 1.0)         /* inside quarter circle */
            count++;
    }

    double pi = 4.0 * (double) count / (double) n;
    printf("Estimated PI = %.6lf  (using %ld points)\\n", pi, n);
    return 0;
}`,
    viva: [
      { q: "What is a Monte Carlo method?", a: "A computational technique that uses repeated random sampling to obtain numerical results, especially for integration and simulation." },
      { q: "How is π estimated by Monte Carlo?", a: "By sampling points uniformly in a unit square and computing 4 × (fraction inside the quarter circle), which approximates 4 × (π/4) = π." },
      { q: "Why does the ratio of points give π/4?", a: "Because the probability a uniform point lands inside the quarter circle equals the area ratio (π/4)/1 = π/4." },
      { q: "How does the Monte Carlo error scale with N?", a: "As 1/√N — the standard error decreases proportionally to the inverse square root of the number of samples." },
      { q: "How many more points are needed for one more decimal of accuracy?", a: "About 100× more, since error ∝ 1/√N." },
      { q: "What is the key advantage of Monte Carlo for high-dimensional integrals?", a: "Its error rate 1/√N is independent of the number of dimensions, unlike grid methods whose cost grows exponentially." },
      { q: "Why do successive runs give different answers?", a: "Because the method is stochastic; different random samples produce slightly different estimates (statistical fluctuation)." },
      { q: "What property must the random number generator have?", a: "It should produce uniformly distributed, statistically independent numbers with a long period." },
      { q: "What is 'variance reduction'?", a: "Techniques (importance sampling, stratified sampling, antithetic variates, control variates) that lower the variance for the same N, improving accuracy." },
      { q: "Define importance sampling.", a: "Sampling from a distribution that concentrates points where the integrand is large, then reweighting, to reduce variance." },
      { q: "How would you simulate a non-uniform distribution from uniform randoms?", a: "Use inverse-transform sampling (apply the inverse CDF) or acceptance–rejection sampling." },
      { q: "What is the law of large numbers' role here?", a: "It guarantees the sample average converges to the true expected value (π/4) as N → ∞." },
      { q: "Give the general Monte Carlo integration formula.", a: "∫ g dx over a domain of volume V ≈ (V/N) Σ g(xᵢ) for uniform samples xᵢ." },
      { q: "Name a physics code that relies on Monte Carlo.", a: "GEANT (detector simulation), PYTHIA/HIJING/AMPT (event generators), or Metropolis Monte Carlo for the Ising model." },
      { q: "How can you estimate the uncertainty of your π estimate?", a: "From the binomial standard error: σ ≈ 4√(p(1−p)/N) with p = N_{in}/N, or by repeating runs and taking the spread." },
    ],
    problems: [
      { level: "Easy", text: "Estimate π with N = 100, 1000 and 10000 points and tabulate the error. Does it shrink like 1/√N?", hint: "Compare error ratios with √10 ≈ 3.16." },
      { level: "Easy", text: "Modify the idea to estimate the area of a quarter ellipse x²/a² + y²/b² ≤ 1.", hint: "Count points satisfying the ellipse inequality." },
      { level: "Easy", text: "Use Monte Carlo to estimate ∫₀¹ x² dx and compare with 1/3.", hint: "Average x² over uniform samples." },
      { level: "Medium", text: "Estimate ∫₀¹ e^{−x²} dx by Monte Carlo and compare with Simpson's rule at similar cost.", hint: "Average e^{−x²} over N uniform x." },
      { level: "Medium", text: "Empirically verify the 1/√N error law by plotting log(error) vs log(N).", hint: "Expect slope ≈ −1/2." },
      { level: "Medium", text: "Implement antithetic variates (use x and 1−x) and show the variance drops.", hint: "Pair each sample with its mirror." },
      { level: "Medium", text: "Estimate the volume of a unit sphere in 3-D by sampling a cube.", hint: "Fraction inside × 8 = (4/3)π." },
      { level: "Advanced", text: "Use importance sampling to integrate ∫₀^∞ e^{−x} x² dx and compare variance with naive sampling.", hint: "Sample from the exponential distribution." },
      { level: "Advanced", text: "Write a Metropolis sampler for a 1-D Gaussian and verify the sampled mean and variance.", hint: "Accept moves with probability min(1, p_{new}/p_{old})." },
      { level: "Advanced", text: "Estimate a 5-dimensional integral by Monte Carlo and argue why grid methods are infeasible.", hint: "Grid cost ∝ m⁵ points." },
    ],
    references: (
      <ul>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — Ch. 7 (Random Numbers) &amp; §7.6 (Monte Carlo integration).</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em> — Monte Carlo methods.</li>
        <li>R. H. Landau, M. J. Páez &amp; C. C. Bordeianu, <em>Computational Physics</em> — Monte Carlo applications.</li>
        <li>M. E. J. Newman &amp; G. T. Barkema, <em>Monte Carlo Methods in Statistical Physics</em>.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

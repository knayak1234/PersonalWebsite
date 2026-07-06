import { useMemo, useState } from "react";
import { lcg } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { NumberField } from "@/components/lab/ParamControl";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure, ScatterFigure } from "@/components/lab/Charts";
import { Callout } from "@/components/lab/Content";
import MathTeX from "@/components/lab/MathTeX";
import { FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function LcgSim() {
  const [seed, setSeed] = useState("7");
  const [a, setA] = useState("1103515245");
  const [c, setC] = useState("12345");
  const [m, setM] = useState("32768");
  const [count, setCount] = useState("200");
  const [run, setRun] = useState(0);

  const seedN = parseInt(seed, 10), aN = parseInt(a, 10), cN = parseInt(c, 10);
  const mN = parseInt(m, 10), countN = parseInt(count, 10);

  const errors: Record<string, string> = {};
  if (!Number.isInteger(mN) || mN <= 1) errors.m = "Modulus m must be an integer > 1.";
  if (!Number.isInteger(aN) || aN <= 0) errors.a = "Multiplier a must be a positive integer.";
  if (!Number.isInteger(cN) || cN < 0) errors.c = "Increment c must be ≥ 0.";
  if (!Number.isInteger(seedN) || seedN < 0) errors.seed = "Seed must be ≥ 0.";
  if (!Number.isInteger(countN) || countN < 5 || countN > 5000) errors.count = "Generate 5–5000 numbers.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const res = lcg(seedN, aN, cN, mN, countN);
    const mean = res.normalized.reduce((s, v) => s + v, 0) / res.normalized.length;
    // chi-square-style uniformity over 10 bins
    const bins = new Array(10).fill(0);
    res.normalized.forEach((u) => { const b = Math.min(9, Math.floor(u * 10)); bins[b]++; });
    const expected = res.normalized.length / 10;
    const chi2 = bins.reduce((s, o) => s + (o - expected) ** 2 / expected, 0);
    const lag = res.normalized.slice(0, -1).map((u, i) => ({ x: u, y: res.normalized[i + 1] }));
    const seq = res.normalized.map((u, i) => ({ x: i + 1, u }));
    const rows = res.ints.map((xi, i) => ({ i: i + 1, xi, u: res.normalized[i] }));
    return { res, mean, bins, chi2, lag: lag.slice(0, 1500), seq: seq.slice(0, 400), rows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const fullPeriod = result && result.res.period >= mN;

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setSeed("7"); setA("1103515245"); setC("12345"); setM("32768"); setCount("200"); setRun((r) => r + 1); }}
      runLabel="Generate"
      controls={
        <>
          <NumberField label="Seed X₀" value={seed} onChange={setSeed} step="1" error={errors.seed} />
          <NumberField label="Multiplier a" value={a} onChange={setA} step="1" error={errors.a} />
          <NumberField label="Increment c" value={c} onChange={setC} step="1" error={errors.c} />
          <NumberField label="Modulus m" value={m} onChange={setM} step="1" error={errors.m}
            hint="Period ≤ m. Try a=5, c=3, m=16 to see a short period." />
          <NumberField label="How many numbers" value={count} onChange={setCount} step="1" error={errors.count} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Enter positive integer parameters.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Detected period" value={String(result.res.period)} />
              <StatTile label="Full period?" value={fullPeriod ? "Yes" : "No"} accent={fullPeriod ? "text-emerald-600" : "text-rose-600"} />
              <StatTile label="Mean of uₙ" value={result.mean.toFixed(4)} accent="text-amber-600" />
              <StatTile label="χ² (10 bins)" value={result.chi2.toFixed(2)} accent="text-violet-600" />
            </div>

            <OutputBlock title="Visualization — lag plot uₙ vs uₙ₊₁ (Marsaglia lattice)">
              <ScatterFigure
                height={300}
                square
                xLabel="uₙ"
                yLabel="uₙ₊₁"
                groups={[{ name: "Successive pairs", data: result.lag, color: "#a21caf" }]}
              />
              <p className="text-xs text-muted-foreground mt-2">
                A good generator scatters points evenly over the unit square. Poor choices of (a, c, m) make the
                points fall on a few parallel lines — the classic LCG lattice / hyperplane defect.
              </p>
            </OutputBlock>

            <OutputBlock title="Visualization — uniformity histogram (10 bins)">
              <LineFigure
                height={220}
                xKey="bin"
                xLabel="bin (0–1)"
                yLabel="count"
                series={[{
                  name: "Bin counts",
                  color: "#7c3aed",
                  dataKey: "count",
                  dot: true,
                  data: result.bins.map((cnt, i) => ({ bin: (i + 0.5) / 10, count: cnt })),
                }]}
                refY={result.res.normalized.length / 10}
              />
              <p className="text-xs text-muted-foreground mt-2">
                The dashed line marks the expected count per bin under perfect uniformity. Smaller χ² means a
                flatter, more uniform distribution.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — generated sequence">
              <LineFigure
                height={200}
                xKey="x"
                xLabel="index n"
                yLabel="uₙ"
                series={[{ name: "uₙ", color: "#c026d3", dataKey: "u", data: result.seq }]}
              />
              <div className="mt-4">
                <ResultsTable
                  rows={result.rows}
                  columns={[
                    { key: "i", header: "n" },
                    { key: "xi", header: "Xₙ (integer)" },
                    { key: "u", header: "uₙ = Xₙ / m", render: (r) => r.u.toFixed(6) },
                  ]}
                  caption="Integer state Xₙ from the recurrence and its normalised value uₙ ∈ [0,1)."
                />
              </div>
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
          A <strong>Linear Congruential Generator (LCG)</strong> is the classic algorithm for producing
          <em> pseudo-random</em> numbers. From a single integer seed it generates a deterministic sequence that
          <em> looks</em> random and is uniformly spread over <MathTeX tex="[0,1)" /> after normalising.
        </p>
        <p>
          Monte Carlo physics — particle production, detector simulation, statistical sampling — relies on
          fast, reproducible streams of random numbers. The LCG, despite its simplicity, illustrates every key
          idea: <strong>period</strong>, <strong>uniformity</strong>, and the <strong>correlation defects</strong>
          {" "}that better generators are designed to avoid.
        </p>
        <Callout tone="info" title="Deterministic yet random-looking">
          The same seed always reproduces the same sequence — essential for debugging simulations — yet the
          values pass many tests of randomness when the parameters are chosen well.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Pseudo-random numbers are the engine of computational physics:</p>
        <ul>
          <li><strong>Monte Carlo integration:</strong> estimating high-dimensional integrals and cross-sections.</li>
          <li><strong>Event generators:</strong> sampling particle momenta, decay angles, and collision vertices.</li>
          <li><strong>Detector simulation:</strong> modelling stochastic energy loss, noise, and efficiencies.</li>
          <li><strong>Statistical mechanics:</strong> Metropolis sampling in Ising and lattice models.</li>
          <li><strong>Error / resampling studies:</strong> bootstrap and toy-Monte-Carlo uncertainty estimation.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>The LCG is defined by the recurrence</p>
        <MathTeX block tex="X_{n+1} = (a\,X_n + c) \bmod m, \qquad u_n = \frac{X_n}{m}," />
        <p>
          where <MathTeX tex="m" /> is the <strong>modulus</strong>, <MathTeX tex="a" /> the
          <strong> multiplier</strong>, <MathTeX tex="c" /> the <strong>increment</strong>, and
          <MathTeX tex="\,X_0" /> the <strong>seed</strong>. Normalising by <MathTeX tex="m" /> maps the integer
          state onto <MathTeX tex="[0,1)" />.
        </p>
        <h3>Period</h3>
        <p>
          Because each state is an integer in <MathTeX tex="\{0,\dots,m-1\}" />, the sequence must repeat after
          at most <MathTeX tex="m" /> steps. The <strong>Hull–Dobell theorem</strong> guarantees the maximal
          period <MathTeX tex="m" /> (for <MathTeX tex="c\neq 0" />) iff:
        </p>
        <MathTeX block tex="\gcd(c,m)=1,\quad a\equiv 1 \,(\text{mod } p)\ \forall\ \text{prime } p\,|\,m,\quad a\equiv 1\,(\text{mod }4)\ \text{if } 4\,|\,m." />
        <h3>Quality &amp; defects</h3>
        <p>
          Even a full-period LCG can be a poor generator: successive tuples
          <MathTeX tex="\,(u_n,u_{n+1})" /> lie on a limited number of parallel hyperplanes (the
          <strong> Marsaglia effect</strong>). The lag plot in the lab makes this lattice structure visible, and
          a <MathTeX tex="\chi^2" /> test checks uniformity across bins.
        </p>
        <Callout tone="warn" title="Don't use a toy LCG for serious work">
          Production simulations use generators like Mersenne Twister or PCG. The LCG is studied to understand
          <em> why</em> those exist — its short period and correlations are exactly the failures they fix.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Extremely fast; tiny state; trivially reproducible; ideal for teaching the concepts of period and uniformity." },
          { label: "Limitations", value: "Short period for small m; serial correlations (hyperplanes); low-order bits very non-random; unsuitable for high-dimensional Monte Carlo." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Choose parameters: modulus m, multiplier a, increment c, and seed X₀." },
        { label: "Apply the recurrence Xₙ₊₁ = (a·Xₙ + c) mod m." },
        { label: "Normalise uₙ = Xₙ / m to obtain a value in [0, 1)." },
        { label: "Repeat to generate as many numbers as required." },
        { label: "Detect the period by finding the first repeated state." },
        { label: "Test quality: uniformity (histogram / χ²) and correlation (lag plot)." },
      ],
      pseudocode: `INPUT a, c, m, X_0, count
X ← X_0
FOR n = 1 TO count DO
    X ← (a * X + c) mod m
    u ← X / m            // normalise to [0,1)
    OUTPUT X, u
END FOR
/* period = distance between first repeated states */`,
      flowchart: ["Start", "Read a, c, m, X_0, count", "X = (a·X + c) mod m", "u = X / m", "Output X, u", "n < count ?", "Report period", "Stop"],
    },
    simulator: <LcgSim />,
    cFilename: "lcg.c",
    cCode: `/* Linear Congruential Generator  X_{n+1} = (a*X + c) mod m
 * Compile: gcc lcg.c -o lcg
 */
#include <stdio.h>

int main(void) {
    long a, c, m, x;
    int count, n;

    printf("Enter a, c, m: ");
    scanf("%ld %ld %ld", &a, &c, &m);
    printf("Enter seed X0 and how many numbers: ");
    scanf("%ld %d", &x, &count);

    printf("   n        X_n        u_n\\n");
    for (n = 1; n <= count; n++) {
        x = (a * x + c) % m;
        printf("%4d  %10ld  %.6f\\n", n, x, (double)x / m);
    }
    return 0;
}`,
    viva: [
      { q: "Write the LCG recurrence.", a: "Xₙ₊₁ = (a·Xₙ + c) mod m, normalised as uₙ = Xₙ/m ∈ [0,1)." },
      { q: "What do a, c, m and X₀ represent?", a: "a = multiplier, c = increment, m = modulus, X₀ = seed (initial value)." },
      { q: "Why are the numbers called pseudo-random?", a: "They are produced by a deterministic formula; the same seed reproduces the exact sequence, yet they appear random." },
      { q: "What is the maximum possible period of an LCG?", a: "m — there are only m distinct integer states, so the sequence must repeat within m steps." },
      { q: "State the Hull–Dobell conditions for full period.", a: "gcd(c,m)=1; a−1 divisible by every prime factor of m; a−1 divisible by 4 if m is divisible by 4." },
      { q: "What is a multiplicative congruential generator?", a: "An LCG with c = 0: Xₙ₊₁ = a·Xₙ mod m; it cannot produce 0 and has period ≤ m−1." },
      { q: "What is the Marsaglia (hyperplane) effect?", a: "Tuples of successive LCG outputs lie on a limited number of parallel hyperplanes — a serial-correlation defect." },
      { q: "How can you visualise LCG correlations?", a: "Plot uₙ versus uₙ₊₁ (a lag plot); poor generators show points on a few parallel lines instead of a filled square." },
      { q: "How is uniformity of the output tested?", a: "Bin the values and apply a χ² goodness-of-fit test against the uniform distribution; smaller χ² ≈ more uniform." },
      { q: "Why are the low-order bits of an LCG unreliable?", a: "When m is a power of two, the least-significant bits have very short periods and strong patterns." },
      { q: "Why choose m as a large prime or power of two?", a: "A power of two makes the mod operation a fast bit-mask; a prime modulus avoids short low-bit cycles." },
      { q: "What is the role of the seed?", a: "It selects the starting point in the cycle; fixing it makes simulations reproducible." },
      { q: "Name better modern generators and why they're used.", a: "Mersenne Twister and PCG — far longer periods and no LCG-style hyperplane correlations." },
      { q: "Give a physics use of pseudo-random numbers.", a: "Monte Carlo event generation, detector simulation, and Metropolis sampling in statistical mechanics." },
      { q: "How is the period detected numerically?", a: "Iterate and record each state; the period is the gap between the first state and its first repetition." },
    ],
    problems: [
      { level: "Easy", text: "Generate 16 numbers with a=5, c=3, m=16, X₀=7 and find the period by hand.", hint: "Look for the first repeated state." },
      { level: "Easy", text: "Show that a=2, c=0, m=10 gives a very short, poor sequence.", hint: "Multiplicative LCG with even m degenerates quickly." },
      { level: "Easy", text: "Compute the first five uₙ for a=1103515245, c=12345, m=2³¹.", hint: "This is the classic glibc-style choice." },
      { level: "Medium", text: "Verify the Hull–Dobell conditions for a=5, c=3, m=16 and confirm full period 16.", hint: "Check gcd(3,16), a−1=4 divisible by 2 and 4." },
      { level: "Medium", text: "Plot uₙ vs uₙ₊₁ for a=137, c=187, m=256 and describe the lattice.", hint: "Count the parallel lines." },
      { level: "Medium", text: "Run a χ² uniformity test (10 bins) on 1000 LCG outputs and interpret the value.", hint: "Compare to χ² critical value for 9 d.o.f." },
      { level: "Medium", text: "Estimate the mean and variance of uₙ and compare with 1/2 and 1/12.", hint: "Uniform[0,1) has mean 0.5, variance 1/12." },
      { level: "Advanced", text: "Use an LCG stream to Monte Carlo estimate π and study how a short period limits accuracy.", hint: "Repeats cap the effective sample size." },
      { level: "Advanced", text: "Compare two seeds and show the sequences are shifts of the same cycle for a full-period LCG.", hint: "Same cycle, different entry point." },
      { level: "Advanced", text: "Demonstrate the low-bit defect: show that Xₙ mod 2 alternates for a power-of-two modulus.", hint: "Inspect the least-significant bit." },
    ],
    references: (
      <ul>
        <li>D. E. Knuth, <em>The Art of Computer Programming, Vol. 2 — Seminumerical Algorithms</em> (random numbers).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §7.1 (uniform deviates).</li>
        <li>G. Marsaglia, "Random numbers fall mainly in the planes," <em>PNAS</em> 61 (1968).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH — Monte Carlo methods.</li>
      </ul>
    ),
  };
}

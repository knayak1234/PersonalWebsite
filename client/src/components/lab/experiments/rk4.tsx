import ODESimShared from "./ODESimShared";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

export default function build(meta: ExperimentMeta, prev?: any, next?: any): ExperimentContent {
  return {
    meta,
    prev: prev && { id: prev.id, name: prev.name },
    next: next && { id: next.id, name: next.name },
    intro: (
      <>
        <p>
          The <strong>fourth-order Runge–Kutta method (RK4)</strong> is the workhorse ODE solver of
          computational physics. It evaluates the slope <MathTeX tex="f(x,y)" /> four times per step — at the
          beginning, twice at the midpoint, and at the end — then combines them with carefully chosen weights to
          cancel error terms up to <MathTeX tex="O(h^4)" />.
        </p>
        <p>
          RK4 hits a sweet spot between accuracy and cost: with the same step size it is dramatically more
          accurate than Euler or RK2, yet it remains explicit and self-starting (no derivatives, no history).
        </p>
        <Callout tone="tip" title="Why RK4 is everywhere">
          A single RK4 step achieves what would take thousands of Euler steps. It is the default for orbital
          mechanics, molecular dynamics warm-ups, and almost any smooth non-stiff ODE.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>RK4 is the default integrator across physics:</p>
        <ul>
          <li><strong>Orbital mechanics:</strong> integrating planetary and satellite trajectories.</li>
          <li><strong>Hydrodynamic evolution:</strong> time-stepping fluid and relativistic flow equations.</li>
          <li><strong>Transport equations:</strong> Boltzmann-type and parton transport in heavy-ion collisions.</li>
          <li><strong>Coupled oscillators &amp; circuits:</strong> nonlinear dynamics and driven systems.</li>
          <li><strong>Quantum dynamics:</strong> time-dependent Schrödinger evolution after spatial discretisation.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          RK4 builds the next value from a weighted average of four slope estimates. For
          <MathTeX tex="\,y' = f(x,y)" />:
        </p>
        <MathTeX block tex="k_1 = f(x_n,\,y_n)" />
        <MathTeX block tex="k_2 = f\!\left(x_n + \tfrac{h}{2},\; y_n + \tfrac{h}{2}k_1\right)" />
        <MathTeX block tex="k_3 = f\!\left(x_n + \tfrac{h}{2},\; y_n + \tfrac{h}{2}k_2\right)" />
        <MathTeX block tex="k_4 = f\!\left(x_n + h,\; y_n + h\,k_3\right)" />
        <p>and combines them with Simpson-like weights:</p>
        <MathTeX block tex="\boxed{\,y_{n+1} = y_n + \frac{h}{6}\big(k_1 + 2k_2 + 2k_3 + k_4\big)\,}" />
        <h3>Error &amp; order</h3>
        <p>
          The weights <MathTeX tex="(1,2,2,1)/6" /> are chosen so the Taylor expansion of <MathTeX tex="y_{n+1}" />
          matches the true solution through <MathTeX tex="h^4" />. The <strong>local truncation error</strong> is
          <MathTeX tex="\,O(h^5)" /> and the <strong>global error</strong> is <MathTeX tex="O(h^4)" /> — halving
          <MathTeX tex="\,h" /> cuts the error by a factor of <strong>16</strong>.
        </p>
        <Callout tone="info" title="Cost vs. accuracy">
          RK4 costs four <MathTeX tex="f" />-evaluations per step versus one for Euler, but its error falls as
          <MathTeX tex="\,h^4" /> instead of <MathTeX tex="h" />. Per digit of accuracy it is far cheaper for
          smooth problems.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Fourth-order accuracy; explicit & self-starting; excellent accuracy/cost balance; no derivatives of f needed." },
          { label: "Limitations", value: "Four f-evaluations per step; fixed-step RK4 wastes effort on smooth regions (use adaptive RK45); still poor for stiff ODEs." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Set initial point (x₀, y₀), step size h and the end point." },
        { label: "Compute k₁ = f(xₙ, yₙ)." },
        { label: "Compute k₂ = f(xₙ + h/2, yₙ + (h/2)k₁)." },
        { label: "Compute k₃ = f(xₙ + h/2, yₙ + (h/2)k₂)." },
        { label: "Compute k₄ = f(xₙ + h, yₙ + h·k₃)." },
        { label: "Update yₙ₊₁ = yₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄), advance x, and repeat." },
      ],
      pseudocode: `INPUT f, x_0, y_0, h, x_{end}
x ← x_0;  y ← y_0
WHILE x < x_{end} DO
    k_1 ← f(x, y)
    k_2 ← f(x + h/2, y + h/2 * k_1)
    k_3 ← f(x + h/2, y + h/2 * k_2)
    k_4 ← f(x + h,   y + h   * k_3)
    y ← y + (h/6) * (k_1 + 2*k_2 + 2*k_3 + k_4)
    x ← x + h
    PRINT x, y
END WHILE`,
      flowchart: ["Start", "Read f, x_0, y_0, h, x_{end}", "k_1..k_4 slope estimates", "y = y + h/6·(k_1+2k_2+2k_3+k_4)", "x = x + h", "x < x_{end} ?", "Output (x, y)", "Stop"],
    },
    simulator: <ODESimShared method="rk4" />,
    cFilename: "rk4.c",
    cCode: `/* Runge-Kutta 4th order (RK4) ODE solver  y' = f(x,y)
 * Compile: gcc rk4.c -o rk4 -lm
 */
#include <stdio.h>
#include <math.h>

/* example: dy/dx = y, exact solution y = e^x */
double f(double x, double y) { return y; }

int main(void) {
    double x, y, h, xend, k1, k2, k3, k4;

    printf("Enter x0, y0: ");
    scanf("%lf %lf", &x, &y);
    printf("Enter step size h and end x: ");
    scanf("%lf %lf", &h, &xend);

    printf("   x         y(RK4)        y(exact)\\n");
    printf("%6.3lf  %12.8lf  %12.8lf\\n", x, y, exp(x));

    while (x < xend - 1e-12) {
        k1 = f(x, y);
        k2 = f(x + h/2.0, y + h/2.0 * k1);
        k3 = f(x + h/2.0, y + h/2.0 * k2);
        k4 = f(x + h,     y + h     * k3);
        y = y + (h/6.0) * (k1 + 2*k2 + 2*k3 + k4);   /* RK4 update */
        x = x + h;
        printf("%6.3lf  %12.8lf  %12.8lf\\n", x, y, exp(x));
    }
    return 0;
}`,
    viva: [
      { q: "What is the order of accuracy of RK4?", a: "Fourth order: global error O(h⁴), local truncation error O(h⁵)." },
      { q: "How many slope evaluations does each RK4 step require?", a: "Four — k₁, k₂, k₃, k₄." },
      { q: "Write the RK4 update formula.", a: "yₙ₊₁ = yₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)." },
      { q: "Where are the four slopes evaluated?", a: "k₁ at the start, k₂ and k₃ at the midpoint (using k₁ and k₂ respectively), k₄ at the end of the interval." },
      { q: "Why are the weights 1, 2, 2, 1 over 6?", a: "They are chosen so the Taylor expansion of the update matches the exact solution through the h⁴ term (a Simpson-like quadrature of the slope)." },
      { q: "How does halving the step size affect RK4's error?", a: "It reduces the global error by a factor of 2⁴ = 16." },
      { q: "Compare RK4 with Euler in accuracy and cost.", a: "RK4 costs 4 evaluations/step but is O(h⁴); Euler costs 1 but is O(h). RK4 is far cheaper per digit of accuracy for smooth ODEs." },
      { q: "Is RK4 explicit or implicit?", a: "Explicit — each stage uses only already-computed quantities, and it is self-starting." },
      { q: "What is the connection between RK4 and Simpson's rule?", a: "For f independent of y, the RK4 update reduces exactly to Simpson's 1/3 rule for ∫f dx." },
      { q: "When is RK4 a poor choice?", a: "For stiff equations (its stability region is limited) — implicit methods are preferred there." },
      { q: "What is adaptive RK (RK45 / Runge–Kutta–Fehlberg)?", a: "It compares 4th- and 5th-order estimates to control the local error and adjust h automatically." },
      { q: "How is a system of ODEs handled with RK4?", a: "Apply the same formulas component-wise to the vector y, computing vector slopes k₁…k₄." },
      { q: "How do you solve a second-order ODE with RK4?", a: "Convert it to two coupled first-order equations (y′ = v, v′ = …) and integrate both simultaneously." },
      { q: "Does RK4 conserve energy in Hamiltonian systems?", a: "Not exactly — it is not symplectic, so energy slowly drifts over very long integrations; symplectic integrators are used for that." },
      { q: "Give a physics application of RK4.", a: "Integrating planetary orbits, projectile motion with drag, or the time-dependent equations of hydrodynamic evolution." },
    ],
    problems: [
      { level: "Easy", text: "Solve dy/dx = y, y(0) = 1 to x = 1 with h = 0.1 using RK4 and compare y(1) with e.", hint: "RK4 matches e to ~6 decimals." },
      { level: "Easy", text: "Integrate dy/dx = −2y, y(0) = 1 to x = 2 with h = 0.2 and compare with e^{−4}.", hint: "Error should be tiny." },
      { level: "Easy", text: "Solve dy/dx = x + y, y(0) = 1 to x = 1 with h = 0.25.", hint: "Exact: 2eˣ − x − 1." },
      { level: "Medium", text: "Verify the O(h⁴) order: halve h and check the error drops by ~16× for dy/dx = y.", hint: "Compute error at two step sizes." },
      { level: "Medium", text: "Compare Euler, RK2 and RK4 for dy/dx = x·y, y(0)=1 at x = 1 with h = 0.1.", hint: "Exact: e^{x²/2}." },
      { level: "Medium", text: "Integrate the SHM system y′ = v, v′ = −y from y(0)=1, v(0)=0 over one period and check amplitude.", hint: "Period 2π; RK4 conserves amplitude well." },
      { level: "Medium", text: "Solve projectile motion with linear drag (two coupled ODEs) and find the range.", hint: "vₓ′ = −kvₓ, v_y′ = −g − kv_y." },
      { level: "Advanced", text: "Show that for f independent of y, RK4 reduces to Simpson's 1/3 rule.", hint: "Set f = f(x) and simplify the k's." },
      { level: "Advanced", text: "Integrate the two-body Kepler problem with RK4 and observe slow energy drift over many orbits.", hint: "Compare with a symplectic leapfrog integrator." },
      { level: "Advanced", text: "Implement adaptive step control by comparing one full step with two half-steps (step-doubling).", hint: "Estimate local error ∝ (y_{full} − y_{half})/15." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 25 (Runge–Kutta).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §16.1–16.2 (RK4 &amp; adaptive stepsize).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. H. Landau, M. J. Páez &amp; C. C. Bordeianu, <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

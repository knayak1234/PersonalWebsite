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
          The <strong>second-order Runge–Kutta method (RK2)</strong> solves a first-order ordinary
          differential equation <MathTeX tex="\frac{dy}{dx}=f(x,y)" /> far more accurately than Euler at
          modest extra cost. Instead of trusting the slope at the start of the interval alone, RK2 samples the
          slope twice and combines the estimates — cancelling the leading Euler error term.
        </p>
        <p>
          RK2 is the simplest member of the Runge–Kutta family and the bridge between the intuitive Euler
          method and the workhorse <strong>RK4</strong>. Its predictor–corrector idea (predict with Euler,
          then correct using the slope at the predicted point) reappears throughout computational physics.
        </p>
        <Callout tone="info" title="Two slopes are better than one">
          Euler uses only <MathTeX tex="f(x_n,y_n)" />. RK2 also evaluates the slope at the far end (or
          midpoint) of the step and averages, achieving <strong>second-order</strong> accuracy.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>RK2 is widely used wherever a good accuracy/cost trade-off is needed:</p>
        <ul>
          <li><strong>Transport &amp; rate equations:</strong> decay chains, reaction kinetics in plasmas and astrophysics.</li>
          <li><strong>Newtonian dynamics:</strong> projectile and orbital motion reduced to first-order systems.</li>
          <li><strong>Circuit transients:</strong> RC / RL / RLC response with smooth driving terms.</li>
          <li><strong>Heat &amp; cooling:</strong> Newton's law of cooling and 1-D diffusion time-stepping.</li>
          <li><strong>Real-time / embedded solvers:</strong> where RK4's four evaluations per step are too costly.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          The exact increment over one step is the integral of the slope. RK2 approximates it by a weighted
          average of two slope samples. Writing the two stages as
        </p>
        <MathTeX block tex="k_1 = f(x_n,\,y_n), \qquad k_2 = f(x_n + h,\; y_n + h\,k_1)," />
        <p>the <strong>Heun (trapezoidal) RK2 update</strong> averages the two:</p>
        <MathTeX block tex="\boxed{\,y_{n+1} = y_n + \tfrac{h}{2}\,(k_1 + k_2)\,}, \qquad x_{n+1} = x_n + h." />
        <p>
          Here <MathTeX tex="k_1" /> is the Euler slope at the start and <MathTeX tex="k_2" /> is the slope at
          the Euler-predicted endpoint. Their average is the corrector — exactly the trapezoidal rule applied
          to <MathTeX tex="y' = f" />.
        </p>
        <h3>Midpoint variant</h3>
        <p>An equivalent second-order scheme evaluates the slope at the midpoint instead:</p>
        <MathTeX block tex="y_{n+1} = y_n + h\,f\!\left(x_n + \tfrac{h}{2},\; y_n + \tfrac{h}{2}k_1\right)." />
        <h3>Error</h3>
        <p>
          Matching the Taylor expansion of <MathTeX tex="y(x+h)" /> through the <MathTeX tex="h^2" /> term makes
          the <strong>local truncation error</strong> <MathTeX tex="O(h^3)" /> and the <strong>global error</strong>
          {" "}<MathTeX tex="O(h^2)" />. Halving <MathTeX tex="h" /> therefore cuts the error by roughly a factor
          of four, versus only a factor of two for Euler.
        </p>
        <Callout tone="tip" title="Cost vs accuracy">
          RK2 needs <strong>two</strong> function evaluations per step (Euler needs one, RK4 needs four) and is
          one order more accurate than Euler — often the sweet spot for smooth problems.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Second-order accurate; only two evaluations per step; cancels Euler's leading error; simple predictor–corrector structure." },
          { label: "Limitations", value: "Less accurate than RK4; still needs small h for stiff/oscillatory problems; not self-starting error control without step adaptation." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Set the initial point (x₀, y₀), step size h and the end point." },
        { label: "Compute k₁ = f(xₙ, yₙ) — the slope at the start of the interval." },
        { label: "Compute k₂ = f(xₙ + h, yₙ + h·k₁) — the slope at the Euler-predicted endpoint." },
        { label: "Update yₙ₊₁ = yₙ + (h/2)·(k₁ + k₂)." },
        { label: "Advance xₙ₊₁ = xₙ + h." },
        { label: "Repeat until x reaches the end point; optionally compare with the exact solution." },
      ],
      pseudocode: `INPUT f, x_0, y_0, h, x_{end}
x ← x_0;  y ← y_0
PRINT x, y
WHILE x < x_{end} DO
    k_1 ← f(x, y)
    k_2 ← f(x + h, y + h*k_1)
    y  ← y + (h/2)*(k_1 + k_2)   // RK2 (Heun) update
    x  ← x + h
    PRINT x, y
END WHILE`,
      flowchart: ["Start", "Read f, x_0, y_0, h, x_{end}", "k_1 = f(x,y)", "k_2 = f(x+h, y+h·k_1)", "y = y + (h/2)(k_1+k_2)", "x = x + h", "x < x_{end} ?", "Output (x, y)", "Stop"],
    },
    simulator: <ODESimShared method="rk2" />,
    cFilename: "rk2.c",
    cCode: `/* Runge-Kutta 2nd order (Heun) - first-order ODE  y' = f(x,y)
 * Compile: gcc rk2.c -o rk2 -lm
 */
#include <stdio.h>
#include <math.h>

/* example: dy/dx = y, exact solution y = e^x */
double f(double x, double y) { return y; }

int main(void) {
    double x, y, h, xend, k1, k2;

    printf("Enter x0, y0: ");
    scanf("%lf %lf", &x, &y);
    printf("Enter step size h and end x: ");
    scanf("%lf %lf", &h, &xend);

    printf("   x         y(RK2)        y(exact)\\n");
    printf("%6.3lf  %12.6lf  %12.6lf\\n", x, y, exp(x));

    while (x < xend - 1e-12) {
        k1 = f(x, y);
        k2 = f(x + h, y + h * k1);
        y  = y + (h / 2.0) * (k1 + k2);   /* RK2 update */
        x  = x + h;
        printf("%6.3lf  %12.6lf  %12.6lf\\n", x, y, exp(x));
    }
    return 0;
}`,
    viva: [
      { q: "What order of accuracy does RK2 have?", a: "Global error O(h²); local truncation error O(h³). It is a second-order method." },
      { q: "Write the Heun (trapezoidal) RK2 update.", a: "k₁ = f(xₙ,yₙ); k₂ = f(xₙ+h, yₙ+h·k₁); yₙ₊₁ = yₙ + (h/2)(k₁+k₂)." },
      { q: "How many function evaluations does RK2 use per step?", a: "Two — k₁ at the start and k₂ at the predicted endpoint." },
      { q: "Why is RK2 called a predictor–corrector method?", a: "Euler predicts the endpoint value (via k₁), then the slope there (k₂) corrects the estimate by averaging." },
      { q: "How does RK2 relate to the trapezoidal rule?", a: "Averaging the slopes at both ends is the trapezoidal quadrature applied to y′ = f(x,y)." },
      { q: "What is the midpoint method?", a: "An equivalent RK2 variant: yₙ₊₁ = yₙ + h·f(xₙ+h/2, yₙ+(h/2)k₁), using the slope at the midpoint." },
      { q: "How does RK2 compare with Euler in accuracy?", a: "RK2 is one order higher; halving h cuts RK2 error ~4× versus ~2× for Euler." },
      { q: "How does RK2 compare with RK4?", a: "RK4 is fourth-order (4 evaluations/step) and more accurate; RK2 (2 evaluations) is cheaper but less accurate." },
      { q: "Is RK2 explicit or implicit?", a: "Explicit — every stage is computed from already-known quantities." },
      { q: "From what is RK2 derived?", a: "By matching the Taylor expansion of y(x+h) up to the h² term using a weighted average of two slope samples." },
      { q: "Why average two slopes instead of using one?", a: "Averaging cancels the leading O(h²) Euler error, raising the order to two." },
      { q: "Can RK2 solve systems / higher-order ODEs?", a: "Yes — apply the same stages component-wise after reducing higher-order ODEs to first-order systems." },
      { q: "What limits RK2 for stiff problems?", a: "Its bounded stability region; stiff equations still demand very small h or an implicit method." },
      { q: "What are the general RK2 weights?", a: "yₙ₊₁ = yₙ + h(b₁k₁ + b₂k₂); Heun uses b₁=b₂=½, midpoint uses b₁=0, b₂=1." },
      { q: "Give a physics example suited to RK2.", a: "Projectile motion with drag, or a decaying RLC transient — smooth ODEs needing better-than-Euler accuracy cheaply." },
    ],
    problems: [
      { level: "Easy", text: "Solve dy/dx = y, y(0)=1 to x=1 with h=0.1 using RK2 and compare y(1) with e.", hint: "RK2 is far closer to e ≈ 2.71828 than Euler." },
      { level: "Easy", text: "Solve dy/dx = x + y, y(0)=1 to x=0.5 with h=0.1.", hint: "Exact: 2eˣ − x − 1." },
      { level: "Easy", text: "Solve dy/dx = −2y, y(0)=1 with h=0.1 and tabulate the error against e^{−2x}.", hint: "Error should fall ~4× when h halves." },
      { level: "Medium", text: "Numerically verify the O(h²) global error by halving h for dy/dx = y.", hint: "Error ratio ≈ 4." },
      { level: "Medium", text: "Compare RK2 (Heun) with the midpoint variant on dy/dx = x·y, y(0)=1.", hint: "Both are second-order; outputs nearly coincide." },
      { level: "Medium", text: "Solve Newton's cooling dT/dt = −0.07(T−25), T(0)=90 over 30 min with RK2.", hint: "Approaches 25 °C." },
      { level: "Medium", text: "Compare Euler, RK2 and RK4 errors at x=1 for dy/dx = y with the same h.", hint: "Errors scale h, h², h⁴." },
      { level: "Advanced", text: "Reduce SHM y″ + y = 0 to a first-order system and integrate with RK2; comment on energy conservation vs Euler.", hint: "RK2 drifts far less than Euler." },
      { level: "Advanced", text: "Apply RK2 to the stiff equation y′ = −50y, y(0)=1 and find the largest stable h.", hint: "Stability still restricts h despite higher order." },
      { level: "Advanced", text: "Integrate the logistic equation dy/dx = y(1−y), y(0)=0.1 with RK2 and locate the inflection.", hint: "Inflection at y = 0.5." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 25 (Runge–Kutta methods).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §16.1 (ODE integration).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em> — ODE integration.</li>
        <li>J. C. Butcher, <em>Numerical Methods for Ordinary Differential Equations</em>, Wiley.</li>
      </ul>
    ),
  };
}

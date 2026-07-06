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
          The <strong>Euler method</strong> is the simplest scheme for solving a first-order ordinary
          differential equation <MathTeX tex="\frac{dy}{dx}=f(x,y)" /> with an initial condition
          <MathTeX tex="\,y(x_0)=y_0" />. It steps forward along the tangent direction given by the slope
          <MathTeX tex="\,f(x,y)" />, taking small jumps of size <MathTeX tex="h" />.
        </p>
        <p>
          Almost every dynamical law in physics is a differential equation — Newton's second law, radioactive
          decay, circuit equations, population and reaction kinetics. Euler's method is the conceptual
          foundation on which all higher-order solvers (RK2, RK4, predictor–corrector) are built.
        </p>
        <Callout tone="info" title="Follow the slope">
          Euler approximates the curve by its tangent over each interval: knowing the slope
          <MathTeX tex="\,f(x_n,y_n)" /> at a point, it predicts the next value a step <MathTeX tex="h" /> away.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>First-order ODE solvers underpin much of computational physics:</p>
        <ul>
          <li><strong>Radioactive decay:</strong> <MathTeX tex="dN/dt = -\lambda N" /> and decay chains.</li>
          <li><strong>Newtonian dynamics:</strong> reducing <MathTeX tex="m\ddot x = F" /> to coupled first-order equations.</li>
          <li><strong>RC / RL circuits:</strong> charging and discharging transients.</li>
          <li><strong>Reaction &amp; transport kinetics:</strong> rate equations in plasmas and chemistry.</li>
          <li><strong>Population / cooling models:</strong> exponential growth and Newton's law of cooling.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Expand <MathTeX tex="y(x+h)" /> in a Taylor series about <MathTeX tex="x" /> and keep only the
          first-order term:
        </p>
        <MathTeX block tex="y(x+h) = y(x) + h\,y'(x) + \tfrac{1}{2}h^2 y''(\xi)." />
        <p>
          Dropping the <MathTeX tex="O(h^2)" /> remainder and using <MathTeX tex="y'=f(x,y)" /> gives the
          <strong> explicit Euler update</strong>:
        </p>
        <MathTeX block tex="\boxed{\,y_{n+1} = y_n + h\,f(x_n,\,y_n)\,}, \qquad x_{n+1} = x_n + h." />
        <h3>Error</h3>
        <p>
          The <strong>local truncation error</strong> per step is <MathTeX tex="O(h^2)" />; accumulated over
          <MathTeX tex="\,N = (x-x_0)/h" /> steps the <strong>global error</strong> is <MathTeX tex="O(h)" />.
          Euler is therefore a <strong>first-order</strong> method: halving <MathTeX tex="h" /> only halves the
          error.
        </p>
        <Callout tone="warn" title="Accuracy and stability">
          Because the error falls only linearly in <MathTeX tex="h" />, Euler needs very small steps for good
          accuracy. For stiff or oscillatory problems it can also become <em>unstable</em> unless
          <MathTeX tex="\,h" /> is tiny — motivating the higher-order Runge–Kutta methods.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Extremely simple; one function evaluation per step; intuitive; the basis of all ODE solvers." },
          { label: "Limitations", value: "Only first-order accurate; needs small h; poor stability for stiff/oscillatory ODEs; error accumulates quickly." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Set the initial point (x₀, y₀), step size h and the end point." },
        { label: "Evaluate the slope f(xₙ, yₙ) at the current point." },
        { label: "Update yₙ₊₁ = yₙ + h·f(xₙ, yₙ)." },
        { label: "Advance xₙ₊₁ = xₙ + h." },
        { label: "Repeat until x reaches the end point." },
        { label: "Optionally compare each yₙ with the exact solution to track the error." },
      ],
      pseudocode: `INPUT f, x_0, y_0, h, x_{end}
x ← x_0;  y ← y_0
PRINT x, y
WHILE x < x_{end} DO
    y ← y + h * f(x, y)      // Euler step
    x ← x + h
    PRINT x, y
END WHILE`,
      flowchart: ["Start", "Read f, x_0, y_0, h, x_{end}", "y = y + h·f(x,y)", "x = x + h", "x < x_{end} ?", "Output (x, y)", "Stop"],
    },
    simulator: <ODESimShared method="euler" />,
    cFilename: "euler.c",
    cCode: `/* Euler Method - first-order ODE solver  y' = f(x,y)
 * Compile: gcc euler.c -o euler -lm
 */
#include <stdio.h>
#include <math.h>

/* example: dy/dx = y, exact solution y = e^x */
double f(double x, double y) { return y; }

int main(void) {
    double x, y, h, xend;

    printf("Enter x0, y0: ");
    scanf("%lf %lf", &x, &y);
    printf("Enter step size h and end x: ");
    scanf("%lf %lf", &h, &xend);

    printf("   x         y(Euler)      y(exact)\\n");
    printf("%6.3lf  %12.6lf  %12.6lf\\n", x, y, exp(x));

    while (x < xend - 1e-12) {
        y = y + h * f(x, y);          /* Euler update */
        x = x + h;
        printf("%6.3lf  %12.6lf  %12.6lf\\n", x, y, exp(x));
    }
    return 0;
}`,
    viva: [
      { q: "What type of problem does the Euler method solve?", a: "A first-order initial-value ODE dy/dx = f(x,y) with y(x₀) = y₀." },
      { q: "Write the Euler update formula.", a: "yₙ₊₁ = yₙ + h·f(xₙ, yₙ), with xₙ₊₁ = xₙ + h." },
      { q: "From what is the Euler method derived?", a: "From truncating the Taylor expansion of y(x+h) after the first-order term." },
      { q: "What is the local truncation error of Euler's method?", a: "O(h²) per step (the leading dropped term is ½h²y″)." },
      { q: "What is the global error order?", a: "O(h) — Euler is a first-order method; halving h halves the global error." },
      { q: "How many function evaluations does each Euler step need?", a: "One — f is evaluated only at the current point (xₙ, yₙ)." },
      { q: "Why is Euler called an explicit method?", a: "Because yₙ₊₁ is given explicitly in terms of known quantities at step n, with no need to solve an equation." },
      { q: "What is the difference between explicit and implicit (backward) Euler?", a: "Backward Euler uses yₙ₊₁ = yₙ + h·f(xₙ₊₁, yₙ₊₁); it is implicit and far more stable for stiff problems." },
      { q: "Geometrically, what does Euler's method do?", a: "It follows the tangent line (slope f) at the current point to predict the next value." },
      { q: "Why does Euler perform poorly for stiff equations?", a: "Its stability region is small, so stiff problems require extremely small h to avoid blow-up." },
      { q: "How can the accuracy of Euler be improved?", a: "Reduce h, or use higher-order methods like RK2/RK4, or a predictor–corrector (Heun) scheme." },
      { q: "How is a second-order ODE solved with Euler?", a: "Rewrite it as two coupled first-order equations (introduce v = y′) and apply Euler to both." },
      { q: "What is Heun's method and how does it relate to Euler?", a: "It is an improved Euler (predictor–corrector): Euler predicts, then averages the slopes at both ends — this is RK2." },
      { q: "Does decreasing h indefinitely always help?", a: "No — beyond a point round-off error from many tiny steps dominates, so accuracy stops improving." },
      { q: "Give a physics example modelled by Euler's method.", a: "Radioactive decay dN/dt = −λN, or Newton's law of cooling dT/dt = −k(T − Tₐ)." },
    ],
    problems: [
      { level: "Easy", text: "Solve dy/dx = y, y(0) = 1 to x = 1 with h = 0.1 and compare y(1) with e.", hint: "Euler underestimates e ≈ 2.71828." },
      { level: "Easy", text: "Solve dy/dx = −2y, y(0) = 1 with h = 0.1 and compare with e^{−2x}.", hint: "Watch the error grow with x." },
      { level: "Easy", text: "Integrate dy/dx = x + y, y(0) = 1 to x = 0.5 with h = 0.1.", hint: "Exact: 2eˣ − x − 1." },
      { level: "Medium", text: "Show numerically that halving h roughly halves the global error for dy/dx = y.", hint: "First-order ⇒ error ∝ h." },
      { level: "Medium", text: "Model radioactive decay dN/dt = −0.5N, N(0) = 1000 and find N(4).", hint: "Compare with 1000·e^{−2}." },
      { level: "Medium", text: "Solve Newton's cooling dT/dt = −0.07(T − 25), T(0) = 90 over 30 minutes.", hint: "Steady state is 25°C." },
      { level: "Medium", text: "Reduce the SHM equation y″ + y = 0 to two first-order equations and integrate with Euler; comment on energy drift.", hint: "Use v = y′; Euler gains energy." },
      { level: "Advanced", text: "Compare explicit Euler with backward (implicit) Euler on the stiff equation y′ = −50y, y(0)=1, h=0.05.", hint: "Explicit Euler oscillates/blows up; implicit stays stable." },
      { level: "Advanced", text: "Integrate the logistic equation dy/dx = y(1 − y), y(0) = 0.1 and locate the inflection point.", hint: "Inflection at y = 0.5." },
      { level: "Advanced", text: "Estimate the largest stable step size h for y′ = −λy and verify h < 2/λ numerically.", hint: "Stability requires |1 − hλ| < 1." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 25 (Runge–Kutta methods, Euler).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §16.1 (ODE integration).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em> — ODE integration.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

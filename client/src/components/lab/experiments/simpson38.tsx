import IntegrationSimShared from "./IntegrationSimShared";
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
          <strong>Simpson's 3/8 Rule</strong> fits a <strong>cubic</strong> polynomial through every
          group of three sub-intervals (four points) instead of a parabola through two. It shares the
          same <MathTeX tex="O(h^4)" /> order as Simpson's 1/3 rule but is indispensable when the number
          of sub-intervals is a multiple of three rather than two — and it is the natural partner used to
          "mop up" the leftover intervals when <MathTeX tex="n" /> is odd.
        </p>
        <Callout tone="info" title="Key requirement">
          Simpson's 3/8 rule needs the number of sub-intervals <MathTeX tex="n" /> to be a
          <strong> multiple of 3</strong>.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Simpson's 3/8 rule appears wherever the integration grid is naturally divided into threes:</p>
        <ul>
          <li><strong>Spectra over odd grids:</strong> integrating data sampled at a number of points that is a multiple of three.</li>
          <li><strong>Composite schemes:</strong> combined with the 1/3 rule to integrate any grid, e.g. detector response over irregular bins.</li>
          <li><strong>Smooth distribution functions:</strong> thermodynamic and kinetic integrals where high-order accuracy is desired.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Fit a cubic through four equally spaced points <MathTeX tex="(x_0,\dots,x_3)" /> and integrate it
          over <MathTeX tex="[x_0,x_3]" />. The basic rule is
        </p>
        <MathTeX block tex="\int_{x_0}^{x_3} f(x)\,dx \approx \frac{3h}{8}\big[f_0 + 3f_1 + 3f_2 + f_3\big]." />
        <p>Summing over consecutive triples gives the composite form with weights <MathTeX tex="1,3,3,2,3,3,2,\dots,3,3,1" />:</p>
        <MathTeX block tex="I \approx \frac{3h}{8}\Big[f_0 + 3\!\!\sum_{i\not\equiv 0}\!\! f_i + 2\!\!\sum_{i\equiv 0\,(\mathrm{mod}\,3)}\!\! f_i + f_n\Big]." />
        <h3>Error term</h3>
        <MathTeX block tex="E_{3/8} = -\frac{(b-a)h^4}{80}\,f^{(4)}(\xi)." />
        <Callout tone="tip" title="1/3 vs 3/8">
          Both are <MathTeX tex="O(h^4)" />. For the same <MathTeX tex="h" />, Simpson's 1/3 has a slightly
          smaller error constant (1/180 vs 1/80 per the global form), so 1/3 is marginally more accurate —
          but 3/8 is essential when <MathTeX tex="n" /> is a multiple of 3, and the two are combined for
          arbitrary <MathTeX tex="n" />.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "O(h⁴) accuracy; exact up to cubics; handles grids that are multiples of three; pairs with 1/3 rule for any n." },
          { label: "Limitations", value: "Requires n divisible by 3; slightly larger error constant than the 1/3 rule; needs equal spacing." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read f(x), limits a and b, and n (a multiple of 3)." },
        { label: "Compute h = (b − a) / n." },
        { label: "Initialise sum = f(a) + f(b)." },
        { label: "For interior nodes, add 2·f(xᵢ) when i is a multiple of 3, otherwise 3·f(xᵢ)." },
        { label: "Multiply the total by 3h/8 to obtain the estimate." },
      ],
      pseudocode: `INPUT f, a, b, n        // n divisible by 3
h ← (b − a) / n
sum ← f(a) + f(b)
FOR i ← 1 TO n−1 DO
    IF i mod 3 = 0 THEN sum ← sum + 2 × f(a + i×h)
    ELSE               sum ← sum + 3 × f(a + i×h)
END FOR
I ← (3h / 8) × sum
OUTPUT I`,
      flowchart: ["Start", "Read f, a, b, n (mult. of 3)", "h = (b−a)/n", "sum = f(a)+f(b)", "i%3=0: +2f(x_i) · else +3f(x_i)", "I = (3h/8)·sum", "Output I", "Stop"],
    },
    simulator: <IntegrationSimShared rule="s38" />,
    cFilename: "simpson38.c",
    cCode: `/* Simpson's 3/8 Rule — composite numerical integration
 * Compile: gcc simpson38.c -o simpson38 -lm
 * Note: number of intervals n must be a MULTIPLE OF 3.
 */
#include <stdio.h>
#include <math.h>

double f(double x) {
    return 1.0 / (1.0 + x * x);  /* example: 1/(1+x^2) */
}

int main(void) {
    double a, b, h, sum;
    int n, i;

    printf("Enter a, b: ");
    scanf("%lf %lf", &a, &b);
    printf("Enter number of intervals n (multiple of 3): ");
    scanf("%d", &n);

    if (n % 3 != 0) {
        printf("Error: n must be a multiple of 3.\\n");
        return 1;
    }

    h = (b - a) / n;
    sum = f(a) + f(b);

    for (i = 1; i < n; i++) {
        if (i % 3 == 0) sum += 2.0 * f(a + i * h);   /* multiple of 3 -> weight 2 */
        else            sum += 3.0 * f(a + i * h);   /* otherwise     -> weight 3 */
    }

    double integral = (3.0 * h / 8.0) * sum;
    printf("Simpson's 3/8 estimate = %.8lf\\n", integral);
    return 0;
}`,
    viva: [
      { q: "State Simpson's 3/8 rule.", a: "I ≈ (3h/8)[f₀ + 3(f₁+f₂+f₄+f₅+…) + 2(f₃+f₆+…) + fₙ], with n a multiple of 3." },
      { q: "Why must n be a multiple of 3?", a: "Each cubic segment spans three sub-intervals (four nodes), so the intervals must group evenly into threes." },
      { q: "What polynomial does the 3/8 rule fit?", a: "A cubic (third-degree polynomial) through four equally spaced points." },
      { q: "What is the order of accuracy of the 3/8 rule?", a: "O(h⁴); the error is −(b−a)h⁴f⁽⁴⁾(ξ)/80." },
      { q: "Up to what degree is Simpson's 3/8 exact?", a: "Cubic polynomials (and it is constructed from cubics, so degree 3 is exact)." },
      { q: "Compare the 1/3 and 3/8 rules' accuracy.", a: "Both are O(h⁴); the 1/3 rule has a smaller error constant, so it is slightly more accurate for the same h." },
      { q: "When is the 3/8 rule preferred over the 1/3 rule?", a: "When the number of sub-intervals is a multiple of 3 but not of 2, or to handle leftover intervals in combination with the 1/3 rule." },
      { q: "Give the basic (single-panel) 3/8 formula and its error.", a: "(3h/8)(f₀+3f₁+3f₂+f₃) with panel error −3h⁵f⁽⁴⁾(ξ)/80." },
      { q: "Explain the 1-3-3-2-3-3-2-…-1 weight pattern.", a: "Within each cubic panel weights are 1,3,3,1; at shared boundaries between panels the 1+1 add to 2, giving the repeating 2." },
      { q: "How do you integrate when n is, say, 7?", a: "Apply the 3/8 rule to three intervals and the 1/3 rule to the remaining four (which is even)." },
      { q: "Is the 3/8 rule a closed Newton–Cotes formula?", a: "Yes — it uses function values at the interval end points." },
      { q: "What spacing does the composite 3/8 rule assume?", a: "Equal spacing h between all nodes." },
      { q: "How would you test a 3/8 implementation?", a: "Integrate a cubic such as ∫₀¹x³dx; the result should be exactly 0.25." },
      { q: "Why are higher-order Newton–Cotes rules (n≥8) rarely used?", a: "They develop large oscillatory weights (Runge phenomenon) and can become unstable; composite low-order rules are preferred." },
      { q: "State one physics situation needing the 3/8 rule.", a: "Integrating an experimental spectrum sampled at a number of points that makes the interval count a multiple of three." },
    ],
    problems: [
      { level: "Easy", text: "Evaluate ∫₀¹ 1/(1+x²) dx with n = 3 using Simpson's 3/8 and compare with π/4.", hint: "Single panel: (3h/8)(f₀+3f₁+3f₂+f₃)." },
      { level: "Easy", text: "Use n = 3 to integrate ∫₀³ x³ dx and confirm the result is exact.", hint: "The rule is exact for cubics." },
      { level: "Easy", text: "Compute ∫₀^π sin x dx with n = 6 and compare with 2.", hint: "Weights 1,3,3,2,3,3,1." },
      { level: "Medium", text: "Estimate ∫₀¹ e^x dx with n = 6 and find the relative error.", hint: "Exact value e − 1 ≈ 1.71828." },
      { level: "Medium", text: "Integrate ∫₁² (1/x) dx with n = 6 and compare 3/8 against the 1/3 result.", hint: "Both should be close to ln 2." },
      { level: "Medium", text: "Show numerically that the 3/8 error scales as h⁴ for ∫₀¹ cos x dx.", hint: "Use n = 3 and n = 6." },
      { level: "Medium", text: "A spectrum is sampled at 7 equally spaced points. Integrate it using a 3/8 + 1/3 combination.", hint: "6 intervals = 3/8 on first three or 1/3 on all six; here demonstrate the split for an odd count." },
      { level: "Advanced", text: "Derive the single-panel 3/8 error term −3h⁵f⁽⁴⁾(ξ)/80.", hint: "Integrate the cubic interpolation remainder." },
      { level: "Advanced", text: "Write a routine that automatically chooses 1/3, 3/8, or a combination based on n mod 6.", hint: "Cover the cases n even, n multiple of 3, and otherwise." },
      { level: "Advanced", text: "Compare the error constants of the 1/3 and 3/8 rules and explain why 1/3 is usually preferred.", hint: "1/180 vs 1/80 in the global error." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Newton–Cotes formulas.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §4.1.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

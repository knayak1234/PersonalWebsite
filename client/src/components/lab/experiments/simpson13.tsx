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
          <strong>Simpson's 1/3 Rule</strong> improves on the trapezoidal rule by replacing the
          straight line over each pair of sub-intervals with a <strong>parabola</strong>. Because a
          parabola can bend to follow a curving integrand, the approximation is dramatically more
          accurate for smooth functions — at essentially the same computational cost.
        </p>
        <p>
          It is the most widely used Newton–Cotes formula in physics computations, from integrating
          measured spectra to evaluating special functions, and it is the rule that a fine-grid
          calculator or library routine most often falls back on.
        </p>
        <Callout tone="info" title="Key requirement">
          Simpson's 1/3 rule needs an <strong>even</strong> number of sub-intervals <MathTeX tex="n" /> (an
          odd number of nodes), because the nodes are consumed two intervals at a time.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Simpson's rule is the default high-accuracy integrator in many physics workflows:</p>
        <ul>
          <li><strong>Flow coefficient averaging:</strong> computing <MathTeX tex="\langle v_2\rangle" /> from <MathTeX tex="v_2(p_T)\,dN/dp_T" /> with high precision.</li>
          <li><strong>Cross-section integration:</strong> integrating differential cross-sections <MathTeX tex="d\sigma/d\Omega" /> over solid angle.</li>
          <li><strong>Partition functions:</strong> thermodynamic integrals over smooth Boltzmann factors.</li>
          <li><strong>Special functions:</strong> evaluating error functions, Fermi–Dirac and Bose–Einstein integrals.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Approximate <MathTeX tex="f" /> over two adjacent strips <MathTeX tex="[x_0,x_2]" /> by the
          parabola through <MathTeX tex="(x_0,f_0),(x_1,f_1),(x_2,f_2)" />. Integrating that quadratic
          (using Lagrange interpolation) gives the basic Simpson rule:
        </p>
        <MathTeX block tex="\int_{x_0}^{x_2} f(x)\,dx \approx \frac{h}{3}\big[f_0 + 4f_1 + f_2\big]." />
        <p>Applying this to every consecutive pair and summing yields the <strong>composite</strong> rule:</p>
        <MathTeX block tex="I \approx \frac{h}{3}\Big[f_0 + 4\!\!\sum_{i\,\text{odd}}\!\! f_i + 2\!\!\sum_{i\,\text{even}}\!\! f_i + f_n\Big]," />
        <p>
          with weights <MathTeX tex="1,4,2,4,2,\dots,4,1" />. The pattern (4 at odd nodes, 2 at interior even nodes)
          is the signature of Simpson's 1/3 rule.
        </p>
        <h3>Error term</h3>
        <MathTeX block tex="E_S = -\frac{(b-a)h^4}{180}\,f^{(4)}(\xi), \qquad \xi\in(a,b)." />
        <Callout tone="tip" title="Order of accuracy">
          The error is <MathTeX tex="O(h^4)" /> — two orders better than the trapezoidal rule. Halving
          <MathTeX tex="\,h" /> cuts the error by <strong>16×</strong>. Remarkably, although built from
          parabolas, Simpson's rule integrates <em>cubic</em> polynomials exactly (the cubic error term cancels).
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "O(h⁴) accuracy at trapezoidal-like cost; exact up to cubics; excellent for smooth integrands." },
          { label: "Limitations", value: "Requires even n and equal spacing; less robust on noisy data or functions with discontinuous derivatives." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read f(x), limits a and b, and an even number of intervals n." },
        { label: "Compute h = (b − a) / n." },
        { label: "Initialise sum = f(a) + f(b)." },
        { label: "Add 4·f(xᵢ) for every odd index i (1,3,5,…)." },
        { label: "Add 2·f(xᵢ) for every even interior index i (2,4,6,…)." },
        { label: "Multiply the total by h/3 to obtain the estimate." },
      ],
      pseudocode: `INPUT f, a, b, n        // n even
h ← (b − a) / n
sum ← f(a) + f(b)
FOR i ← 1 TO n−1 DO
    IF i is odd THEN sum ← sum + 4 × f(a + i×h)
    ELSE            sum ← sum + 2 × f(a + i×h)
END FOR
I ← (h / 3) × sum
OUTPUT I`,
      flowchart: ["Start", "Read f, a, b, n (even)", "h = (b−a)/n", "sum = f(a)+f(b)", "Odd i: +4f(xᵢ) · Even i: +2f(xᵢ)", "I = (h/3)·sum", "Output I", "Stop"],
    },
    simulator: <IntegrationSimShared rule="s13" />,
    cFilename: "simpson13.c",
    cCode: `/* Simpson's 1/3 Rule — composite numerical integration
 * Compile: gcc simpson13.c -o simpson13 -lm
 * Note: number of intervals n must be EVEN.
 */
#include <stdio.h>
#include <math.h>

double f(double x) {
    return 1.0 / (1.0 + x * x);  /* example: 1/(1+x^2) -> integrates to atan */
}

int main(void) {
    double a, b, h, sum;
    int n, i;

    printf("Enter a, b: ");
    scanf("%lf %lf", &a, &b);
    printf("Enter number of intervals n (even): ");
    scanf("%d", &n);

    if (n % 2 != 0) {
        printf("Error: n must be even for Simpson's 1/3 rule.\\n");
        return 1;
    }

    h = (b - a) / n;
    sum = f(a) + f(b);

    for (i = 1; i < n; i++) {
        if (i % 2 == 1) sum += 4.0 * f(a + i * h);   /* odd  -> weight 4 */
        else            sum += 2.0 * f(a + i * h);   /* even -> weight 2 */
    }

    double integral = (h / 3.0) * sum;
    printf("Simpson's 1/3 estimate = %.8lf\\n", integral);
    return 0;
}`,
    viva: [
      { q: "State Simpson's 1/3 rule.", a: "I ≈ (h/3)[f₀ + 4(f₁+f₃+…) + 2(f₂+f₄+…) + fₙ], with h = (b−a)/n and n even." },
      { q: "Why must n be even in Simpson's 1/3 rule?", a: "Each parabola spans two sub-intervals, so the nodes are grouped in pairs; an even number of intervals is required to cover [a,b] exactly." },
      { q: "What is the order of accuracy of Simpson's 1/3 rule?", a: "The truncation error is O(h⁴), proportional to (b−a)h⁴f⁽⁴⁾(ξ)/180." },
      { q: "Up to what degree of polynomial is Simpson's 1/3 rule exact?", a: "Cubic polynomials — even though it is derived using parabolas, the cubic error term cancels by symmetry." },
      { q: "What curve does Simpson's 1/3 rule fit over each pair of intervals?", a: "A parabola (second-degree polynomial) through the three points bounding the pair." },
      { q: "Explain the 1-4-2-4-…-4-1 weighting pattern.", a: "End points get weight 1, odd interior nodes (peaks of each parabola) get 4, and shared even interior nodes get 2 because they belong to two parabolic segments." },
      { q: "How much more accurate is Simpson's 1/3 than the trapezoidal rule?", a: "Two orders of h better; halving h reduces Simpson error by 16× versus 4× for trapezoidal." },
      { q: "Derive the basic Simpson formula.", a: "Fit a Lagrange parabola through (x₀,f₀),(x₁,f₁),(x₂,f₂) and integrate analytically from x₀ to x₂ to get (h/3)(f₀+4f₁+f₂)." },
      { q: "What is the relation between Simpson's rule and Richardson extrapolation of the trapezoidal rule?", a: "Simpson's estimate equals (4T(h/2) − T(h))/3, the first Richardson extrapolation that cancels the O(h²) error." },
      { q: "When does Simpson's 1/3 rule perform poorly?", a: "When f⁽⁴⁾ is large or discontinuous, or the integrand is noisy/oscillatory and n is too small to resolve features." },
      { q: "Can Simpson's rule integrate tabulated data?", a: "Yes, provided the data are equally spaced and there is an even number of intervals." },
      { q: "What if you have an odd number of intervals?", a: "Use Simpson's 3/8 rule on three of the intervals and Simpson's 1/3 on the remaining even number, or adjust the grid." },
      { q: "Give the error term and its sign meaning.", a: "E = −(b−a)h⁴f⁽⁴⁾(ξ)/180; the sign depends on the fourth derivative of f over the interval." },
      { q: "Is Simpson's 1/3 a closed or open Newton–Cotes formula?", a: "Closed — it uses the function values at the end points of the interval." },
      { q: "How would you verify your Simpson code?", a: "Integrate a cubic (e.g. ∫₀¹x³dx) — Simpson's rule should return the exact value 0.25 to machine precision." },
    ],
    problems: [
      { level: "Easy", text: "Evaluate ∫₀¹ 1/(1+x²) dx with n = 4 using Simpson's 1/3 and compare with π/4.", hint: "h = 0.25; weights 1,4,2,4,1." },
      { level: "Easy", text: "Use n = 2 to compute ∫₀² x³ dx and confirm it is exact.", hint: "Simpson is exact for cubics." },
      { level: "Easy", text: "Estimate ∫₀^π sin x dx with n = 4 (Simpson) and compare with the exact value 2.", hint: "Compare with trapezoidal at the same n." },
      { level: "Medium", text: "Compute ∫₀¹ e^{−x²} dx with n = 8 and find the relative error against erf(1)·√π/2.", hint: "Use the node table." },
      { level: "Medium", text: "Show numerically that halving h reduces Simpson's error by ~16× for ∫₁² ln x dx.", hint: "Run n = 4 and n = 8." },
      { level: "Medium", text: "Integrate a tabulated dN/dpT (5 equally spaced points) using Simpson's 1/3 to get the yield.", hint: "Ensure an even number of intervals." },
      { level: "Medium", text: "Compare Simpson 1/3 and trapezoidal errors for ∫₀¹ √x dx and explain the smaller-than-expected gain.", hint: "f⁽⁴⁾ blows up near 0." },
      { level: "Advanced", text: "Derive the composite Simpson error −(b−a)h⁴f⁽⁴⁾(ξ)/180 by summing single-panel errors.", hint: "Each panel error is −h⁵f⁽⁴⁾/90." },
      { level: "Advanced", text: "Implement adaptive Simpson integration that refines only where the local error estimate is large.", hint: "Compare S(whole) with S(left)+S(right)." },
      { level: "Advanced", text: "For an odd number of intervals, combine Simpson's 1/3 and 3/8 rules to integrate ∫₀¹ cos(x²) dx with n = 5.", hint: "Use 3/8 on three intervals, 1/3 on two." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Simpson's rules.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §4.1–4.2.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

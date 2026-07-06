import { useMemo, useState } from "react";
import { quadraticRoots } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { NumberField } from "@/components/lab/ParamControl";
import { LineFigure, ScatterFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function fmtComplex(re: number, im: number): string {
  if (Math.abs(im) < 1e-12) return re.toFixed(4);
  const sign = im >= 0 ? "+" : "−";
  return `${re.toFixed(4)} ${sign} ${Math.abs(im).toFixed(4)}i`;
}

function QuadraticSim() {
  const [aStr, setA] = useState("1");
  const [bStr, setB] = useState("-3");
  const [cStr, setC] = useState("2");
  const [run, setRun] = useState(0);

  const a = parseFloat(aStr), b = parseFloat(bStr), c = parseFloat(cStr);
  const errors: Record<string, string> = {};
  if (!Number.isFinite(a) || a === 0) errors.a = "a must be non-zero (else it is not quadratic).";
  if (!Number.isFinite(b)) errors.b = "Enter a number.";
  if (!Number.isFinite(c)) errors.c = "Enter a number.";
  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const res = quadraticRoots(a, b, c);
    const x0 = res.vertex.x;
    const span = Math.max(4, Math.abs(x0) * 2 + 2);
    const curve: { x: number; y: number }[] = [];
    for (let i = 0; i <= 160; i++) {
      const x = x0 - span + (i / 160) * (2 * span);
      curve.push({ x: +x.toFixed(3), y: a * x * x + b * x + c });
    }
    const roots = res.real
      ? [{ x: res.root1.re, y: 0 }, { x: res.root2.re, y: 0 }]
      : [];
    return { res, curve, roots };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setA("1"); setB("-3"); setC("2"); setRun((r) => r + 1); }}
      runLabel="Solve"
      controls={
        <>
          <NumberField label="Coefficient a" value={aStr} onChange={setA} step="any" error={errors.a} hint="Leading coefficient (≠ 0)." />
          <NumberField label="Coefficient b" value={bStr} onChange={setB} step="any" error={errors.b} />
          <NumberField label="Coefficient c" value={cStr} onChange={setC} step="any" error={errors.c} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Fix the inputs to run">Provide numeric a, b, c with a ≠ 0.</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Discriminant b²−4ac" value={result.res.discriminant.toFixed(4)} accent={result.res.discriminant >= 0 ? "text-emerald-600" : "text-rose-600"} />
              <StatTile label="Root x₁" value={fmtComplex(result.res.root1.re, result.res.root1.im)} />
              <StatTile label="Root x₂" value={fmtComplex(result.res.root2.re, result.res.root2.im)} />
              <StatTile label="Vertex" value={`(${result.res.vertex.x.toFixed(3)}, ${result.res.vertex.y.toFixed(3)})`} accent="text-violet-600" />
            </div>

            <OutputBlock title="Nature of roots">
              <Callout tone={result.res.discriminant > 0 ? "success" : result.res.discriminant === 0 ? "info" : "warn"} title={result.res.nature}>
                {result.res.discriminant > 0 && "Since b² − 4ac > 0, the parabola crosses the x-axis at two distinct real points."}
                {result.res.discriminant === 0 && "Since b² − 4ac = 0, the parabola touches the x-axis at exactly one point (a repeated root)."}
                {result.res.discriminant < 0 && "Since b² − 4ac < 0, the parabola never meets the x-axis; the roots are a complex-conjugate pair."}
              </Callout>
            </OutputBlock>

            <OutputBlock title="Visualization — the parabola y = a x² + b x + c">
              <LineFigure
                height={300}
                xKey="x"
                xLabel="x"
                yLabel="y"
                refY={0}
                series={[{ name: "y = ax² + bx + c", color: "#e11d48", dataKey: "y", data: result.curve }]}
              />
              {result.roots.length > 0 && (
                <div className="mt-3">
                  <ScatterFigure
                    height={200}
                    xLabel="x"
                    yLabel="y"
                    groups={[{ name: "Real roots (y = 0)", data: result.roots, color: "#16a34a" }]}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Real roots are where the curve crosses <MathTeX tex="y=0" />. Complex roots have no x-intercept — the
                whole parabola sits above or below the axis.
              </p>
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
          A <strong>quadratic equation</strong> <MathTeX tex="ax^2 + bx + c = 0" /> (with <MathTeX tex="a \neq 0" />) is
          the simplest non-linear equation and one of the first programs every numerical-methods course writes. The task
          is to compute both roots and to correctly classify them as <em>real and distinct</em>, <em>real and equal</em>,
          or <em>complex conjugates</em> — a decision governed entirely by the <strong>discriminant</strong>.
        </p>
        <p>
          Although a closed-form solution exists, the program is an ideal vehicle for practising conditional logic,
          floating-point comparison, and the handling of complex numbers in C.
        </p>
        <Callout tone="info" title="The discriminant decides everything">
          <MathTeX tex="D = b^2 - 4ac" />. Its sign — positive, zero, or negative — tells you the nature of the roots
          before you compute them.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Quadratic equations appear throughout introductory and advanced physics:</p>
        <ul>
          <li><strong>Projectile motion:</strong> time of flight and range come from a quadratic in <MathTeX tex="t" />.</li>
          <li><strong>Kinematics:</strong> <MathTeX tex="s = ut + \tfrac12 a t^2" /> solved for time is quadratic.</li>
          <li><strong>Optics &amp; circuits:</strong> lens/mirror and resonance conditions reduce to quadratics.</li>
          <li><strong>Quantum wells:</strong> energy eigenvalue conditions often give quadratic relations.</li>
          <li><strong>Equilibrium:</strong> chemical/physical equilibrium constants frequently yield quadratics.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>The roots follow from completing the square, giving the well-known quadratic formula:</p>
        <MathTeX block tex="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}." />
        <h3>Classifying by the discriminant</h3>
        <p>Let <MathTeX tex="D = b^2 - 4ac" />. Then:</p>
        <MathTeX block tex="D > 0 \Rightarrow \text{two real distinct roots}, \quad D = 0 \Rightarrow \text{one repeated root}, \quad D < 0 \Rightarrow \text{complex conjugates}." />
        <p>When <MathTeX tex="D<0" /> the roots are</p>
        <MathTeX block tex="x = \frac{-b}{2a} \pm i\,\frac{\sqrt{-D}}{2a}," />
        <p>a complex-conjugate pair with real part at the parabola's axis of symmetry.</p>
        <h3>Vertex and symmetry</h3>
        <p>
          The parabola has its vertex at <MathTeX tex="x = -\tfrac{b}{2a}" />, which is also the midpoint of the two
          roots (real or complex). Sum and product of the roots satisfy <MathTeX tex="x_1 + x_2 = -b/a" /> and
          <MathTeX tex="\,x_1 x_2 = c/a" /> (Vieta's formulas), a handy check on any computed answer.
        </p>
        <Callout tone="tip" title="Numerical caution">
          When <MathTeX tex="b^2 \gg 4ac" />, computing <MathTeX tex="-b + \sqrt{D}" /> loses precision by cancellation.
          A stable trick computes one root as <MathTeX tex="q = -\tfrac12(b + \operatorname{sgn}(b)\sqrt{D})" /> and the
          other as <MathTeX tex="c/q" />.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Exact closed-form; instant; a clean exercise in branching and complex arithmetic." },
          { label: "Cautions", value: "a = 0 degenerates to linear; catastrophic cancellation for widely separated roots; watch complex output." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the coefficients a, b, c." },
        { label: "If a = 0, the equation is not quadratic — handle as linear (or reject)." },
        { label: "Compute the discriminant D = b² − 4ac." },
        { label: "If D > 0, compute two distinct real roots (−b ± √D)/2a." },
        { label: "If D = 0, compute the single repeated root −b/2a." },
        { label: "If D < 0, compute the complex pair −b/2a ± i√(−D)/2a." },
        { label: "Display the roots and their nature." },
      ],
      pseudocode: `INPUT a, b, c
IF a = 0 THEN print "not quadratic"; STOP
D ← b*b - 4*a*c
IF D > 0 THEN
    x1 ← (-b + sqrt(D)) / (2a)
    x2 ← (-b - sqrt(D)) / (2a)
ELSE IF D = 0 THEN
    x1 ← x2 ← -b / (2a)
ELSE
    re ← -b / (2a);  im ← sqrt(-D) / (2a)
    x1 ← re + i*im;  x2 ← re - i*im
OUTPUT roots and nature`,
      flowchart: ["Start", "Read a, b, c", "a = 0 ?", "D = b^2−4ac", "Sign of D ?", "Compute roots", "Output roots & nature", "Stop"],
    },
    simulator: <QuadraticSim />,
    cFilename: "quadratic.c",
    cCode: `/* Solution of a Quadratic Equation  a x^2 + b x + c = 0
 * Compile: gcc quadratic.c -o quad -lm
 */
#include <stdio.h>
#include <math.h>

int main(void) {
    double a, b, c, D, re, im;

    printf("Enter coefficients a, b, c: ");
    scanf("%lf %lf %lf", &a, &b, &c);

    if (a == 0.0) {
        printf("Not a quadratic equation (a = 0).\\n");
        return 0;
    }

    D = b*b - 4*a*c;

    if (D > 0) {
        double x1 = (-b + sqrt(D)) / (2*a);
        double x2 = (-b - sqrt(D)) / (2*a);
        printf("Real and distinct roots: %.4lf, %.4lf\\n", x1, x2);
    } else if (D == 0) {
        printf("Real and equal roots: %.4lf\\n", -b / (2*a));
    } else {
        re = -b / (2*a);
        im = sqrt(-D) / (2*a);
        printf("Complex roots: %.4lf + %.4lfi, %.4lf - %.4lfi\\n", re, im, re, im);
    }
    return 0;
}`,
    viva: [
      { q: "What condition makes an equation quadratic?", a: "The coefficient of x² (a) must be non-zero; otherwise it reduces to a linear equation." },
      { q: "What is the discriminant and what does it tell you?", a: "D = b² − 4ac. Its sign classifies the roots: D>0 real distinct, D=0 real equal, D<0 complex conjugate." },
      { q: "Write the quadratic formula.", a: "x = (−b ± √(b²−4ac)) / (2a)." },
      { q: "Where is the vertex of the parabola?", a: "At x = −b/(2a); it is the axis of symmetry and the midpoint of the two roots." },
      { q: "State Vieta's formulas.", a: "Sum of roots = −b/a; product of roots = c/a." },
      { q: "What are complex conjugate roots?", a: "When D<0 the roots are p ± iq with the same real part p = −b/2a and opposite imaginary parts." },
      { q: "Why can the naïve formula lose precision?", a: "When b² ≫ 4ac, −b + √D subtracts two nearly equal numbers (catastrophic cancellation)." },
      { q: "Give a numerically stable way to find both roots.", a: "Compute q = −½(b + sign(b)√D), then x₁ = q/a and x₂ = c/q." },
      { q: "How many roots does a quadratic always have?", a: "Exactly two, counting multiplicity, in the complex number system (Fundamental Theorem of Algebra)." },
      { q: "What library function computes the square root in C?", a: "sqrt() from <math.h>; link with -lm." },
      { q: "How do you handle D < 0 in a C program without complex.h?", a: "Compute the real part −b/2a and imaginary part √(−D)/2a separately and print them as p ± q i." },
      { q: "Give a physics example that reduces to a quadratic.", a: "Time of flight of a projectile from y = ut − ½gt², solved for t." },
    ],
    problems: [
      { level: "Easy", text: "Solve x² − 3x + 2 = 0 and identify the nature of the roots.", hint: "D = 1 > 0 ⇒ roots 1 and 2." },
      { level: "Easy", text: "Solve x² − 4x + 4 = 0.", hint: "D = 0 ⇒ repeated root x = 2." },
      { level: "Easy", text: "Solve x² + x + 1 = 0 and report the complex roots.", hint: "D = −3 ⇒ −0.5 ± 0.866 i." },
      { level: "Medium", text: "For 2x² + 5x − 3 = 0 verify Vieta's formulas against your computed roots.", hint: "Sum should be −2.5, product −1.5." },
      { level: "Medium", text: "Modify the program to also handle the linear case a = 0, b ≠ 0.", hint: "Root = −c/b." },
      { level: "Medium", text: "A ball is thrown up at 20 m/s. Using y = 20t − 4.9t², find when y = 15 m.", hint: "Solve 4.9t² − 20t + 15 = 0." },
      { level: "Advanced", text: "Demonstrate catastrophic cancellation with a = 1, b = 1e8, c = 1 and fix it with the stable formula.", hint: "Compare (−b+√D)/2a to c/q." },
      { level: "Advanced", text: "Extend the code to solve a depressed cubic by first removing the quadratic term.", hint: "Substitute x = t − b/3a." },
      { level: "Advanced", text: "Plot the discriminant sign regions in the (b, c) plane for fixed a = 1.", hint: "Boundary is c = b²/4." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — roots of equations.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §5.6 (quadratic and cubic equations).</li>
        <li>E. Balagurusamy, <em>Programming in ANSI C</em> — decision control &amp; math functions.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

import { useMemo, useState } from "react";
import { gaussElimination } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

const DEFAULT_MATRIX = `2  1 -1   8
-3 -1  2 -11
-2  1  2  -3`;

/** Parse an augmented matrix: each line is a row of coefficients ending with the RHS. */
function parseMatrix(raw: string): { A: number[][]; b: number[]; error?: string } {
  const rows = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (rows.length < 2) return { A: [], b: [], error: "Enter at least two equations (rows)." };
  const A: number[][] = [], b: number[] = [];
  const n = rows.length;
  for (const r of rows) {
    const nums = r.split(/[,\s\t]+/).map((p) => parseFloat(p)).filter((v) => !Number.isNaN(v));
    if (nums.length !== n + 1) return { A: [], b: [], error: `Each row needs ${n} coefficients + 1 RHS = ${n + 1} numbers.` };
    A.push(nums.slice(0, n));
    b.push(nums[n]);
  }
  return { A, b };
}

function GaussSim() {
  const [text, setText] = useState(DEFAULT_MATRIX);
  const [run, setRun] = useState(0);

  const parsed = parseMatrix(text);
  const valid = !parsed.error && parsed.A.length >= 2;

  const result = useMemo(() => {
    if (!valid) return null;
    try {
      const res = gaussElimination(parsed.A.map((r) => [...r]), [...parsed.b]);
      if (res.solution.some((v) => !Number.isFinite(v))) return { error: "Singular or nearly singular matrix — no unique solution." };
      return { res };
    } catch {
      return { error: "Could not solve the system." };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const n = parsed.A.length;

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setText(DEFAULT_MATRIX); setRun((r) => r + 1); }}
      runLabel="Solve system"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Augmented matrix [A | b]</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="font-mono text-xs" />
            <p className="text-[11px] text-muted-foreground">One equation per row: coefficients then the right-hand side.</p>
            {parsed.error && <p className="text-[11px] text-rose-600">{parsed.error}</p>}
          </div>
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Enter a square system">Provide n equations with n coefficients and a RHS each.</Callout>
        ) : result.error ? (
          <Callout tone="warn" title="No unique solution">{result.error}</Callout>
        ) : (
          <>
            <div className={`grid grid-cols-2 ${n <= 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"} gap-3`}>
              {result.res!.solution.map((v, i) => (
                <StatTile key={i} label={`x${i + 1}`} value={v.toFixed(5)} />
              ))}
            </div>

            <OutputBlock title="Visualization — elimination steps (row operations)">
              <ol className="space-y-1.5 text-sm font-mono">
                {result.res!.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0 w-6 text-right">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-muted-foreground mt-3">
                Partial pivoting swaps rows to put the largest available coefficient on the diagonal, improving
                numerical stability before each elimination.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — upper-triangular form [U | c]">
              <div className="overflow-x-auto">
                <table className="text-sm font-mono mx-auto">
                  <tbody>
                    {result.res!.augmented.map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td key={j} className={`px-3 py-1.5 text-right ${j === row.length - 1 ? "border-l-2 border-primary/40 text-primary font-semibold" : ""} ${i > j && j < row.length - 1 ? "text-muted-foreground/50" : ""}`}>
                            {Math.abs(v) < 1e-12 ? "0" : v.toFixed(3)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                After forward elimination the system is upper-triangular; back-substitution then recovers the
                solution from the bottom row up.
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
          <strong>Gauss elimination</strong> is the standard direct method for solving a system of linear
          equations <MathTeX tex="A\mathbf{x} = \mathbf{b}" />. It systematically eliminates unknowns to reduce
          the system to upper-triangular form, then solves it by <strong>back-substitution</strong> — recovering
          the unknowns one at a time from the last equation upward.
        </p>
        <p>
          Linear systems appear everywhere in physics: circuit analysis, detector calibration, fitting,
          equilibrium of structures, discretised differential equations, and coupled-mode problems. Gauss
          elimination is the foundation of nearly all linear-algebra computation.
        </p>
        <Callout tone="info" title="Two phases">
          <strong>Forward elimination</strong> turns <MathTeX tex="A" /> into an upper-triangular matrix;
          <strong> back-substitution</strong> then solves the triangular system from the bottom up.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Direct linear solvers are used throughout computational physics:</p>
        <ul>
          <li><strong>Detector calibration:</strong> solving linear systems relating raw signals to physical quantities.</li>
          <li><strong>Circuit analysis:</strong> Kirchhoff's laws give a linear system for node voltages / loop currents.</li>
          <li><strong>Coupled equations:</strong> equilibrium of springs, trusses, and linear reaction networks.</li>
          <li><strong>Discretised PDEs:</strong> finite-difference/element methods reduce to large linear systems.</li>
          <li><strong>Polynomial &amp; least-squares fitting:</strong> the normal equations are solved by elimination.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>Consider the system in augmented form <MathTeX tex="[A\,|\,\mathbf{b}]" />:</p>
        <MathTeX block tex="\left[\begin{array}{ccc|c} a_{11} & a_{12} & a_{13} & b_1 \\ a_{21} & a_{22} & a_{23} & b_2 \\ a_{31} & a_{32} & a_{33} & b_3 \end{array}\right]" />
        <h3>Forward elimination</h3>
        <p>
          For each pivot column <MathTeX tex="k" />, eliminate the entries below the pivot using the multiplier
        </p>
        <MathTeX block tex="m_{ik} = \frac{a_{ik}}{a_{kk}}, \qquad R_i \leftarrow R_i - m_{ik}\,R_k \quad (i>k)." />
        <p>
          This zeros out everything below the diagonal, producing an upper-triangular matrix
          <MathTeX tex="\,U" />.
        </p>
        <h3>Back-substitution</h3>
        <p>From the triangular system, solve from the last equation upward:</p>
        <MathTeX block tex="x_n = \frac{c_n}{u_{nn}}, \qquad x_i = \frac{1}{u_{ii}}\Big(c_i - \sum_{j=i+1}^{n} u_{ij}\,x_j\Big)." />
        <h3>Partial pivoting</h3>
        <p>
          If a pivot <MathTeX tex="a_{kk}" /> is zero or small, the multipliers blow up. <strong>Partial
          pivoting</strong> swaps in the row with the largest <MathTeX tex="|a_{ik}|" /> in that column first,
          which controls round-off growth and avoids division by zero.
        </p>
        <Callout tone="tip" title="Cost">
          Gauss elimination needs about <MathTeX tex="\tfrac{2}{3}n^3" /> operations for an
          <MathTeX tex="\,n\times n" /> system — direct and exact (up to round-off), unlike iterative methods.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Direct (finite steps); exact up to round-off; one factorisation solves multiple RHS; foundation of LU decomposition." },
          { label: "Limitations", value: "O(n³) cost grows fast; round-off without pivoting; inefficient for large sparse systems (use iterative methods there)." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Form the augmented matrix [A | b]." },
        { label: "For each pivot column k, find the row with the largest |aᵢₖ| and swap it to the pivot row (partial pivoting)." },
        { label: "For every row i below the pivot, compute the multiplier mᵢₖ = aᵢₖ / aₖₖ." },
        { label: "Replace Rᵢ ← Rᵢ − mᵢₖ·Rₖ to create a zero below the pivot." },
        { label: "Repeat until the matrix is upper-triangular." },
        { label: "Back-substitute from the last equation upward to find x₁ … xₙ." },
      ],
      pseudocode: `INPUT A[n][n], b[n]
FOR k = 1 TO n-1 DO
    pivot ← argmax_i≥k |A[i][k]|;  swap rows k, pivot
    FOR i = k+1 TO n DO
        m ← A[i][k] / A[k][k]
        FOR j = k TO n DO  A[i][j] ← A[i][j] − m*A[k][j]
        b[i] ← b[i] − m*b[k]
/* back-substitution */
FOR i = n DOWNTO 1 DO
    x[i] ← (b[i] − Σ_{j>i} A[i][j]*x[j]) / A[i][i]
OUTPUT x`,
      flowchart: ["Start", "Build [A | b]", "Partial pivot (swap rows)", "Eliminate below pivot", "Upper-triangular ?", "Back-substitute for x", "Output x", "Stop"],
    },
    simulator: <GaussSim />,
    cFilename: "gauss_elimination.c",
    cCode: `/* Gauss Elimination with partial pivoting  A x = b
 * Compile: gcc gauss_elimination.c -o gauss -lm
 */
#include <stdio.h>
#include <math.h>
#define N 10

int main(void) {
    int n, i, j, k;
    double a[N][N+1], x[N];

    printf("Enter number of equations: ");
    scanf("%d", &n);
    printf("Enter augmented matrix [A | b] row by row:\\n");
    for (i = 0; i < n; i++)
        for (j = 0; j <= n; j++)
            scanf("%lf", &a[i][j]);

    /* forward elimination with partial pivoting */
    for (k = 0; k < n-1; k++) {
        int piv = k;
        for (i = k+1; i < n; i++)
            if (fabs(a[i][k]) > fabs(a[piv][k])) piv = i;
        if (piv != k)
            for (j = 0; j <= n; j++) { double t=a[k][j]; a[k][j]=a[piv][j]; a[piv][j]=t; }

        for (i = k+1; i < n; i++) {
            double m = a[i][k] / a[k][k];
            for (j = k; j <= n; j++) a[i][j] -= m * a[k][j];
        }
    }

    /* back-substitution */
    for (i = n-1; i >= 0; i--) {
        double s = a[i][n];
        for (j = i+1; j < n; j++) s -= a[i][j] * x[j];
        x[i] = s / a[i][i];
    }

    printf("Solution:\\n");
    for (i = 0; i < n; i++) printf("x%d = %.6lf\\n", i+1, x[i]);
    return 0;
}`,
    viva: [
      { q: "What are the two main phases of Gauss elimination?", a: "Forward elimination (reduce A to upper-triangular form) and back-substitution (solve the triangular system from the bottom up)." },
      { q: "What is the multiplier used in elimination?", a: "mᵢₖ = aᵢₖ / aₖₖ, used in the row operation Rᵢ ← Rᵢ − mᵢₖ·Rₖ." },
      { q: "Why is partial pivoting needed?", a: "To avoid division by a zero/small pivot and to limit round-off error growth by putting the largest coefficient on the diagonal." },
      { q: "What is the difference between partial and complete pivoting?", a: "Partial pivoting searches only the current column for the largest entry; complete pivoting searches the whole remaining submatrix (rows and columns)." },
      { q: "What is the operation count of Gauss elimination?", a: "About (2/3)n³ floating-point operations for an n×n system." },
      { q: "When does Gauss elimination fail to give a unique solution?", a: "When the matrix is singular (zero determinant) — a zero pivot remains even after pivoting." },
      { q: "How is Gauss elimination related to LU decomposition?", a: "Forward elimination factorises A = LU, where L holds the multipliers and U is the upper-triangular result; solving then uses L and U." },
      { q: "What is the advantage of LU over repeating elimination?", a: "Once A = LU is computed, many right-hand sides b can be solved cheaply without re-eliminating." },
      { q: "How can the determinant be obtained from the elimination?", a: "It is the product of the pivots (diagonal of U), times (−1) for each row swap." },
      { q: "What is back-substitution?", a: "Solving the upper-triangular system starting from xₙ = cₙ/uₙₙ and working upward, substituting known unknowns." },
      { q: "Distinguish a direct method from an iterative method.", a: "Direct methods (Gauss) give the answer in a finite number of steps; iterative methods (Gauss–Seidel) refine an approximation until convergence." },
      { q: "Why is Gauss elimination inefficient for large sparse systems?", a: "Elimination causes fill-in (zeros become non-zero) and costs O(n³); iterative or sparse methods are preferred for large sparse matrices." },
      { q: "What is Gauss–Jordan elimination?", a: "An extension that eliminates above and below each pivot and scales pivots to 1, producing the identity (and directly the inverse/solution) without back-substitution." },
      { q: "How is the matrix inverse found using Gauss elimination?", a: "Augment A with the identity matrix and eliminate; when A becomes I the identity side becomes A⁻¹ (Gauss–Jordan)." },
      { q: "Give a physics application of solving a linear system.", a: "Solving Kirchhoff's-law equations for currents in a resistor network, or detector calibration relating measured signals to physical inputs." },
    ],
    problems: [
      { level: "Easy", text: "Solve the 2×2 system 2x + 3y = 8, 5x − y = −2 by Gauss elimination.", hint: "x = 0.235, y = 2.51 (approx)." },
      { level: "Easy", text: "Solve 2x + y − z = 8, −3x − y + 2z = −11, −2x + y + 2z = −3.", hint: "Solution: x = 2, y = 3, z = −1." },
      { level: "Easy", text: "Reduce the augmented matrix of a 3×3 system to upper-triangular form and list the row operations.", hint: "Eliminate column 1, then column 2." },
      { level: "Medium", text: "Solve a system where the first pivot is zero, demonstrating the need for partial pivoting.", hint: "Swap in a row with a non-zero leading entry." },
      { level: "Medium", text: "Compute the determinant of a 3×3 matrix as the product of pivots after elimination.", hint: "Track sign changes from row swaps." },
      { level: "Medium", text: "Use Gauss elimination to find the currents in a 3-loop resistor network from Kirchhoff's equations.", hint: "Set up R·I = V." },
      { level: "Medium", text: "Solve the same A for two different right-hand sides and explain the efficiency of LU factorisation.", hint: "Reuse L and U." },
      { level: "Advanced", text: "Implement LU decomposition (Doolittle) and solve A x = b via forward and back substitution.", hint: "L unit-lower, U upper." },
      { level: "Advanced", text: "Find the inverse of a 3×3 matrix using Gauss–Jordan elimination.", hint: "Augment with I and reduce to I | A⁻¹." },
      { level: "Advanced", text: "Construct an ill-conditioned 3×3 system and show how lack of pivoting amplifies round-off error.", hint: "Use nearly dependent rows." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 9 (Gauss elimination).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §2.1–2.3 (Gaussian elimination, LU).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI — Linear systems.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em>.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH — Matrix computing.</li>
      </ul>
    ),
  };
}

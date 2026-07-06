import { useMemo, useState } from "react";
import { matrixInverse, matMultiply } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function parseSquare(raw: string): { M: number[][]; error?: string } {
  const rows = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (rows.length < 1) return { M: [], error: "Enter at least one row." };
  const M: number[][] = [];
  for (const r of rows) {
    const nums = r.split(/[,\s\t]+/).map((p) => parseFloat(p)).filter((v) => !Number.isNaN(v));
    M.push(nums);
  }
  if (M.some((r) => r.length !== M.length)) return { M: [], error: `Matrix must be square.` };
  return { M };
}

function Grid({ M, accent = false }: { M: number[][]; accent?: boolean }) {
  return (
    <table className="font-mono text-sm">
      <tbody>
        {M.map((row, i) => (
          <tr key={i}>
            {row.map((v, j) => (
              <td key={j} className={`px-3 py-1.5 text-right ${accent ? "text-primary font-semibold" : ""}`}>
                {Math.abs(v) < 1e-10 ? "0" : (Number.isInteger(v) ? v : v.toFixed(4))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DEFAULT = `2 1 1\n1 3 2\n1 0 0`;

function InverseSim() {
  const [str, setStr] = useState(DEFAULT);
  const [run, setRun] = useState(0);

  const parsed = parseSquare(str);
  const valid = !parsed.error && parsed.M.length >= 1;

  const result = useMemo(() => {
    if (!valid) return null;
    const res = matrixInverse(parsed.M.map((r) => [...r]));
    const check = res.inverse ? matMultiply(parsed.M, res.inverse) : null;
    return { res, check };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setStr(DEFAULT); setRun((r) => r + 1); }}
      runLabel="Invert"
      controls={
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Square matrix (one row per line)</Label>
          <Textarea value={str} onChange={(e) => setStr(e.target.value)} rows={5} className="font-mono text-xs" />
          {parsed.error && <p className="text-[11px] text-rose-600">{parsed.error}</p>}
        </div>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Enter a square matrix">{parsed.error ?? "Provide an n×n matrix."}</Callout>
        ) : !result.res.inverse ? (
          <Callout tone="warn" title="Matrix is singular">
            det ≈ 0, so the inverse does not exist. Only non-singular (det ≠ 0) matrices are invertible.
          </Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatTile label="Determinant" value={result.res.determinant.toFixed(4)} />
              <StatTile label="Size" value={`${parsed.M.length}×${parsed.M.length}`} accent="text-emerald-600" />
              <StatTile label="Invertible?" value="Yes" accent="text-violet-600" />
            </div>

            <OutputBlock title="Result — the inverse A⁻¹">
              <div className="flex flex-wrap items-center gap-4">
                <div><div className="text-xs text-muted-foreground mb-1">A</div><Grid M={parsed.M} /></div>
                <div className="text-xl text-muted-foreground">⁻¹ =</div>
                <div><div className="text-xs text-muted-foreground mb-1">A⁻¹</div><Grid M={result.res.inverse} accent /></div>
              </div>
            </OutputBlock>

            <OutputBlock title="Verification — A · A⁻¹ should equal the identity I">
              <Grid M={result.check!} />
              <p className="text-xs text-muted-foreground mt-2">
                Small off-diagonal values (≈ 0) are round-off; a clean identity confirms the inverse is correct.
              </p>
            </OutputBlock>

            <OutputBlock title="Visualization — Gauss–Jordan row operations on [A | I]">
              <ol className="space-y-1 text-sm font-mono max-h-72 overflow-auto">
                {result.res.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0 w-6 text-right">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
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
          The <strong>inverse</strong> <MathTeX tex="A^{-1}" /> of a square matrix is the matrix that undoes it:
          <MathTeX tex="\,A A^{-1} = A^{-1} A = I" />. It exists only when <MathTeX tex="A" /> is non-singular
          (<MathTeX tex="\det A \neq 0" />), and it provides the compact solution <MathTeX tex="x = A^{-1}b" /> to a
          linear system.
        </p>
        <p>
          This experiment computes the inverse by <strong>Gauss–Jordan elimination</strong>: augment <MathTeX tex="A" />
          with the identity, reduce the left block to <MathTeX tex="I" />, and the right block becomes
          <MathTeX tex="\,A^{-1}" />.
        </p>
        <Callout tone="info" title="Existence test">
          A square matrix is invertible ⇔ its determinant is non-zero ⇔ its rows (and columns) are linearly independent.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Matrix inversion underlies many computational tasks:</p>
        <ul>
          <li><strong>Solving systems:</strong> x = A⁻¹b (though elimination is usually cheaper for one RHS).</li>
          <li><strong>Least squares:</strong> the normal-equation solution uses (AᵀA)⁻¹.</li>
          <li><strong>Covariance &amp; error analysis:</strong> inverse covariance (information) matrices.</li>
          <li><strong>Transformations:</strong> undoing coordinate or basis changes.</li>
          <li><strong>Control &amp; circuits:</strong> transfer functions and network analysis.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>By definition the inverse satisfies</p>
        <MathTeX block tex="A A^{-1} = A^{-1} A = I." />
        <h3>Adjoint formula (small matrices)</h3>
        <MathTeX block tex="A^{-1} = \frac{1}{\det A}\,\operatorname{adj}(A)," />
        <p>
          where <MathTeX tex="\operatorname{adj}(A)" /> is the transpose of the cofactor matrix. For 2×2,
        </p>
        <MathTeX block tex="\begin{pmatrix} a & b \\ c & d \end{pmatrix}^{-1} = \frac{1}{ad-bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}." />
        <h3>Gauss–Jordan method</h3>
        <p>
          Form the augmented matrix <MathTeX tex="[\,A \mid I\,]" /> and apply row operations until the left block is the
          identity:
        </p>
        <MathTeX block tex="[\,A \mid I\,] \;\xrightarrow{\text{row ops}}\; [\,I \mid A^{-1}\,]." />
        <p>
          Each pivot row is scaled to 1 and used to clear its column both above and below. The cost is
          <MathTeX tex="\,O(n^3)" />, the same order as elimination.
        </p>
        <Callout tone="tip" title="Prefer solving over inverting">
          To solve <MathTeX tex="Ax=b" /> for one <MathTeX tex="b" />, Gauss elimination or LU is faster and more stable
          than forming <MathTeX tex="A^{-1}" /> explicitly. Compute the inverse only when you truly need the matrix itself.
        </Callout>
        <FactGrid items={[
          { label: "Properties", value: "(A⁻¹)⁻¹ = A; (AB)⁻¹ = B⁻¹A⁻¹; (Aᵀ)⁻¹ = (A⁻¹)ᵀ; det(A⁻¹) = 1/det(A)." },
          { label: "Cautions", value: "Only for non-singular A; ill-conditioned matrices amplify round-off; inverting to solve is wasteful." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the n×n matrix A." },
        { label: "Augment A with the identity to form [A | I]." },
        { label: "For each column, select a non-zero pivot (partial pivoting) and normalise the pivot row." },
        { label: "Eliminate the pivot's column entries in all other rows (above and below)." },
        { label: "If a pivot column has no non-zero pivot, A is singular — stop." },
        { label: "When the left block is I, the right block is A⁻¹; verify A·A⁻¹ = I." },
      ],
      pseudocode: `INPUT A[n][n]
M ← [A | I]                 /* n × 2n */
FOR k = 0 TO n-1 DO
    pivot ← row of max |M[i][k]|, i≥k
    IF |M[pivot][k]| ≈ 0 THEN RETURN "singular"
    swap rows k, pivot
    divide row k by M[k][k]          /* pivot → 1 */
    FOR i ≠ k DO
        M[i][*] ← M[i][*] - M[i][k]*M[k][*]
OUTPUT right half of M = A^{-1}`,
      flowchart: ["Start", "Form [A | I]", "Pick & normalise pivot", "Clear column above & below", "Singular? → stop", "Left = I ?", "Output A^{-1}", "Stop"],
    },
    simulator: <InverseSim />,
    cFilename: "matrix_inverse.c",
    cCode: `/* Matrix inverse by Gauss-Jordan elimination
 * Compile: gcc matrix_inverse.c -o inv -lm
 */
#include <stdio.h>
#include <math.h>

int main(void) {
    int n, i, j, k;
    double a[10][20];

    printf("Enter order n: ");
    scanf("%d", &n);
    printf("Enter matrix:\\n");
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++) scanf("%lf", &a[i][j]);

    /* augment with identity */
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++) a[i][j+n] = (i == j) ? 1.0 : 0.0;

    for (k = 0; k < n; k++) {
        int piv = k;
        for (i = k+1; i < n; i++) if (fabs(a[i][k]) > fabs(a[piv][k])) piv = i;
        if (fabs(a[piv][k]) < 1e-12) { printf("Singular matrix.\\n"); return 0; }
        for (j = 0; j < 2*n; j++) { double t=a[k][j]; a[k][j]=a[piv][j]; a[piv][j]=t; }
        double pv = a[k][k];
        for (j = 0; j < 2*n; j++) a[k][j] /= pv;
        for (i = 0; i < n; i++) if (i != k) {
            double f = a[i][k];
            for (j = 0; j < 2*n; j++) a[i][j] -= f*a[k][j];
        }
    }

    printf("Inverse:\\n");
    for (i = 0; i < n; i++) { for (j = n; j < 2*n; j++) printf("%.4lf ", a[i][j]); printf("\\n"); }
    return 0;
}`,
    viva: [
      { q: "When does a matrix have an inverse?", a: "When it is square and non-singular (det ≠ 0), i.e. its rows/columns are linearly independent." },
      { q: "Define the inverse of a matrix.", a: "A⁻¹ satisfies A A⁻¹ = A⁻¹ A = I, the identity matrix." },
      { q: "What is the Gauss–Jordan method for inversion?", a: "Augment A with I, row-reduce the left block to I; the right block becomes A⁻¹." },
      { q: "Give the 2×2 inverse formula.", a: "1/(ad−bc) · [[d, −b], [−c, a]]." },
      { q: "What is the adjoint formula for the inverse?", a: "A⁻¹ = adj(A)/det(A), where adj(A) is the transpose of the cofactor matrix." },
      { q: "State (AB)⁻¹.", a: "(AB)⁻¹ = B⁻¹A⁻¹ (order reverses)." },
      { q: "What is det(A⁻¹)?", a: "1/det(A)." },
      { q: "Why is solving Ax=b by elimination preferred to computing A⁻¹?", a: "It is faster and numerically more stable; inverting does extra work and can amplify error." },
      { q: "What is the cost of Gauss–Jordan inversion?", a: "O(n³) operations." },
      { q: "How do you verify a computed inverse?", a: "Check that A·A⁻¹ equals the identity (to within round-off)." },
      { q: "What does an ill-conditioned matrix do to the inverse?", a: "Small input changes cause large changes in A⁻¹; round-off is amplified." },
      { q: "Give a use of the matrix inverse in data analysis.", a: "The inverse covariance (information) matrix in least-squares error propagation." },
    ],
    problems: [
      { level: "Easy", text: "Invert [[2,1,1],[1,3,2],[1,0,0]] and verify A·A⁻¹ = I.", hint: "det = −1." },
      { level: "Easy", text: "Find the inverse of [[4,7],[2,6]].", hint: "1/10·[[6,−7],[−2,4]]." },
      { level: "Easy", text: "Show a singular matrix has no inverse using [[1,2],[2,4]].", hint: "det = 0." },
      { level: "Medium", text: "Solve Ax=b using x = A⁻¹b for a 3×3 system and compare with Gauss elimination.", hint: "Same solution." },
      { level: "Medium", text: "Verify (AB)⁻¹ = B⁻¹A⁻¹ numerically.", hint: "Compute both sides." },
      { level: "Medium", text: "Show (Aᵀ)⁻¹ = (A⁻¹)ᵀ for a 2×2 example.", hint: "Transpose the inverse." },
      { level: "Advanced", text: "Investigate how the Hilbert matrix's inverse blows up with size (conditioning).", hint: "Hilbert is ill-conditioned." },
      { level: "Advanced", text: "Use the inverse to compute (AᵀA)⁻¹Aᵀ for a least-squares fit.", hint: "Pseudo-inverse." },
      { level: "Advanced", text: "Compare operation counts of inverting vs LU-solving for k right-hand sides.", hint: "LU reuses the factorisation." },
    ],
    references: (
      <ul>
        <li>G. Strang, <em>Introduction to Linear Algebra</em> — inverses &amp; Gauss–Jordan.</li>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — matrix inversion.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §2.1 (Gauss–Jordan elimination).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

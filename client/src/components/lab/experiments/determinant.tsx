import { useMemo, useState } from "react";
import { determinant } from "@/lib/lab/numerics";
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
  if (M.some((r) => r.length !== M.length)) return { M: [], error: `Matrix must be square (${M.length} rows ⇒ ${M.length} columns per row).` };
  return { M };
}

const DEFAULT = `2 -3 1\n2 0 -1\n1 4 5`;

function DeterminantSim() {
  const [str, setStr] = useState(DEFAULT);
  const [run, setRun] = useState(0);

  const parsed = parseSquare(str);
  const valid = !parsed.error && parsed.M.length >= 1;

  const result = useMemo(() => {
    if (!valid) return null;
    return determinant(parsed.M.map((r) => [...r]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setStr(DEFAULT); setRun((r) => r + 1); }}
      runLabel="Compute det"
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
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatTile label="Determinant" value={result.value.toFixed(4)} accent={Math.abs(result.value) < 1e-9 ? "text-rose-600" : "text-primary"} />
              <StatTile label="Size" value={`${parsed.M.length}×${parsed.M.length}`} accent="text-emerald-600" />
              <StatTile label="Row swaps" value={String(result.swaps)} accent="text-violet-600" />
            </div>

            <Callout tone={Math.abs(result.value) < 1e-9 ? "warn" : "success"} title={Math.abs(result.value) < 1e-9 ? "Singular matrix" : "Non-singular matrix"}>
              {Math.abs(result.value) < 1e-9
                ? "det ≈ 0 ⇒ the matrix is singular: its rows/columns are linearly dependent, it has no inverse, and A x = b has no unique solution."
                : "det ≠ 0 ⇒ the matrix is invertible and A x = b has a unique solution."}
            </Callout>

            <OutputBlock title="Visualization — reduction to upper-triangular form">
              <ol className="space-y-1 text-sm font-mono">
                {result.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0 w-6 text-right">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </OutputBlock>

            <OutputBlock title="Numerical results — upper-triangular matrix (pivots on the diagonal)">
              <div className="overflow-x-auto">
                <table className="text-sm font-mono mx-auto">
                  <tbody>
                    {result.upper.map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td key={j} className={`px-3 py-1.5 text-right ${i === j ? "text-primary font-semibold" : i > j ? "text-muted-foreground/50" : ""}`}>
                            {Math.abs(v) < 1e-12 ? "0" : v.toFixed(3)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                det = (sign from {result.swaps} swap{result.swaps === 1 ? "" : "s"}) × product of the highlighted pivots.
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
          The <strong>determinant</strong> is a single number that captures essential information about a square matrix:
          whether it is invertible, how it scales volume, and whether a linear system has a unique solution. A matrix is
          <em> singular</em> precisely when its determinant is zero.
        </p>
        <p>
          For small matrices the determinant can be found by cofactor expansion, but that costs
          <MathTeX tex="\,O(n!)" /> operations. This experiment uses the far more efficient approach of
          <strong> Gaussian elimination</strong>, where the determinant is the product of the pivots.
        </p>
        <Callout tone="info" title="One number, many meanings">
          <MathTeX tex="\det A = 0" /> ⇔ singular ⇔ rows/columns linearly dependent ⇔ no inverse ⇔ zero-volume image.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Determinants appear across physics and applied mathematics:</p>
        <ul>
          <li><strong>Solvability:</strong> a non-zero determinant guarantees a unique solution of A x = b (Cramer's rule).</li>
          <li><strong>Change of variables:</strong> the Jacobian determinant rescales integrals.</li>
          <li><strong>Eigenvalues:</strong> found from the characteristic equation det(A − λI) = 0.</li>
          <li><strong>Vector calculus:</strong> the cross product and volumes are determinants.</li>
          <li><strong>Stability:</strong> Wronskians and stability criteria use determinants.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>For a 2×2 and 3×3 matrix the determinant has the familiar closed forms</p>
        <MathTeX block tex="\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc," />
        <MathTeX block tex="\det\begin{pmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{pmatrix} = a_{11}(a_{22}a_{33}-a_{23}a_{32}) - a_{12}(\cdots) + a_{13}(\cdots)." />
        <h3>Cofactor expansion (Laplace)</h3>
        <MathTeX block tex="\det A = \sum_{j=1}^{n} (-1)^{i+j} a_{ij}\,M_{ij}," />
        <p>where <MathTeX tex="M_{ij}" /> is the minor. This is elegant but costs <MathTeX tex="O(n!)" /> — impractical beyond small <MathTeX tex="n" />.</p>
        <h3>Determinant by elimination</h3>
        <p>
          Reducing <MathTeX tex="A" /> to upper-triangular form <MathTeX tex="U" /> by row operations leaves the
          determinant unchanged except for sign flips on row swaps. Then
        </p>
        <MathTeX block tex="\det A = (-1)^{s}\prod_{i=1}^{n} u_{ii}," />
        <p>where <MathTeX tex="s" /> is the number of row interchanges and <MathTeX tex="u_{ii}" /> are the pivots. The cost drops to <MathTeX tex="O(n^3)" />.</p>
        <Callout tone="tip" title="Useful properties">
          <MathTeX tex="\det(AB)=\det A\,\det B" />, <MathTeX tex="\;\det(A^{T})=\det A" />,
          <MathTeX tex="\;\det(A^{-1})=1/\det A" />, and a zero row/column forces <MathTeX tex="\det A=0" />.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Elimination gives O(n³) cost; pivots reveal singularity; determinant is a by-product of solving." },
          { label: "Cautions", value: "Cofactor expansion is O(n!); round-off in near-singular cases; scale first to detect true zeros." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the n×n matrix." },
        { label: "For each column, choose the largest-magnitude pivot (partial pivoting); count row swaps." },
        { label: "If a pivot is (near) zero after pivoting, the determinant is zero." },
        { label: "Eliminate entries below each pivot with row operations (these don't change det)." },
        { label: "Multiply the diagonal pivots of the resulting triangular matrix." },
        { label: "Apply the sign (−1)^(number of swaps) and output the determinant." },
      ],
      pseudocode: `INPUT A[n][n];  s ← 0
FOR k = 0 TO n-1 DO
    pivot ← row of max |A[i][k]|, i≥k
    IF |A[pivot][k]| ≈ 0 THEN RETURN 0
    IF pivot ≠ k THEN swap rows; s ← s+1
    FOR i = k+1 TO n-1 DO
        f ← A[i][k]/A[k][k]
        A[i][*] ← A[i][*] - f*A[k][*]
det ← (-1)^s * Π A[i][i]
OUTPUT det`,
      flowchart: ["Start", "Read n×n matrix", "Partial pivot (count swaps)", "Pivot ≈ 0 ? → det=0", "Eliminate below pivot", "det = (−1)^s · Π pivots", "Output det", "Stop"],
    },
    simulator: <DeterminantSim />,
    cFilename: "determinant.c",
    cCode: `/* Determinant of an n x n matrix by Gaussian elimination
 * Compile: gcc determinant.c -o det -lm
 */
#include <stdio.h>
#include <math.h>

int main(void) {
    int n, i, j, k, s = 0;
    double a[10][10], det = 1.0;

    printf("Enter order n: ");
    scanf("%d", &n);
    printf("Enter matrix:\\n");
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) scanf("%lf", &a[i][j]);

    for (k = 0; k < n; k++) {
        int piv = k;
        for (i = k+1; i < n; i++) if (fabs(a[i][k]) > fabs(a[piv][k])) piv = i;
        if (fabs(a[piv][k]) < 1e-12) { det = 0; break; }
        if (piv != k) { for (j = 0; j < n; j++) { double t=a[k][j]; a[k][j]=a[piv][j]; a[piv][j]=t; } s++; }
        for (i = k+1; i < n; i++) {
            double f = a[i][k]/a[k][k];
            for (j = k; j < n; j++) a[i][j] -= f*a[k][j];
        }
    }
    if (det != 0) { for (i = 0; i < n; i++) det *= a[i][i]; if (s % 2) det = -det; }

    printf("Determinant = %.4lf\\n", det);
    return 0;
}`,
    viva: [
      { q: "What does a zero determinant mean?", a: "The matrix is singular: its rows/columns are linearly dependent, it has no inverse, and A x = b lacks a unique solution." },
      { q: "Write the determinant of a 2×2 matrix.", a: "det = ad − bc." },
      { q: "What is cofactor (Laplace) expansion and its cost?", a: "det = Σⱼ (−1)^{i+j} aᵢⱼ Mᵢⱼ; it costs O(n!) operations." },
      { q: "How is the determinant found by Gaussian elimination?", a: "Reduce to upper triangular; det = (−1)^(row swaps) × product of pivots. Cost O(n³)." },
      { q: "Do elementary row-elimination operations change the determinant?", a: "Adding a multiple of one row to another leaves det unchanged; swapping rows flips its sign; scaling a row scales det." },
      { q: "State det(AB).", a: "det(AB) = det(A)·det(B)." },
      { q: "How does transposing affect the determinant?", a: "det(Aᵀ) = det(A)." },
      { q: "What is det(A⁻¹)?", a: "1/det(A), provided A is non-singular." },
      { q: "When is the determinant of a triangular matrix easy?", a: "It is just the product of the diagonal entries." },
      { q: "How is the determinant used to find eigenvalues?", a: "By solving the characteristic equation det(A − λI) = 0." },
      { q: "Why prefer elimination over cofactor expansion?", a: "O(n³) versus O(n!): elimination is vastly faster for n beyond about 3–4." },
      { q: "What is the Jacobian determinant used for?", a: "Rescaling multivariable integrals under a change of variables." },
    ],
    problems: [
      { level: "Easy", text: "Compute the determinant of [[2,-3,1],[2,0,-1],[1,4,5]].", hint: "= 49." },
      { level: "Easy", text: "Find det[[1,2],[3,4]].", hint: "ad − bc = −2." },
      { level: "Easy", text: "Show a matrix with two identical rows has determinant 0.", hint: "Linearly dependent rows." },
      { level: "Medium", text: "Verify det(Aᵀ) = det(A) for a 3×3 example.", hint: "Compute both." },
      { level: "Medium", text: "Use elimination to find the determinant, tracking the sign from row swaps.", hint: "(−1)^swaps." },
      { level: "Medium", text: "Confirm det(AB) = det(A)det(B) with two 2×2 matrices.", hint: "Compute each side." },
      { level: "Advanced", text: "Solve a 3×3 system by Cramer's rule using determinants.", hint: "xᵢ = det(Aᵢ)/det(A)." },
      { level: "Advanced", text: "Find the eigenvalues of a 2×2 matrix from det(A − λI) = 0.", hint: "Quadratic in λ." },
      { level: "Advanced", text: "Show numerically that cofactor expansion becomes infeasible as n grows (time vs n).", hint: "O(n!) explosion." },
    ],
    references: (
      <ul>
        <li>G. Strang, <em>Introduction to Linear Algebra</em> — determinants.</li>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Gauss elimination &amp; determinants.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §2 (LU decomposition &amp; determinant).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

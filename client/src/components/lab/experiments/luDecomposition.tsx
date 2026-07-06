import { useMemo, useState } from "react";
import { luDecomposition } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/lab/ParamControl";
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
  if (M.some((r) => r.length !== M.length)) return { M: [], error: "Matrix must be square." };
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
                {Math.abs(v) < 1e-10 ? "0" : (Number.isInteger(v) ? v : v.toFixed(3))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DEFAULT = `4 3 -1\n-2 -4 5\n1 2 6`;

function LUSim() {
  const [str, setStr] = useState(DEFAULT);
  const [bStr, setB] = useState("2, 1, 3");
  const [run, setRun] = useState(0);

  const parsed = parseSquare(str);
  const b = bStr.split(/[,\s]+/).map((s) => parseFloat(s)).filter((v) => !Number.isNaN(v));
  const bValid = parsed.M.length > 0 && b.length === parsed.M.length;
  const valid = !parsed.error && parsed.M.length >= 1;

  const result = useMemo(() => {
    if (!valid) return null;
    return luDecomposition(parsed.M.map((r) => [...r]), bValid ? [...b] : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setStr(DEFAULT); setB("2, 1, 3"); setRun((r) => r + 1); }}
      runLabel="Factorise"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Square matrix A</Label>
            <Textarea value={str} onChange={(e) => setStr(e.target.value)} rows={5} className="font-mono text-xs" />
            {parsed.error && <p className="text-[11px] text-rose-600">{parsed.error}</p>}
          </div>
          <TextField label="Right-hand side b (optional, to solve Ax=b)" value={bStr} onChange={setB}
            hint={parsed.M.length && !bValid ? `Need ${parsed.M.length} values to solve.` : "Comma separated."} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Enter a square matrix">{parsed.error ?? "Provide an n×n matrix."}</Callout>
        ) : !result.ok ? (
          <Callout tone="warn" title="Decomposition failed">{result.message} Try reordering the rows (a pivoted LU is needed).</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatTile label="Size" value={`${parsed.M.length}×${parsed.M.length}`} />
              <StatTile label="Factorisation" value="A = L·U" accent="text-emerald-600" />
              <StatTile label="System solved?" value={result.solution ? "Yes" : "No (no b)"} accent="text-violet-600" />
            </div>

            <OutputBlock title="Result — lower (L) and upper (U) factors">
              <div className="flex flex-wrap items-center gap-6">
                <div><div className="text-xs text-muted-foreground mb-1">L (unit lower)</div><Grid M={result.L} accent /></div>
                <div><div className="text-xs text-muted-foreground mb-1">U (upper)</div><Grid M={result.U} accent /></div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Doolittle's method puts 1's on L's diagonal. Multiplying L·U reproduces the original A.
              </p>
            </OutputBlock>

            {result.solution && (
              <OutputBlock title="Solution of A x = b via forward then back substitution">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.solution.map((v, i) => (
                    <StatTile key={i} label={`x${i + 1}`} value={v.toFixed(5)} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Solve <MathTeX tex="Ly=b" /> downward, then <MathTeX tex="Ux=y" /> upward — two cheap triangular
                  solves reuse the single factorisation.
                </p>
              </OutputBlock>
            )}
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
          <strong>LU decomposition</strong> factors a square matrix into a product of a <em>lower</em>-triangular matrix
          <MathTeX tex="\,L" /> and an <em>upper</em>-triangular matrix <MathTeX tex="U" />, so that
          <MathTeX tex="\,A = LU" />. It is essentially Gaussian elimination with the multipliers stored, and it is the
          workhorse behind most direct linear-system solvers.
        </p>
        <p>
          Its great advantage: once <MathTeX tex="A=LU" /> is computed, any number of systems
          <MathTeX tex="\,Ax=b" /> with different right-hand sides can be solved cheaply by two triangular
          substitutions — without repeating the expensive elimination.
        </p>
        <Callout tone="info" title="Factor once, solve many">
          The <MathTeX tex="O(n^3)" /> factorisation is done a single time; each new <MathTeX tex="b" /> then costs only
          <MathTeX tex="\,O(n^2)" />.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>LU factorisation is central to scientific and engineering computation:</p>
        <ul>
          <li><strong>Repeated solves:</strong> circuit/structural analysis with many load cases (same A, many b).</li>
          <li><strong>Determinants:</strong> det A = product of U's diagonal (times pivot sign).</li>
          <li><strong>Matrix inversion:</strong> solve A xⱼ = eⱼ for each identity column.</li>
          <li><strong>Implicit ODE/PDE solvers:</strong> re-solving linear systems each time step.</li>
          <li><strong>Least squares &amp; Kalman filters:</strong> underlying linear algebra.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>We seek <MathTeX tex="A = LU" /> with</p>
        <MathTeX block tex="L = \begin{pmatrix} 1 & 0 & 0 \\ l_{21} & 1 & 0 \\ l_{31} & l_{32} & 1 \end{pmatrix}, \qquad U = \begin{pmatrix} u_{11} & u_{12} & u_{13} \\ 0 & u_{22} & u_{23} \\ 0 & 0 & u_{33} \end{pmatrix}." />
        <h3>Doolittle's algorithm</h3>
        <p>Matching entries of <MathTeX tex="LU=A" /> gives explicit formulas, computed row by row:</p>
        <MathTeX block tex="u_{ik} = a_{ik} - \sum_{j=1}^{i-1} l_{ij}u_{jk}, \qquad l_{ki} = \frac{1}{u_{ii}}\!\left(a_{ki} - \sum_{j=1}^{i-1} l_{kj}u_{ji}\right)." />
        <p>(Crout's variant instead puts the 1's on <MathTeX tex="U" />'s diagonal.)</p>
        <h3>Solving A x = b</h3>
        <p>With <MathTeX tex="A=LU" />, the system <MathTeX tex="LUx=b" /> is split into two triangular solves:</p>
        <MathTeX block tex="Ly = b \;\text{(forward substitution)}, \qquad Ux = y \;\text{(back substitution)}." />
        <h3>Pivoting</h3>
        <p>
          If a pivot <MathTeX tex="u_{ii}" /> vanishes, plain Doolittle fails; <strong>partial pivoting</strong> yields
          <MathTeX tex="\,PA = LU" /> (with a permutation matrix <MathTeX tex="P" />) and restores stability.
        </p>
        <Callout tone="tip" title="Relation to Gauss elimination">
          <MathTeX tex="U" /> is exactly the upper-triangular matrix from Gaussian elimination, and <MathTeX tex="L" />
          stores the elimination multipliers — the same work, saved for reuse.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Reuse for many RHS; cheap determinant & inverse; O(n²) per extra solve after one O(n³) factorisation." },
          { label: "Limitations", value: "Needs pivoting for stability/zero pivots; O(n³) setup; not ideal for very large sparse systems." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read the n×n matrix A (and optionally a right-hand side b)." },
        { label: "Initialise L = I and U = 0." },
        { label: "For each row i, compute U's entries uᵢₖ = aᵢₖ − Σ lᵢⱼuⱼₖ." },
        { label: "Compute L's entries lₖᵢ = (aₖᵢ − Σ lₖⱼuⱼᵢ)/uᵢᵢ." },
        { label: "To solve Ax=b: forward-substitute Ly=b, then back-substitute Ux=y." },
        { label: "Output L, U and (if requested) the solution x." },
      ],
      pseudocode: `INPUT A[n][n]
FOR i = 0 TO n-1 DO
    FOR k = i TO n-1 DO
        U[i][k] ← A[i][k] - Σ_{j<i} L[i][j]*U[j][k]
    L[i][i] ← 1
    FOR k = i+1 TO n-1 DO
        L[k][i] ← (A[k][i] - Σ_{j<i} L[k][j]*U[j][i]) / U[i][i]
/* solve */
FORWARD:  L y = b
BACK:     U x = y
OUTPUT L, U, x`,
      flowchart: ["Start", "Read A (and b)", "Row i: compute U row", "Compute L column", "i < n ?", "Ly=b, Ux=y", "Output L, U, x", "Stop"],
    },
    simulator: <LUSim />,
    cFilename: "lu_decomposition.c",
    cCode: `/* LU Decomposition (Doolittle) and solution of A x = b
 * Compile: gcc lu_decomposition.c -o lu -lm
 */
#include <stdio.h>

int main(void) {
    int n, i, j, k;
    double A[10][10], L[10][10] = {0}, U[10][10] = {0}, b[10], y[10], x[10], s;

    printf("Enter order n: ");
    scanf("%d", &n);
    printf("Enter matrix A:\\n");
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) scanf("%lf", &A[i][j]);
    printf("Enter b:\\n");
    for (i = 0; i < n; i++) scanf("%lf", &b[i]);

    for (i = 0; i < n; i++) {
        for (k = i; k < n; k++) {                 /* U */
            s = 0; for (j = 0; j < i; j++) s += L[i][j]*U[j][k];
            U[i][k] = A[i][k] - s;
        }
        L[i][i] = 1.0;
        for (k = i+1; k < n; k++) {                /* L */
            s = 0; for (j = 0; j < i; j++) s += L[k][j]*U[j][i];
            L[k][i] = (A[k][i] - s) / U[i][i];
        }
    }

    for (i = 0; i < n; i++) {                       /* Ly = b */
        s = b[i]; for (j = 0; j < i; j++) s -= L[i][j]*y[j];
        y[i] = s;
    }
    for (i = n-1; i >= 0; i--) {                    /* Ux = y */
        s = y[i]; for (j = i+1; j < n; j++) s -= U[i][j]*x[j];
        x[i] = s / U[i][i];
    }

    printf("Solution:\\n");
    for (i = 0; i < n; i++) printf("x%d = %.5lf\\n", i+1, x[i]);
    return 0;
}`,
    viva: [
      { q: "What is LU decomposition?", a: "Factoring a square matrix as A = LU, with L lower-triangular and U upper-triangular." },
      { q: "What is Doolittle's method?", a: "An LU scheme that fixes 1's on the diagonal of L and computes U and L row by row." },
      { q: "How does Crout's method differ?", a: "It places the 1's on the diagonal of U instead of L." },
      { q: "How do you solve Ax=b once A=LU is known?", a: "Solve Ly=b by forward substitution, then Ux=y by back substitution." },
      { q: "Why is LU better than repeating Gauss elimination for many RHS?", a: "The O(n³) factorisation is reused; each new b costs only O(n²) via two triangular solves." },
      { q: "How is the determinant obtained from LU?", a: "det A = product of U's diagonal entries (times the sign of any row permutations)." },
      { q: "When does plain LU fail, and what fixes it?", a: "When a pivot uᵢᵢ becomes zero; partial pivoting (PA = LU) restores it." },
      { q: "What is the relationship between U and Gaussian elimination?", a: "U is exactly the upper-triangular matrix produced by Gaussian elimination; L stores the multipliers." },
      { q: "What is forward substitution?", a: "Solving a lower-triangular system Ly=b from the first equation downward." },
      { q: "What is back substitution?", a: "Solving an upper-triangular system Ux=y from the last equation upward." },
      { q: "How can LU be used to invert a matrix?", a: "Solve A xⱼ = eⱼ (each identity column) using the same L and U; the xⱼ form A⁻¹." },
      { q: "What is the cost of LU factorisation?", a: "About (2/3)n³ operations, the same order as Gaussian elimination." },
    ],
    problems: [
      { level: "Easy", text: "Factor [[4,3],[6,3]] into L and U by Doolittle.", hint: "l₂₁ = 1.5, U = [[4,3],[0,−1.5]]." },
      { level: "Easy", text: "Verify L·U reproduces the original matrix.", hint: "Multiply the factors." },
      { level: "Easy", text: "Solve Ly = b by forward substitution for a 3×3 unit-lower L.", hint: "y₁ first." },
      { level: "Medium", text: "Use one LU factorisation to solve Ax=b for two different b vectors.", hint: "Reuse L, U." },
      { level: "Medium", text: "Compute det A as the product of U's diagonal for a 3×3 matrix.", hint: "No extra work needed." },
      { level: "Medium", text: "Show a case where a zero pivot forces partial pivoting.", hint: "a₁₁ = 0." },
      { level: "Advanced", text: "Invert a 3×3 matrix using LU by solving against each identity column.", hint: "Three triangular solves." },
      { level: "Advanced", text: "Implement partial pivoting to get PA = LU and explain the permutation matrix.", hint: "Track row swaps in P." },
      { level: "Advanced", text: "Compare the cost of LU-solving k systems versus computing A⁻¹ and multiplying.", hint: "LU wins for moderate k." },
    ],
    references: (
      <ul>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §2.3 (LU decomposition).</li>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 10 (LU factorisation).</li>
        <li>G. Strang, <em>Introduction to Linear Algebra</em> — A = LU.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

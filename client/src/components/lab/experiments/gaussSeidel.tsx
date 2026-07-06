import { useMemo, useState } from "react";
import { gaussSeidel } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { NumberField } from "@/components/lab/ParamControl";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ResultsTable from "@/components/lab/ResultsTable";
import { LineFigure } from "@/components/lab/Charts";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

const DEFAULT_MATRIX = `4  1  2   4
3  5  1   7
1  1  3   3`;

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

/** Check (strict) diagonal dominance — sufficient condition for convergence. */
function isDiagonallyDominant(A: number[][]): boolean {
  return A.every((row, i) => {
    const diag = Math.abs(row[i]);
    const off = row.reduce((s, v, j) => s + (j === i ? 0 : Math.abs(v)), 0);
    return diag >= off && diag > 0;
  });
}

function GaussSeidelSim() {
  const [text, setText] = useState(DEFAULT_MATRIX);
  const [tolStr, setTolStr] = useState("0.0001");
  const [run, setRun] = useState(0);

  const parsed = parseMatrix(text);
  const tol = parseFloat(tolStr);
  const tolValid = Number.isFinite(tol) && tol > 0;
  const valid = !parsed.error && parsed.A.length >= 2 && tolValid;

  const result = useMemo(() => {
    if (!valid) return null;
    if (parsed.A.some((row, i) => Math.abs(row[i]) < 1e-14)) return { error: "A zero appears on the diagonal — reorder the equations so no diagonal entry is zero." };
    const res = gaussSeidel(parsed.A.map((r) => [...r]), [...parsed.b], tol, 200);
    if (res.steps.some((s) => s.x.some((v) => !Number.isFinite(v)))) return { error: "Iteration diverged — the system is not diagonally dominant." };
    const dominant = isDiagonallyDominant(parsed.A);
    return { res, dominant };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const n = parsed.A.length;
  const tableRows = result && "res" in result && result.res ? result.res.steps.map((s) => ({
    iter: s.iter,
    ...Object.fromEntries(s.x.map((v, i) => [`x${i + 1}`, v])),
    error: s.error,
  })) : [];

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setText(DEFAULT_MATRIX); setTolStr("0.0001"); setRun((r) => r + 1); }}
      runLabel="Iterate"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Augmented matrix [A | b]</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="font-mono text-xs" />
            <p className="text-[11px] text-muted-foreground">One equation per row. Make it diagonally dominant for convergence.</p>
            {parsed.error && <p className="text-[11px] text-rose-600">{parsed.error}</p>}
          </div>
          <NumberField label="Tolerance" value={tolStr} onChange={setTolStr} step="any" error={tolValid ? undefined : "Enter a positive tolerance."} />
        </>
      }
      output={
        !result ? (
          <Callout tone="warn" title="Enter a square system">Provide n equations with n coefficients and a RHS each.</Callout>
        ) : "error" in result ? (
          <Callout tone="warn" title="Cannot iterate">{result.error}</Callout>
        ) : (
          <>
            <div className={`grid grid-cols-2 ${n <= 3 ? "sm:grid-cols-4" : "sm:grid-cols-5"} gap-3`}>
              {result.res.solution.map((v, i) => (
                <StatTile key={i} label={`x${i + 1}`} value={v.toFixed(5)} />
              ))}
              <StatTile label="Iterations" value={String(result.res.steps.length)} accent="text-amber-600" />
            </div>

            {!result.dominant && (
              <Callout tone="warn" title="Not diagonally dominant">
                This system fails the strict diagonal-dominance test, so convergence is not guaranteed. It may
                still converge, converge slowly, or diverge — watch the error curve below.
              </Callout>
            )}
            {result.res.converged ? (
              <Callout tone="success" title="Converged">
                The iteration met the tolerance after {result.res.steps.length} sweeps.
              </Callout>
            ) : (
              <Callout tone="warn" title="Did not converge">
                The tolerance was not reached within the iteration cap.
              </Callout>
            )}

            <OutputBlock title="Visualization — convergence of the error">
              <LineFigure
                height={280}
                xKey="iter"
                xLabel="iteration"
                yLabel="max |Δx|"
                series={[{
                  name: "max change per sweep",
                  color: "#6366f1",
                  dataKey: "error",
                  dot: true,
                  data: result.res.steps.map((s) => ({ iter: s.iter, error: s.error })),
                }]}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Each sweep updates every unknown using the latest available values. For a diagonally dominant
                system the maximum change shrinks geometrically toward zero.
              </p>
            </OutputBlock>

            <OutputBlock title="Numerical results — iteration table">
              <ResultsTable
                rows={tableRows}
                columns={[
                  { key: "iter", header: "k" },
                  ...result.res.solution.map((_, i) => ({
                    key: `x${i + 1}`,
                    header: `x${i + 1}`,
                    render: (r: any) => (r[`x${i + 1}`] as number).toFixed(6),
                  })),
                  { key: "error", header: "max |Δx|", render: (r: any) => (r.error as number).toExponential(3) },
                ]}
                caption="Successive approximations; iteration stops when the largest change falls below the tolerance."
              />
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
          The <strong>Gauss–Seidel method</strong> solves a linear system <MathTeX tex="A\mathbf{x}=\mathbf{b}" />
          {" "}<em>iteratively</em>: starting from a guess, it repeatedly refines each unknown until the values
          stop changing. Crucially, it uses each freshly computed value <em>immediately</em> within the same
          sweep, which makes it converge faster than the related Jacobi method.
        </p>
        <p>
          Iterative solvers are the method of choice for the very large, sparse systems that arise when
          discretising physical fields — far cheaper in memory and time than direct elimination once the system
          is big.
        </p>
        <Callout tone="info" title="Refine, don't eliminate">
          Unlike Gauss elimination (a direct method), Gauss–Seidel never modifies the matrix — it just keeps
          improving an approximate solution until it converges.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Iterative linear solvers are central to large-scale computational physics:</p>
        <ul>
          <li><strong>Discretised PDEs:</strong> solving Laplace/Poisson equations for electrostatic and gravitational potentials.</li>
          <li><strong>Relaxation methods:</strong> steady-state heat conduction and fluid flow on grids.</li>
          <li><strong>Large sparse systems:</strong> finite-element structural and electromagnetic problems.</li>
          <li><strong>Power-flow &amp; network analysis:</strong> equilibrium of large coupled networks.</li>
          <li><strong>Image / field reconstruction:</strong> iterative tomographic and inverse-problem solvers.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <p>
          Split each equation to isolate the diagonal unknown. The Gauss–Seidel update for unknown
          <MathTeX tex="\,x_i" /> at iteration <MathTeX tex="k+1" /> is:
        </p>
        <MathTeX block tex="x_i^{(k+1)} = \frac{1}{a_{ii}}\left( b_i - \sum_{j<i} a_{ij}\,x_j^{(k+1)} - \sum_{j>i} a_{ij}\,x_j^{(k)} \right)." />
        <p>
          Note the first sum uses <strong>already-updated</strong> values from the current sweep
          (<MathTeX tex="x_j^{(k+1)}" />), whereas Jacobi would use only old values — this reuse is what
          accelerates convergence.
        </p>
        <h3>Convergence condition</h3>
        <p>
          The iteration is guaranteed to converge (from any start) if <MathTeX tex="A" /> is
          <strong> strictly diagonally dominant</strong>:
        </p>
        <MathTeX block tex="|a_{ii}| > \sum_{j\neq i} |a_{ij}| \quad \text{for every row } i," />
        <p>
          or if <MathTeX tex="A" /> is symmetric positive-definite. If the diagonal is weak, the method may
          converge slowly or diverge — often curable by reordering the equations.
        </p>
        <Callout tone="tip" title="Stopping criterion">
          Iterate until the largest change <MathTeX tex="\max_i |x_i^{(k+1)} - x_i^{(k)}|" /> drops below a
          chosen tolerance.
        </Callout>
        <FactGrid items={[
          { label: "Advantages", value: "Cheap per iteration and memory-light for sparse systems; uses latest values for faster convergence than Jacobi; easy to program." },
          { label: "Limitations", value: "Converges only under diagonal dominance / SPD; can be slow or diverge otherwise; inherently sequential (harder to parallelise than Jacobi)." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Rearrange the equations so the matrix is diagonally dominant (no zero on the diagonal)." },
        { label: "Choose an initial guess (commonly x = 0) and a tolerance." },
        { label: "For each unknown i, solve its equation for xᵢ using the most recent values of the others." },
        { label: "Use updated values immediately within the same sweep." },
        { label: "Compute the maximum change across all unknowns." },
        { label: "Repeat sweeps until the maximum change is below the tolerance." },
      ],
      pseudocode: `INPUT A[n][n], b[n], tol, maxIter
x[1..n] ← 0
FOR k = 1 TO maxIter DO
    err ← 0
    FOR i = 1 TO n DO
        s ← b[i]
        FOR j = 1 TO n, j ≠ i DO  s ← s − A[i][j]*x[j]
        xnew ← s / A[i][i]
        err ← max(err, |xnew − x[i]|)
        x[i] ← xnew          // use immediately
    IF err < tol THEN STOP
OUTPUT x`,
      flowchart: ["Start", "Read A, b, tol", "Guess x = 0", "Update each x_i (latest values)", "max |Δx| < tol ?", "Output x", "Stop"],
    },
    simulator: <GaussSeidelSim />,
    cFilename: "gauss_seidel.c",
    cCode: `/* Gauss-Seidel iterative solver  A x = b
 * Compile: gcc gauss_seidel.c -o gs -lm
 */
#include <stdio.h>
#include <math.h>
#define N 10

int main(void) {
    int n, i, j, k, maxIter = 200;
    double a[N][N], b[N], x[N] = {0}, tol, err;

    printf("Enter number of equations: ");
    scanf("%d", &n);
    printf("Enter matrix A row by row:\\n");
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++) scanf("%lf", &a[i][j]);
    printf("Enter RHS vector b:\\n");
    for (i = 0; i < n; i++) scanf("%lf", &b[i]);
    printf("Enter tolerance: ");
    scanf("%lf", &tol);

    for (k = 1; k <= maxIter; k++) {
        err = 0.0;
        for (i = 0; i < n; i++) {
            double s = b[i];
            for (j = 0; j < n; j++) if (j != i) s -= a[i][j] * x[j];
            double xnew = s / a[i][i];
            if (fabs(xnew - x[i]) > err) err = fabs(xnew - x[i]);
            x[i] = xnew;                 /* use immediately */
        }
        if (err < tol) break;
    }

    printf("Converged in %d iterations:\\n", k);
    for (i = 0; i < n; i++) printf("x%d = %.6lf\\n", i + 1, x[i]);
    return 0;
}`,
    viva: [
      { q: "What kind of method is Gauss–Seidel?", a: "An iterative method for solving linear systems A x = b — it refines an approximate solution rather than computing it directly." },
      { q: "Write the Gauss–Seidel update formula.", a: "xᵢ = (bᵢ − Σ_{j<i} aᵢⱼxⱼ(new) − Σ_{j>i} aᵢⱼxⱼ(old)) / aᵢᵢ." },
      { q: "How does Gauss–Seidel differ from the Jacobi method?", a: "Gauss–Seidel uses newly updated values immediately within the same sweep; Jacobi uses only previous-iteration values." },
      { q: "Which usually converges faster, Jacobi or Gauss–Seidel?", a: "Gauss–Seidel, because it incorporates the latest information — typically about twice as fast." },
      { q: "State a sufficient condition for convergence.", a: "Strict diagonal dominance (|aᵢᵢ| > Σ_{j≠i}|aᵢⱼ|) or A symmetric positive-definite." },
      { q: "What happens if the matrix is not diagonally dominant?", a: "Convergence is not guaranteed — it may converge slowly or diverge; reordering rows can help." },
      { q: "Why must diagonal entries be non-zero?", a: "Each update divides by aᵢᵢ, so a zero diagonal makes the formula undefined." },
      { q: "What is a typical stopping criterion?", a: "When the maximum change max|xᵢ(new) − xᵢ(old)| falls below a set tolerance, or a residual norm is small." },
      { q: "When are iterative methods preferred over direct ones?", a: "For large sparse systems, where they save memory and cost compared with O(n³) elimination." },
      { q: "What is the SOR method?", a: "Successive Over-Relaxation — Gauss–Seidel with a relaxation factor ω to accelerate convergence." },
      { q: "Is Gauss–Seidel easy to parallelise?", a: "Not as easily as Jacobi, because each update depends on values computed earlier in the same sweep." },
      { q: "What is the role of the initial guess?", a: "It affects the number of iterations but not the converged solution (for a convergent system); x = 0 is common." },
      { q: "How is the residual used to monitor convergence?", a: "r = b − A x; its norm should shrink toward zero as the iteration converges." },
      { q: "Give a physics problem solved by Gauss–Seidel.", a: "Relaxation solution of Laplace's/Poisson's equation for the potential on a grid." },
      { q: "Direct vs iterative — one-line distinction.", a: "Direct (Gauss elimination) finishes in finite steps; iterative (Gauss–Seidel) approaches the answer asymptotically." },
    ],
    problems: [
      { level: "Easy", text: "Solve 4x+y+2z=4, 3x+5y+z=7, x+y+3z=3 by Gauss–Seidel to tol=1e−4.", hint: "Diagonally dominant — converges quickly." },
      { level: "Easy", text: "Solve the 2×2 system 5x+2y=14, x+4y=10 starting from x=y=0.", hint: "Watch the error halve each sweep." },
      { level: "Easy", text: "Show why 1x+5y=… , 4x+1y=… diverges and fix it by swapping rows.", hint: "Make the big coefficients diagonal." },
      { level: "Medium", text: "Compare the number of iterations of Jacobi vs Gauss–Seidel for the same system.", hint: "Gauss–Seidel needs roughly half." },
      { level: "Medium", text: "Study how the iteration count grows as the system approaches losing diagonal dominance.", hint: "Convergence slows dramatically." },
      { level: "Medium", text: "Solve a 4×4 diagonally dominant system and tabulate the error per sweep.", hint: "Plot log(error) vs iteration — roughly linear." },
      { level: "Medium", text: "Investigate the effect of the initial guess on the number of iterations.", hint: "A good guess reduces sweeps, not the answer." },
      { level: "Advanced", text: "Implement SOR and find the relaxation factor ω that minimises iterations.", hint: "Optimal ω is often between 1 and 2." },
      { level: "Advanced", text: "Discretise 1-D Laplace's equation on 10 nodes and solve by Gauss–Seidel.", hint: "Tridiagonal, diagonally dominant system." },
      { level: "Advanced", text: "Show using the iteration matrix that the spectral radius < 1 implies convergence.", hint: "Convergence ⇔ ρ(M) < 1." },
    ],
    references: (
      <ul>
        <li>S. C. Chapra &amp; R. P. Canale, <em>Numerical Methods for Engineers</em> — Ch. 11 (Gauss–Seidel).</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — §19.5 (relaxation methods).</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI — Iterative solvers.</li>
        <li>N. J. Giordano &amp; H. Nakanishi, <em>Computational Physics</em> — Laplace/Poisson by relaxation.</li>
        <li>R. H. Landau et al., <em>Computational Physics</em>, Wiley-VCH.</li>
      </ul>
    ),
  };
}

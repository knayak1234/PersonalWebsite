import { useMemo, useState } from "react";
import { matMultiply, matTranspose } from "@/lib/lab/numerics";
import SimLayout, { StatTile, OutputBlock } from "@/components/lab/SimLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MathTeX from "@/components/lab/MathTeX";
import { Callout, FactGrid } from "@/components/lab/Content";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import type { ExperimentMeta } from "@/lib/lab/types";

function parseMatrix(raw: string): number[][] | null {
  const rows = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (!rows.length) return null;
  const M: number[][] = [];
  let cols = -1;
  for (const r of rows) {
    const nums = r.split(/[,\s\t]+/).map((p) => parseFloat(p)).filter((v) => !Number.isNaN(v));
    if (!nums.length) return null;
    if (cols === -1) cols = nums.length;
    else if (nums.length !== cols) return null;
    M.push(nums);
  }
  return M;
}

function MatrixGrid({ M, accent = false }: { M: number[][]; accent?: boolean }) {
  return (
    <div className="inline-block">
      <table className="font-mono text-sm">
        <tbody>
          {M.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} className={`px-3 py-1.5 text-right ${accent ? "text-primary font-semibold" : ""}`}>
                  {Number.isInteger(v) ? v : v.toFixed(3)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DEFAULT_A = `1 2\n3 4`;
const DEFAULT_B = `5 6\n7 8`;

function MatrixOpsSim() {
  const [aStr, setA] = useState(DEFAULT_A);
  const [bStr, setB] = useState(DEFAULT_B);
  const [run, setRun] = useState(0);

  const A = parseMatrix(aStr), B = parseMatrix(bStr);

  const result = useMemo(() => {
    if (!A) return { error: "Matrix A is malformed (rows must have equal length)." };
    const AT = matTranspose(A);
    let product: number[][] | null = null;
    let mulNote = "";
    if (!B) mulNote = "Matrix B is malformed.";
    else if (A[0].length !== B.length) mulNote = `Cannot multiply: A is ${A.length}×${A[0].length}, B is ${B.length}×${B[0].length}. Inner dimensions must match.`;
    else product = matMultiply(A, B);
    return { AT, product, mulNote, BT: B ? matTranspose(B) : null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <SimLayout
      onRun={() => setRun((r) => r + 1)}
      onReset={() => { setA(DEFAULT_A); setB(DEFAULT_B); setRun((r) => r + 1); }}
      runLabel="Compute"
      controls={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Matrix A (rows on separate lines)</Label>
            <Textarea value={aStr} onChange={(e) => setA(e.target.value)} rows={4} className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Matrix B</Label>
            <Textarea value={bStr} onChange={(e) => setB(e.target.value)} rows={4} className="font-mono text-xs" />
          </div>
        </>
      }
      output={
        result.error ? (
          <Callout tone="warn" title="Input error">{result.error}</Callout>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatTile label="A dimensions" value={A ? `${A.length}×${A[0].length}` : "—"} />
              <StatTile label="B dimensions" value={B ? `${B.length}×${B[0].length}` : "—"} accent="text-emerald-600" />
              <StatTile label="A·B dimensions" value={result.product ? `${result.product.length}×${result.product[0].length}` : "n/a"} accent="text-violet-600" />
            </div>

            <OutputBlock title="Transpose Aᵀ (rows ↔ columns)">
              <div className="flex flex-wrap items-center gap-6">
                <div><div className="text-xs text-muted-foreground mb-1">A</div><MatrixGrid M={A!} /></div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div><div className="text-xs text-muted-foreground mb-1">Aᵀ</div><MatrixGrid M={result.AT!} accent /></div>
              </div>
            </OutputBlock>

            <OutputBlock title="Matrix product A · B">
              {result.product ? (
                <div className="flex flex-wrap items-center gap-4">
                  <MatrixGrid M={A!} />
                  <div className="text-xl text-muted-foreground">×</div>
                  <MatrixGrid M={B!} />
                  <div className="text-xl text-muted-foreground">=</div>
                  <MatrixGrid M={result.product} accent />
                </div>
              ) : (
                <Callout tone="warn" title="Product not defined">{result.mulNote}</Callout>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Each entry <MathTeX tex="C_{ij} = \sum_k A_{ik}B_{kj}" /> is the dot product of row <MathTeX tex="i" /> of
                A with column <MathTeX tex="j" /> of B.
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
          <strong>Matrix multiplication</strong> and the <strong>transpose</strong> are the two most fundamental matrix
          operations. Almost every algorithm in linear algebra, computer graphics, quantum mechanics and machine learning
          is built from them. This experiment computes both directly from their definitions.
        </p>
        <p>
          Multiplication combines two matrices into one via row–column dot products, while the transpose simply reflects
          a matrix across its main diagonal, turning rows into columns.
        </p>
        <Callout tone="info" title="Conformability rule">
          <MathTeX tex="A_{m\times p}\,B_{p\times n}" /> is defined only when the inner dimensions match, giving a
          product of size <MathTeX tex="m\times n" />.
        </Callout>
      </>
    ),
    applications: (
      <>
        <p>Matrix operations are the language of physical transformations:</p>
        <ul>
          <li><strong>Rotations &amp; transformations:</strong> rotation, scaling and Lorentz transforms are matrix products.</li>
          <li><strong>Quantum mechanics:</strong> operators act on state vectors by matrix multiplication.</li>
          <li><strong>Coupled systems:</strong> state-space and normal-mode analysis.</li>
          <li><strong>Graphics:</strong> chaining transforms by multiplying their matrices.</li>
          <li><strong>Tensors &amp; stress:</strong> transpose relates a tensor to its adjoint/symmetry.</li>
        </ul>
      </>
    ),
    theory: (
      <>
        <h3>Matrix multiplication</h3>
        <p>
          For <MathTeX tex="A" /> of size <MathTeX tex="m\times p" /> and <MathTeX tex="B" /> of size
          <MathTeX tex="\,p\times n" />, the product <MathTeX tex="C=AB" /> is <MathTeX tex="m\times n" /> with entries
        </p>
        <MathTeX block tex="C_{ij} = \sum_{k=1}^{p} A_{ik}\,B_{kj}." />
        <p>
          The naïve algorithm costs <MathTeX tex="O(mnp)" /> multiply–adds. Multiplication is <em>associative</em> and
          <em> distributive</em> but <strong>not commutative</strong>: in general <MathTeX tex="AB \neq BA" />.
        </p>
        <h3>Transpose</h3>
        <p>The transpose interchanges rows and columns:</p>
        <MathTeX block tex="(A^{T})_{ij} = A_{ji}." />
        <p>Key identities include</p>
        <MathTeX block tex="(A^{T})^{T} = A, \qquad (A+B)^{T} = A^{T}+B^{T}, \qquad (AB)^{T} = B^{T}A^{T}." />
        <p>
          A matrix with <MathTeX tex="A^{T}=A" /> is <em>symmetric</em>; with <MathTeX tex="A^{T}=-A" /> it is
          <em> skew-symmetric</em>. These structures appear throughout physics (inertia tensors, Hamiltonians).
        </p>
        <Callout tone="tip" title="Order matters">
          Reversing the order of a product transposes: <MathTeX tex="(AB)^T=B^TA^T" />. Forgetting the swap is a common
          bug in graphics and physics code.
        </Callout>
        <FactGrid items={[
          { label: "Multiplication facts", value: "Associative & distributive; not commutative; O(mnp) cost; identity I is the neutral element." },
          { label: "Transpose facts", value: "(Aᵀ)ᵀ = A; (AB)ᵀ = BᵀAᵀ; symmetric if Aᵀ=A; used to form AᵀA in least squares." },
        ]} />
      </>
    ),
    algorithm: {
      steps: [
        { label: "Read matrices A (m×p) and B (p×n)." },
        { label: "For the transpose, set Aᵀ[j][i] = A[i][j] for all i, j." },
        { label: "Check conformability: columns of A must equal rows of B." },
        { label: "For each output entry (i,j), sum A[i][k]·B[k][j] over k." },
        { label: "Store the sum in C[i][j]." },
        { label: "Output Aᵀ and the product C." },
      ],
      pseudocode: `/* transpose */
FOR i,j:  AT[j][i] ← A[i][j]

/* product C = A(m×p) · B(p×n) */
FOR i = 0 TO m-1
  FOR j = 0 TO n-1
    C[i][j] ← 0
    FOR k = 0 TO p-1
      C[i][j] ← C[i][j] + A[i][k]*B[k][j]
OUTPUT AT, C`,
      flowchart: ["Start", "Read A, B", "Transpose A", "Dimensions match?", "Triple loop C=ΣA·B", "Output A^{T} and C", "Stop"],
    },
    simulator: <MatrixOpsSim />,
    cFilename: "matrix_ops.c",
    cCode: `/* Matrix multiplication and transpose
 * Compile: gcc matrix_ops.c -o matops
 */
#include <stdio.h>

int main(void) {
    int m, p, n, i, j, k;
    double A[10][10], B[10][10], C[10][10], AT[10][10];

    printf("Rows and cols of A: ");
    scanf("%d %d", &m, &p);
    printf("Enter A:\\n");
    for (i = 0; i < m; i++) for (j = 0; j < p; j++) scanf("%lf", &A[i][j]);

    printf("Cols of B (rows = %d): ", p);
    scanf("%d", &n);
    printf("Enter B:\\n");
    for (i = 0; i < p; i++) for (j = 0; j < n; j++) scanf("%lf", &B[i][j]);

    /* transpose of A */
    for (i = 0; i < m; i++) for (j = 0; j < p; j++) AT[j][i] = A[i][j];

    /* product C = A*B */
    for (i = 0; i < m; i++)
        for (j = 0; j < n; j++) {
            C[i][j] = 0;
            for (k = 0; k < p; k++) C[i][j] += A[i][k]*B[k][j];
        }

    printf("Transpose A^T:\\n");
    for (i = 0; i < p; i++) { for (j = 0; j < m; j++) printf("%.2lf ", AT[i][j]); printf("\\n"); }
    printf("Product A*B:\\n");
    for (i = 0; i < m; i++) { for (j = 0; j < n; j++) printf("%.2lf ", C[i][j]); printf("\\n"); }
    return 0;
}`,
    viva: [
      { q: "When is the product AB defined?", a: "When the number of columns of A equals the number of rows of B (inner dimensions match)." },
      { q: "What is the size of the product of an m×p and a p×n matrix?", a: "m×n." },
      { q: "Write the formula for an element of the product.", a: "Cᵢⱼ = Σₖ Aᵢₖ Bₖⱼ — the dot product of row i of A and column j of B." },
      { q: "Is matrix multiplication commutative?", a: "No; in general AB ≠ BA." },
      { q: "Is matrix multiplication associative?", a: "Yes; (AB)C = A(BC)." },
      { q: "What is the transpose of a matrix?", a: "The matrix with rows and columns interchanged: (Aᵀ)ᵢⱼ = Aⱼᵢ." },
      { q: "State the transpose of a product.", a: "(AB)ᵀ = BᵀAᵀ (order reverses)." },
      { q: "What is a symmetric matrix?", a: "One equal to its transpose, Aᵀ = A." },
      { q: "What is a skew-symmetric matrix?", a: "One with Aᵀ = −A; its diagonal entries are zero." },
      { q: "What is the computational cost of multiplying two n×n matrices naïvely?", a: "O(n³) multiply–add operations." },
      { q: "Where does AᵀA appear in numerical methods?", a: "In the normal equations of least-squares fitting." },
      { q: "What is the identity matrix's role?", a: "It is the multiplicative identity: AI = IA = A." },
    ],
    problems: [
      { level: "Easy", text: "Multiply [[1,2],[3,4]] by [[5,6],[7,8]].", hint: "[[19,22],[43,50]]." },
      { level: "Easy", text: "Write the transpose of a 2×3 matrix of your choice.", hint: "Result is 3×2." },
      { level: "Easy", text: "Show with a 2×2 example that AB ≠ BA.", hint: "Pick non-commuting matrices." },
      { level: "Medium", text: "Verify (AB)ᵀ = BᵀAᵀ numerically for two 2×2 matrices.", hint: "Compute both sides." },
      { level: "Medium", text: "Multiply a rotation matrix by a vector to rotate it 90°.", hint: "R(90°)=[[0,−1],[1,0]]." },
      { level: "Medium", text: "Form AᵀA for a 3×2 matrix A and note that it is symmetric.", hint: "(AᵀA)ᵀ = AᵀA." },
      { level: "Advanced", text: "Compare the multiply count of computing ABC as (AB)C vs A(BC) for non-square matrices.", hint: "Matrix-chain order matters." },
      { level: "Advanced", text: "Implement multiplication for large matrices and time it, confirming O(n³) scaling.", hint: "Double n, expect ×8." },
      { level: "Advanced", text: "Show that any square matrix splits into symmetric + skew-symmetric parts.", hint: "½(A+Aᵀ) + ½(A−Aᵀ)." },
    ],
    references: (
      <ul>
        <li>G. Strang, <em>Introduction to Linear Algebra</em> — matrix multiplication &amp; transpose.</li>
        <li>W. H. Press et al., <em>Numerical Recipes in C</em> — matrix operations.</li>
        <li>E. Balagurusamy, <em>Programming in ANSI C</em> — multidimensional arrays.</li>
        <li>V. Rajaraman, <em>Computer Oriented Numerical Methods</em>, PHI.</li>
      </ul>
    ),
  };
}

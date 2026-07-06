/**
 * numerics.ts — Pure numerical-methods library used by every experiment
 * simulator. Each routine returns both the final answer and the per-iteration
 * trace so the UI can render convergence tables and plots.
 *
 * All functions are framework-agnostic and side-effect free, which keeps them
 * easy to unit-test and reuse across experiments.
 */

import type { ScalarFn } from "./expr";

/* ────────────────────────────────────────────────────────────
   MODULE 1 — NUMERICAL INTEGRATION
   ──────────────────────────────────────────────────────────── */

export interface IntegrationStep {
  i: number;
  x: number;
  fx: number;
  weight: number;
  contribution: number;
}

export interface IntegrationResult {
  value: number;
  h: number;
  steps: IntegrationStep[];
  nodes: { x: number; y: number }[];
}

/** Composite Trapezoidal rule on [a,b] with n sub-intervals. */
export function trapezoidal(f: ScalarFn, a: number, b: number, n: number): IntegrationResult {
  const h = (b - a) / n;
  const steps: IntegrationStep[] = [];
  const nodes: { x: number; y: number }[] = [];
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const fx = f(x);
    const weight = i === 0 || i === n ? 1 : 2;
    sum += weight * fx;
    steps.push({ i, x, fx, weight, contribution: weight * fx });
    nodes.push({ x, y: fx });
  }
  return { value: (h / 2) * sum, h, steps, nodes };
}

/** Composite Simpson's 1/3 rule. Requires n even (caller should validate). */
export function simpson13(f: ScalarFn, a: number, b: number, n: number): IntegrationResult {
  const h = (b - a) / n;
  const steps: IntegrationStep[] = [];
  const nodes: { x: number; y: number }[] = [];
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const fx = f(x);
    const weight = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    sum += weight * fx;
    steps.push({ i, x, fx, weight, contribution: weight * fx });
    nodes.push({ x, y: fx });
  }
  return { value: (h / 3) * sum, h, steps, nodes };
}

/** Composite Simpson's 3/8 rule. Requires n divisible by 3. */
export function simpson38(f: ScalarFn, a: number, b: number, n: number): IntegrationResult {
  const h = (b - a) / n;
  const steps: IntegrationStep[] = [];
  const nodes: { x: number; y: number }[] = [];
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const fx = f(x);
    const weight = i === 0 || i === n ? 1 : i % 3 === 0 ? 2 : 3;
    sum += weight * fx;
    steps.push({ i, x, fx, weight, contribution: weight * fx });
    nodes.push({ x, y: fx });
  }
  return { value: ((3 * h) / 8) * sum, h, steps, nodes };
}

/** High-accuracy reference value via fine composite Simpson (for "exact" comparison). */
export function referenceIntegral(f: ScalarFn, a: number, b: number, n = 20000): number {
  const m = n % 2 === 0 ? n : n + 1;
  return simpson13(f, a, b, m).value;
}

/* ────────────────────────────────────────────────────────────
   MODULE 2 — RANDOM NUMBERS / MONTE CARLO
   ──────────────────────────────────────────────────────────── */

/** Linear Congruential Generator: X_{n+1} = (a X_n + c) mod m. */
export function lcg(seed: number, a: number, c: number, m: number, count: number) {
  const ints: number[] = [];
  const normalized: number[] = [];
  let x = seed % m;
  for (let i = 0; i < count; i++) {
    x = (a * x + c) % m;
    ints.push(x);
    normalized.push(x / m);
  }
  // estimate period by detecting first repeat
  const seen = new Map<number, number>();
  let period = 0;
  let y = seed % m;
  for (let i = 0; i < m + 1; i++) {
    y = (a * y + c) % m;
    if (seen.has(y)) {
      period = i - (seen.get(y) as number);
      break;
    }
    seen.set(y, i);
  }
  return { ints, normalized, period };
}

export interface MonteCarloPoint { x: number; y: number; inside: boolean; }

/** Monte Carlo estimate of pi by sampling the unit square / quarter circle. */
export function monteCarloPi(n: number, rng: () => number = Math.random) {
  const points: MonteCarloPoint[] = [];
  const convergence: { n: number; estimate: number }[] = [];
  let inside = 0;
  const sampleCap = 4000; // cap stored points for plotting performance
  for (let i = 1; i <= n; i++) {
    const x = rng();
    const y = rng();
    const isIn = x * x + y * y <= 1;
    if (isIn) inside++;
    if (points.length < sampleCap) points.push({ x, y, inside: isIn });
    if (i % Math.max(1, Math.floor(n / 200)) === 0 || i === n) {
      convergence.push({ n: i, estimate: (4 * inside) / i });
    }
  }
  return { estimate: (4 * inside) / n, inside, total: n, points, convergence };
}

/* ────────────────────────────────────────────────────────────
   MODULE 3 — ROOT FINDING
   ──────────────────────────────────────────────────────────── */

export interface RootStep {
  iter: number;
  a?: number;
  b?: number;
  x: number;
  fx: number;
  error: number;
}

export interface RootResult {
  root: number;
  steps: RootStep[];
  converged: boolean;
  message?: string;
}

export function bisection(f: ScalarFn, a: number, b: number, tol: number, maxIter = 100): RootResult {
  const steps: RootStep[] = [];
  let fa = f(a);
  if (fa * f(b) > 0) {
    return { root: NaN, steps, converged: false, message: "f(a) and f(b) must have opposite signs." };
  }
  let lo = a, hi = b, c = a, prev = a;
  for (let k = 1; k <= maxIter; k++) {
    c = (lo + hi) / 2;
    const fc = f(c);
    const error = k === 1 ? Math.abs(hi - lo) / 2 : Math.abs(c - prev);
    steps.push({ iter: k, a: lo, b: hi, x: c, fx: fc, error });
    if (Math.abs(fc) < tol || (hi - lo) / 2 < tol) {
      return { root: c, steps, converged: true };
    }
    if (fa * fc < 0) { hi = c; } else { lo = c; fa = fc; }
    prev = c;
  }
  return { root: c, steps, converged: false, message: "Maximum iterations reached." };
}

export function newtonRaphson(f: ScalarFn, df: ScalarFn, x0: number, tol: number, maxIter = 100): RootResult {
  const steps: RootStep[] = [];
  let x = x0;
  for (let k = 1; k <= maxIter; k++) {
    const fx = f(x);
    const dfx = df(x);
    if (Math.abs(dfx) < 1e-14) {
      return { root: x, steps, converged: false, message: "Derivative ≈ 0; method fails." };
    }
    const xNew = x - fx / dfx;
    const error = Math.abs(xNew - x);
    steps.push({ iter: k, x: xNew, fx: f(xNew), error });
    if (error < tol || Math.abs(f(xNew)) < tol) {
      return { root: xNew, steps, converged: true };
    }
    x = xNew;
  }
  return { root: x, steps, converged: false, message: "Maximum iterations reached." };
}

export function secant(f: ScalarFn, x0: number, x1: number, tol: number, maxIter = 100): RootResult {
  const steps: RootStep[] = [];
  let a = x0, b = x1;
  for (let k = 1; k <= maxIter; k++) {
    const fa = f(a), fb = f(b);
    if (Math.abs(fb - fa) < 1e-14) {
      return { root: b, steps, converged: false, message: "Divide-by-zero in secant update." };
    }
    const c = b - (fb * (b - a)) / (fb - fa);
    const error = Math.abs(c - b);
    steps.push({ iter: k, x: c, fx: f(c), error });
    if (error < tol || Math.abs(f(c)) < tol) {
      return { root: c, steps, converged: true };
    }
    a = b; b = c;
  }
  return { root: b, steps, converged: false, message: "Maximum iterations reached." };
}

/* ────────────────────────────────────────────────────────────
   MODULE 4 — ORDINARY DIFFERENTIAL EQUATIONS  y' = f(x,y)
   ──────────────────────────────────────────────────────────── */

export type ODEFn = (x: number, y: number) => number;

export interface ODEStep { i: number; x: number; y: number; exact?: number; error?: number; }

export interface ODEResult { steps: ODEStep[]; }

function buildExact(exact: ScalarFn | null, x: number, y: number): { exact?: number; error?: number } {
  if (!exact) return {};
  const e = exact(x);
  return { exact: e, error: Math.abs(e - y) };
}

export function euler(f: ODEFn, x0: number, y0: number, h: number, steps: number, exact: ScalarFn | null = null): ODEResult {
  const out: ODEStep[] = [];
  let x = x0, y = y0;
  out.push({ i: 0, x, y, ...buildExact(exact, x, y) });
  for (let i = 1; i <= steps; i++) {
    y = y + h * f(x, y);
    x = x0 + i * h;
    out.push({ i, x, y, ...buildExact(exact, x, y) });
  }
  return { steps: out };
}

export function rk2(f: ODEFn, x0: number, y0: number, h: number, steps: number, exact: ScalarFn | null = null): ODEResult {
  const out: ODEStep[] = [];
  let x = x0, y = y0;
  out.push({ i: 0, x, y, ...buildExact(exact, x, y) });
  for (let i = 1; i <= steps; i++) {
    const k1 = f(x, y);
    const k2 = f(x + h, y + h * k1);
    y = y + (h / 2) * (k1 + k2);
    x = x0 + i * h;
    out.push({ i, x, y, ...buildExact(exact, x, y) });
  }
  return { steps: out };
}

export function rk4(f: ODEFn, x0: number, y0: number, h: number, steps: number, exact: ScalarFn | null = null): ODEResult {
  const out: ODEStep[] = [];
  let x = x0, y = y0;
  out.push({ i: 0, x, y, ...buildExact(exact, x, y) });
  for (let i = 1; i <= steps; i++) {
    const k1 = f(x, y);
    const k2 = f(x + h / 2, y + (h / 2) * k1);
    const k3 = f(x + h / 2, y + (h / 2) * k2);
    const k4 = f(x + h, y + h * k3);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x = x0 + i * h;
    out.push({ i, x, y, ...buildExact(exact, x, y) });
  }
  return { steps: out };
}

/* ────────────────────────────────────────────────────────────
   MODULE 5 — CURVE FITTING (Least Squares, linear y = a + b x)
   ──────────────────────────────────────────────────────────── */

export interface LinearFit {
  slope: number; intercept: number; r2: number;
  residuals: { x: number; y: number; fit: number; residual: number }[];
}

export function leastSquaresLinear(xs: number[], ys: number[]): LinearFit {
  const n = xs.length;
  const sx = xs.reduce((s, v) => s + v, 0);
  const sy = ys.reduce((s, v) => s + v, 0);
  const sxx = xs.reduce((s, v) => s + v * v, 0);
  const sxy = xs.reduce((s, v, i) => s + v * ys[i], 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const meanY = sy / n;
  let ssRes = 0, ssTot = 0;
  const residuals = xs.map((x, i) => {
    const fit = intercept + slope * x;
    const residual = ys[i] - fit;
    ssRes += residual * residual;
    ssTot += (ys[i] - meanY) ** 2;
    return { x, y: ys[i], fit, residual };
  });
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2, residuals };
}

/* ────────────────────────────────────────────────────────────
   MODULE 6 — NUMERICAL DIFFERENTIATION
   ──────────────────────────────────────────────────────────── */

export function forwardDiff(f: ScalarFn, x: number, h: number) { return (f(x + h) - f(x)) / h; }
export function backwardDiff(f: ScalarFn, x: number, h: number) { return (f(x) - f(x - h)) / h; }
export function centralDiff(f: ScalarFn, x: number, h: number) { return (f(x + h) - f(x - h)) / (2 * h); }

/* ────────────────────────────────────────────────────────────
   MODULE 7 — MATRIX METHODS
   ──────────────────────────────────────────────────────────── */

export interface GaussResult { solution: number[]; steps: string[]; augmented: number[][]; }

/** Gauss elimination with partial pivoting; returns solution and a text trace. */
export function gaussElimination(A: number[][], b: number[]): GaussResult {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  const steps: string[] = [];
  for (let col = 0; col < n; col++) {
    // partial pivot
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    if (pivot !== col) { [M[col], M[pivot]] = [M[pivot], M[col]]; steps.push(`Swap R${col + 1} ↔ R${pivot + 1}`); }
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
      steps.push(`R${r + 1} → R${r + 1} − (${factor.toFixed(4)})·R${col + 1}`);
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return { solution: x, steps, augmented: M };
}

export interface IterStep { iter: number; x: number[]; error: number; }

/** Gauss–Seidel iterative solver. */
export function gaussSeidel(A: number[][], b: number[], tol: number, maxIter = 100): { solution: number[]; steps: IterStep[]; converged: boolean } {
  const n = A.length;
  let x = new Array(n).fill(0);
  const steps: IterStep[] = [];
  for (let k = 1; k <= maxIter; k++) {
    const xOld = [...x];
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
      x[i] = s / A[i][i];
    }
    const error = Math.max(...x.map((v, i) => Math.abs(v - xOld[i])));
    steps.push({ iter: k, x: [...x], error });
    if (error < tol) return { solution: x, steps, converged: true };
  }
  return { solution: x, steps, converged: false };
}

/* ────────────────────────────────────────────────────────────
   MODULE 8 — INTERPOLATION
   ──────────────────────────────────────────────────────────── */

/** Newton forward-difference interpolation. Returns difference table + value at xp. */
export function newtonForward(xs: number[], ys: number[], xp: number) {
  const n = xs.length;
  const diff: number[][] = [ys.slice()];
  for (let level = 1; level < n; level++) {
    const prev = diff[level - 1];
    const cur: number[] = [];
    for (let i = 0; i < prev.length - 1; i++) cur.push(prev[i + 1] - prev[i]);
    diff.push(cur);
  }
  const h = xs[1] - xs[0];
  const p = (xp - xs[0]) / h;
  let value = ys[0];
  let pTerm = 1;
  for (let k = 1; k < n; k++) {
    pTerm *= (p - (k - 1)) / k;
    value += pTerm * diff[k][0];
  }
  return { value, table: diff, p };
}

/** Lagrange interpolation; returns value at xp and per-basis weights. */
export function lagrange(xs: number[], ys: number[], xp: number) {
  const n = xs.length;
  let value = 0;
  const basis: number[] = [];
  for (let i = 0; i < n; i++) {
    let Li = 1;
    for (let j = 0; j < n; j++) if (j !== i) Li *= (xp - xs[j]) / (xs[i] - xs[j]);
    basis.push(Li);
    value += Li * ys[i];
  }
  return { value, basis };
}

/* ────────────────────────────────────────────────────────────
   PH-C-415 · SOLUTION OF QUADRATIC EQUATION
   ──────────────────────────────────────────────────────────── */

export interface QuadraticResult {
  a: number; b: number; c: number;
  discriminant: number;
  nature: string;
  real: boolean;
  root1: { re: number; im: number };
  root2: { re: number; im: number };
  vertex: { x: number; y: number };
}

/** Solve a x² + b x + c = 0, reporting the discriminant, nature and both roots. */
export function quadraticRoots(a: number, b: number, c: number): QuadraticResult {
  const disc = b * b - 4 * a * c;
  const vx = -b / (2 * a);
  const vy = a * vx * vx + b * vx + c;
  let nature: string;
  let r1 = { re: NaN, im: 0 }, r2 = { re: NaN, im: 0 };
  if (disc > 0) {
    const s = Math.sqrt(disc);
    r1 = { re: (-b + s) / (2 * a), im: 0 };
    r2 = { re: (-b - s) / (2 * a), im: 0 };
    nature = "Real and distinct roots";
  } else if (disc === 0) {
    r1 = { re: vx, im: 0 };
    r2 = { re: vx, im: 0 };
    nature = "Real and equal roots";
  } else {
    const s = Math.sqrt(-disc);
    r1 = { re: -b / (2 * a), im: s / (2 * a) };
    r2 = { re: -b / (2 * a), im: -s / (2 * a) };
    nature = "Complex conjugate roots";
  }
  return { a, b, c, discriminant: disc, nature, real: disc >= 0, root1: r1, root2: r2, vertex: { x: vx, y: vy } };
}

/* ────────────────────────────────────────────────────────────
   PH-C-415 · SORTING A SET OF NUMBERS
   ──────────────────────────────────────────────────────────── */

export interface SortStep { pass: number; array: number[]; swapped: [number, number] | null; }
export interface SortResult { sorted: number[]; steps: SortStep[]; comparisons: number; swaps: number; }

/** Selection sort (ascending or descending) with a per-pass trace for visualization. */
export function selectionSort(input: number[], ascending = true): SortResult {
  const a = [...input];
  const n = a.length;
  const steps: SortStep[] = [];
  let comparisons = 0, swaps = 0;
  for (let i = 0; i < n - 1; i++) {
    let sel = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if ((ascending && a[j] < a[sel]) || (!ascending && a[j] > a[sel])) sel = j;
    }
    let swap: [number, number] | null = null;
    if (sel !== i) { [a[i], a[sel]] = [a[sel], a[i]]; swaps++; swap = [i, sel]; }
    steps.push({ pass: i + 1, array: [...a], swapped: swap });
  }
  return { sorted: a, steps, comparisons, swaps };
}

/* ────────────────────────────────────────────────────────────
   PH-C-415 · SERIES SUMMATION  (sin, cos, eˣ, log)
   ──────────────────────────────────────────────────────────── */

export type SeriesKind = "sin" | "cos" | "exp" | "log";

export interface SeriesTerm { k: number; term: number; partial: number; }
export interface SeriesResult { kind: SeriesKind; x: number; sum: number; exact: number; terms: SeriesTerm[]; }

/**
 * Sum a Maclaurin series term-by-term.
 *   sin x = Σ (-1)^k x^(2k+1)/(2k+1)!
 *   cos x = Σ (-1)^k x^(2k)/(2k)!
 *   e^x   = Σ x^k / k!
 *   log(1+x) = Σ (-1)^(k-1) x^k / k     (|x| ≤ 1)
 */
export function seriesSum(kind: SeriesKind, x: number, nTerms: number): SeriesResult {
  const terms: SeriesTerm[] = [];
  let sum = 0;
  for (let k = 0; k < nTerms; k++) {
    let term = 0;
    if (kind === "sin") {
      const p = 2 * k + 1;
      term = (k % 2 === 0 ? 1 : -1) * Math.pow(x, p) / factorial(p);
    } else if (kind === "cos") {
      const p = 2 * k;
      term = (k % 2 === 0 ? 1 : -1) * Math.pow(x, p) / factorial(p);
    } else if (kind === "exp") {
      term = Math.pow(x, k) / factorial(k);
    } else {
      const m = k + 1; // log series starts at k=1
      term = (m % 2 === 1 ? 1 : -1) * Math.pow(x, m) / m;
    }
    sum += term;
    terms.push({ k: kind === "log" ? k + 1 : k, term, partial: sum });
  }
  const exact = kind === "sin" ? Math.sin(x) : kind === "cos" ? Math.cos(x) : kind === "exp" ? Math.exp(x) : Math.log(1 + x);
  return { kind, x, sum, exact, terms };
}

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

/* ────────────────────────────────────────────────────────────
   PH-C-415 · INTERPOLATION  (linear, quadratic, Stirling, cubic spline)
   ──────────────────────────────────────────────────────────── */

/** Straight-line interpolation between two points. */
export function linearInterp(x0: number, y0: number, x1: number, y1: number, xp: number) {
  const slope = (y1 - y0) / (x1 - x0);
  const value = y0 + slope * (xp - x0);
  return { value, slope };
}

/** Quadratic (3-point) Lagrange interpolation. */
export function quadraticInterp(xs: number[], ys: number[], xp: number) {
  let value = 0;
  const basis: number[] = [];
  for (let i = 0; i < 3; i++) {
    let Li = 1;
    for (let j = 0; j < 3; j++) if (j !== i) Li *= (xp - xs[j]) / (xs[i] - xs[j]);
    basis.push(Li);
    value += Li * ys[i];
  }
  return { value, basis };
}

/** Stirling's central-difference interpolation (equally spaced, xp near the middle node). */
export function stirling(xs: number[], ys: number[], xp: number) {
  const n = xs.length;
  const diff: number[][] = [ys.slice()];
  for (let level = 1; level < n; level++) {
    const prev = diff[level - 1];
    const cur: number[] = [];
    for (let i = 0; i < prev.length - 1; i++) cur.push(prev[i + 1] - prev[i]);
    diff.push(cur);
  }
  const mid = Math.floor((n - 1) / 2);
  const h = xs[1] - xs[0];
  const p = (xp - xs[mid]) / h;
  // Stirling's formula
  let value = ys[mid];
  const d = (level: number, index: number) => (index >= 0 && index < diff[level].length ? diff[level][index] : 0);
  // term 1: p * (Δy_{-1} + Δy_0)/2
  value += p * (d(1, mid - 1) + d(1, mid)) / 2;
  // term 2: p²/2! * Δ²y_{-1}
  value += (p * p / 2) * d(2, mid - 1);
  if (n > 3) {
    // term 3: p(p²-1)/3! * (Δ³y_{-2}+Δ³y_{-1})/2
    value += (p * (p * p - 1) / 6) * (d(3, mid - 2) + d(3, mid - 1)) / 2;
    // term 4: p²(p²-1)/4! * Δ⁴y_{-2}
    value += (p * p * (p * p - 1) / 24) * d(4, mid - 2);
  }
  return { value, table: diff, p, mid };
}

export interface SplineSegment { x0: number; x1: number; a: number; b: number; c: number; d: number; }
export interface SplineResult { value: number; segments: SplineSegment[]; M: number[]; }

/**
 * Natural cubic spline interpolation.
 * Returns the piecewise coefficients S_i(x)=a+b(x−xᵢ)+c(x−xᵢ)²+d(x−xᵢ)³ and value at xp.
 */
export function cubicSpline(xs: number[], ys: number[], xp: number): SplineResult {
  const n = xs.length;
  const h: number[] = [];
  for (let i = 0; i < n - 1; i++) h.push(xs[i + 1] - xs[i]);
  // Solve tridiagonal system for second derivatives M (natural: M0 = Mn-1 = 0)
  const M = new Array(n).fill(0);
  if (n > 2) {
    const alpha = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++)
      alpha[i] = (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]);
    const l = new Array(n).fill(0), mu = new Array(n).fill(0), z = new Array(n).fill(0);
    l[0] = 1;
    for (let i = 1; i < n - 1; i++) {
      l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
      mu[i] = h[i] / l[i];
      z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }
    l[n - 1] = 1;
    for (let j = n - 2; j >= 0; j--) M[j] = z[j] - mu[j] * M[j + 1];
  }
  const segments: SplineSegment[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = ys[i];
    const b = (ys[i + 1] - ys[i]) / h[i] - (h[i] / 3) * (2 * M[i] + M[i + 1]);
    const c = M[i];
    const d = (M[i + 1] - M[i]) / (3 * h[i]);
    segments.push({ x0: xs[i], x1: xs[i + 1], a, b, c, d });
  }
  // evaluate
  let seg = segments[0];
  for (const s of segments) if (xp >= s.x0 && xp <= s.x1) { seg = s; break; }
  if (xp > xs[n - 1]) seg = segments[segments.length - 1];
  const dx = xp - seg.x0;
  const value = seg.a + seg.b * dx + seg.c * dx * dx + seg.d * dx * dx * dx;
  return { value, segments, M };
}

/** Sample a cubic spline across its range for smooth-curve plotting. */
export function sampleSpline(res: SplineResult, xs: number[], points = 160): { x: number; spline: number }[] {
  const a = xs[0], b = xs[xs.length - 1];
  const out: { x: number; spline: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const x = a + (i / points) * (b - a);
    let seg = res.segments[0];
    for (const s of res.segments) if (x >= s.x0 && x <= s.x1) { seg = s; break; }
    const dx = x - seg.x0;
    out.push({ x: +x.toFixed(4), spline: seg.a + seg.b * dx + seg.c * dx * dx + seg.d * dx * dx * dx });
  }
  return out;
}

/* ────────────────────────────────────────────────────────────
   PH-C-415 · MATRIX OPERATIONS  (multiply, transpose, determinant, inverse, LU)
   ──────────────────────────────────────────────────────────── */

/** Matrix multiplication A(m×p) · B(p×n) = C(m×n). */
export function matMultiply(A: number[][], B: number[][]): number[][] {
  const m = A.length, p = B.length, n = B[0].length;
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < p; k++) C[i][j] += A[i][k] * B[k][j];
  return C;
}

/** Transpose of a matrix. */
export function matTranspose(A: number[][]): number[][] {
  const m = A.length, n = A[0].length;
  const T: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) T[j][i] = A[i][j];
  return T;
}

export interface DetResult { value: number; steps: string[]; upper: number[][]; swaps: number; }

/** Determinant via Gaussian elimination (product of pivots); tracks row swaps for sign. */
export function determinant(A: number[][]): DetResult {
  const n = A.length;
  const M = A.map((r) => [...r]);
  const steps: string[] = [];
  let swaps = 0;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    if (Math.abs(M[pivot][col]) < 1e-14) { steps.push(`Column ${col + 1}: pivot ≈ 0 ⇒ determinant = 0`); return { value: 0, steps, upper: M, swaps }; }
    if (pivot !== col) { [M[col], M[pivot]] = [M[pivot], M[col]]; swaps++; steps.push(`Swap R${col + 1} ↔ R${pivot + 1} (sign flips)`); }
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col];
      for (let c = col; c < n; c++) M[r][c] -= factor * M[col][c];
      steps.push(`R${r + 1} → R${r + 1} − (${factor.toFixed(4)})·R${col + 1}`);
    }
  }
  let det = swaps % 2 === 0 ? 1 : -1;
  for (let i = 0; i < n; i++) det *= M[i][i];
  steps.push(`det = (${swaps % 2 === 0 ? "+" : "−"}) Π pivots = ${det.toFixed(4)}`);
  return { value: det, steps, upper: M, swaps };
}

export interface InverseResult { inverse: number[][] | null; steps: string[]; determinant: number; }

/** Matrix inverse by Gauss–Jordan elimination on [A | I]. */
export function matrixInverse(A: number[][]): InverseResult {
  const n = A.length;
  const M = A.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  const steps: string[] = [];
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    if (Math.abs(M[pivot][col]) < 1e-14) { steps.push(`Column ${col + 1}: singular — inverse does not exist.`); return { inverse: null, steps, determinant: 0 }; }
    if (pivot !== col) { [M[col], M[pivot]] = [M[pivot], M[col]]; det = -det; steps.push(`Swap R${col + 1} ↔ R${pivot + 1}`); }
    const pv = M[col][col];
    det *= pv;
    for (let c = 0; c < 2 * n; c++) M[col][c] /= pv;
    steps.push(`R${col + 1} → R${col + 1} / ${pv.toFixed(4)} (normalise pivot)`);
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      if (Math.abs(factor) < 1e-15) continue;
      for (let c = 0; c < 2 * n; c++) M[r][c] -= factor * M[col][c];
      steps.push(`R${r + 1} → R${r + 1} − (${factor.toFixed(4)})·R${col + 1}`);
    }
  }
  const inv = M.map((r) => r.slice(n));
  return { inverse: inv, steps, determinant: det };
}

export interface LUResult { L: number[][]; U: number[][]; solution?: number[]; ok: boolean; message?: string; }

/** LU decomposition (Doolittle: L unit-lower). Optionally solves A x = b. */
export function luDecomposition(A: number[][], b?: number[]): LUResult {
  const n = A.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const U: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    // Upper
    for (let k = i; k < n; k++) {
      let s = 0;
      for (let j = 0; j < i; j++) s += L[i][j] * U[j][k];
      U[i][k] = A[i][k] - s;
    }
    if (Math.abs(U[i][i]) < 1e-14) return { L, U, ok: false, message: "Zero pivot — Doolittle LU without pivoting fails." };
    // Lower
    for (let k = i; k < n; k++) {
      if (i === k) { L[i][i] = 1; continue; }
      let s = 0;
      for (let j = 0; j < i; j++) s += L[k][j] * U[j][i];
      L[k][i] = (A[k][i] - s) / U[i][i];
    }
  }
  let solution: number[] | undefined;
  if (b) {
    // Ly = b (forward), Ux = y (back)
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < i; j++) s -= L[i][j] * y[j];
      y[i] = s;
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = y[i];
      for (let j = i + 1; j < n; j++) s -= U[i][j] * x[j];
      x[i] = s / U[i][i];
    }
    solution = x;
  }
  return { L, U, solution, ok: true };
}

/* ────────────────────────────────────────────────────────────
   SHARED HELPERS
   ──────────────────────────────────────────────────────────── */

export function relErrorPct(approx: number, exact: number): number {
  if (exact === 0) return Math.abs(approx);
  return Math.abs((exact - approx) / exact) * 100;
}

/** Sample a function across [a,b] for smooth-curve plotting. */
export function sampleCurve(f: ScalarFn, a: number, b: number, points = 200): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const h = (b - a) / points;
  for (let i = 0; i <= points; i++) {
    const x = a + i * h;
    const y = f(x);
    if (Number.isFinite(y)) out.push({ x, y });
  }
  return out;
}

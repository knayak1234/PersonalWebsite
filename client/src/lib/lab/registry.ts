import {
  Sigma, Dice5, Crosshair, Activity, TrendingUp, GitCompareArrows,
  Grid3x3, Spline, AreaChart, Target, Binary, Waves, FunctionSquare,
  ScatterChart, Calculator, LineChart,
  Triangle, Split, Footprints, Ruler, Table2, Waypoints,
  ArrowUpDown, Superscript, Minus, Grid2x2, FlipHorizontal2, Layers, Atom,
  BarChart3, Infinity as InfinityIcon, Rows3, Network, Gauge, Mountain,
} from "lucide-react";
import type { ExperimentMeta, LabModule } from "./types";

/**
 * Modules aligned to the official PH-C-415 "Computer Practical (I)" syllabus
 * (Semester-I, Course-V). Modules 1–7 mirror the eleven prescribed programs;
 * Module 8 collects the additional experiments suggested by the course teacher.
 */
export const MODULES: LabModule[] = [
  { number: 1, title: "Roots of Equations", blurb: "Quadratic & transcendental equations", icon: Crosshair, accent: "from-rose-500 to-red-600" },
  { number: 2, title: "Sorting", blurb: "Ordering a set of numbers", icon: ArrowUpDown, accent: "from-sky-500 to-blue-600" },
  { number: 3, title: "Series Summation", blurb: "Sin(x), Cos(x), eˣ, Log(x) by series", icon: Sigma, accent: "from-fuchsia-500 to-purple-600" },
  { number: 4, title: "Interpolation", blurb: "Linear, quadratic, Stirling, spline, Newton & Lagrange", icon: Spline, accent: "from-pink-500 to-rose-600" },
  { number: 5, title: "Matrix Operations", blurb: "Multiply, transpose, determinant & inverse", icon: Grid3x3, accent: "from-violet-500 to-indigo-600" },
  { number: 6, title: "Linear Systems", blurb: "Gauss elimination, LU & Gauss–Seidel", icon: Table2, accent: "from-indigo-500 to-blue-600" },
  { number: 7, title: "Curve Fitting", blurb: "Least-squares straight-line fit", icon: TrendingUp, accent: "from-amber-500 to-orange-600" },
  { number: 8, title: "Additional Experiments", blurb: "Integration, Monte Carlo, ODEs & differentiation", icon: Atom, accent: "from-emerald-500 to-teal-600" },
];

/**
 * Master registry of every experiment. `status: "complete"` experiments have a
 * full interactive page; `"soon"` experiments appear on the dashboard with a
 * "Coming soon" badge and a theory-ready placeholder.
 */
export const EXPERIMENTS: ExperimentMeta[] = [
  // ── Module 1 · Roots of Equations ──────────────────────────────
  {
    id: "quadratic", moduleNumber: 1, module: "Roots of Equations",
    name: "Solution of Quadratic Equation", description: "Solve a x² + b x + c = 0 using the discriminant, classifying real, equal and complex roots.",
    difficulty: "Beginner", topic: "Discriminant, roots of a polynomial",
    applications: "Projectile range, energy levels, kinematics", icon: Superscript, accent: "from-rose-500 to-red-600", status: "complete",
  },
  {
    id: "bisection", moduleNumber: 1, module: "Roots of Equations",
    name: "Bisection Method", description: "Bracket a root and halve the interval until the desired tolerance is met.",
    difficulty: "Beginner", topic: "Intermediate Value Theorem, bracketing",
    applications: "Transcendental equations, freeze-out T", icon: Split, accent: "from-rose-500 to-red-600", status: "complete",
  },
  {
    id: "newton-raphson", moduleNumber: 1, module: "Roots of Equations",
    name: "Newton–Raphson Method", description: "Use tangent lines and derivatives for rapid quadratic convergence to a root.",
    difficulty: "Intermediate", topic: "Taylor expansion, fixed-point iteration",
    applications: "Equation of state, transcendental roots", icon: FunctionSquare, accent: "from-red-500 to-orange-600", status: "complete",
  },
  {
    id: "secant", moduleNumber: 1, module: "Roots of Equations",
    name: "Secant Method", description: "Derivative-free root finding using secant lines through two points.",
    difficulty: "Intermediate", topic: "Finite-difference Newton, superlinear convergence",
    applications: "Roots without analytic derivative", icon: LineChart, accent: "from-orange-500 to-rose-600", status: "complete",
  },

  // ── Module 2 · Sorting ─────────────────────────────────────────
  {
    id: "sorting", moduleNumber: 2, module: "Sorting",
    name: "Sorting a Set of Numbers", description: "Arrange numbers in ascending or descending order with a step-by-step selection-sort trace.",
    difficulty: "Beginner", topic: "Comparison sorting, selection sort",
    applications: "Ranking data, median, histogram binning", icon: BarChart3, accent: "from-sky-500 to-blue-600", status: "complete",
  },

  // ── Module 3 · Series Summation ────────────────────────────────
  {
    id: "series-summation", moduleNumber: 3, module: "Series Summation",
    name: "Series Summation (Sin, Cos, eˣ, Log)", description: "Evaluate elementary functions by summing their Maclaurin series term by term.",
    difficulty: "Beginner", topic: "Taylor/Maclaurin series, convergence",
    applications: "Function evaluation, oscillations, decay", icon: InfinityIcon, accent: "from-fuchsia-500 to-purple-600", status: "complete",
  },

  // ── Module 4 · Interpolation ───────────────────────────────────
  {
    id: "linear-interpolation", moduleNumber: 4, module: "Interpolation",
    name: "Linear Interpolation", description: "Estimate an intermediate value along the straight line joining two data points.",
    difficulty: "Beginner", topic: "Two-point interpolation, straight line",
    applications: "Reading tables, sensor calibration", icon: Minus, accent: "from-pink-500 to-rose-600", status: "complete",
  },
  {
    id: "quadratic-interpolation", moduleNumber: 4, module: "Interpolation",
    name: "Quadratic Interpolation", description: "Fit a parabola through three points to interpolate with curvature.",
    difficulty: "Intermediate", topic: "Three-point Lagrange parabola",
    applications: "Peak finding, smooth table lookup", icon: Activity, accent: "from-pink-500 to-fuchsia-600", status: "complete",
  },
  {
    id: "newton-forward", moduleNumber: 4, module: "Interpolation",
    name: "Newton Forward Interpolation", description: "Build a forward-difference table and interpolate on equally spaced data.",
    difficulty: "Intermediate", topic: "Finite differences, interpolation polynomial",
    applications: "Tabulated data interpolation", icon: ScatterChart, accent: "from-pink-500 to-rose-600", status: "complete",
  },
  {
    id: "stirling", moduleNumber: 4, module: "Interpolation",
    name: "Stirling Interpolation", description: "Central-difference interpolation giving high accuracy near the middle of the table.",
    difficulty: "Intermediate", topic: "Central differences, Stirling's formula",
    applications: "Interpolation near a table centre", icon: Waypoints, accent: "from-rose-500 to-pink-600", status: "complete",
  },
  {
    id: "cubic-spline", moduleNumber: 4, module: "Interpolation",
    name: "Cubic Spline Interpolation", description: "Fit smooth piecewise cubics with continuous first and second derivatives.",
    difficulty: "Advanced", topic: "Piecewise cubics, natural spline, tridiagonal solve",
    applications: "Smooth curves, CAD, data smoothing", icon: Waves, accent: "from-fuchsia-500 to-pink-600", status: "complete",
  },
  {
    id: "lagrange", moduleNumber: 4, module: "Interpolation",
    name: "Lagrange Interpolation", description: "Construct an interpolating polynomial for arbitrarily spaced data points.",
    difficulty: "Intermediate", topic: "Lagrange basis polynomials",
    applications: "Unequal-spacing interpolation", icon: Network, accent: "from-rose-500 to-pink-600", status: "complete",
  },

  // ── Module 5 · Matrix Operations ───────────────────────────────
  {
    id: "matrix-operations", moduleNumber: 5, module: "Matrix Operations",
    name: "Matrix Multiplication & Transpose", description: "Multiply two matrices and compute the transpose, the building blocks of linear algebra.",
    difficulty: "Beginner", topic: "Matrix product, transpose, conformability",
    applications: "Transformations, rotations, tensors", icon: Grid2x2, accent: "from-violet-500 to-indigo-600", status: "complete",
  },
  {
    id: "determinant", moduleNumber: 5, module: "Matrix Operations",
    name: "Determinant of a Matrix", description: "Evaluate a determinant by Gaussian reduction to a product of pivots.",
    difficulty: "Intermediate", topic: "Determinant, pivots, row operations",
    applications: "Singularity test, Cramer's rule, Jacobians", icon: Calculator, accent: "from-violet-500 to-purple-600", status: "complete",
  },
  {
    id: "matrix-inverse", moduleNumber: 5, module: "Matrix Operations",
    name: "Matrix Inversion", description: "Find A⁻¹ by Gauss–Jordan elimination on the augmented matrix [A | I].",
    difficulty: "Advanced", topic: "Gauss–Jordan, augmented matrix",
    applications: "Solving A x = b, covariance, least squares", icon: FlipHorizontal2, accent: "from-purple-500 to-violet-600", status: "complete",
  },

  // ── Module 6 · Linear Systems ──────────────────────────────────
  {
    id: "gauss-elimination", moduleNumber: 6, module: "Linear Systems",
    name: "Gauss Elimination", description: "Solve a linear system by forward elimination and back substitution.",
    difficulty: "Intermediate", topic: "Linear systems, pivoting",
    applications: "Detector calibration, coupled equations", icon: Rows3, accent: "from-indigo-500 to-blue-600", status: "complete",
  },
  {
    id: "lu-decomposition", moduleNumber: 6, module: "Linear Systems",
    name: "LU Decomposition", description: "Factor A = LU (Doolittle) and solve by forward and back substitution.",
    difficulty: "Advanced", topic: "Triangular factorisation, Doolittle method",
    applications: "Multiple RHS, determinants, inverses", icon: Layers, accent: "from-blue-500 to-indigo-600", status: "complete",
  },
  {
    id: "gauss-seidel", moduleNumber: 6, module: "Linear Systems",
    name: "Gauss–Seidel Method", description: "Iteratively solve a linear system and watch the error decay to zero.",
    difficulty: "Advanced", topic: "Iterative solvers, diagonal dominance",
    applications: "Large sparse systems, relaxation", icon: Calculator, accent: "from-indigo-500 to-violet-600", status: "complete",
  },

  // ── Module 7 · Curve Fitting ───────────────────────────────────
  {
    id: "least-squares", moduleNumber: 7, module: "Curve Fitting",
    name: "Least Squares Fitting", description: "Fit the best straight line to data by minimising squared residuals.",
    difficulty: "Intermediate", topic: "Normal equations, regression, R²",
    applications: "pT spectra fitting, exponential/Gaussian fits", icon: Ruler, accent: "from-amber-500 to-orange-600", status: "complete",
  },

  // ── Module 8 · Additional Experiments (course-teacher suggested) ─
  {
    id: "trapezoidal", moduleNumber: 8, module: "Additional Experiments",
    name: "Trapezoidal Rule", description: "Approximate a definite integral by summing trapezoidal strips under the curve.",
    difficulty: "Beginner", topic: "Definite integration, polynomial approximation",
    applications: "Particle spectra, total multiplicity", icon: Triangle, accent: "from-emerald-500 to-teal-600", status: "complete",
  },
  {
    id: "simpson-13", moduleNumber: 8, module: "Additional Experiments",
    name: "Simpson's 1/3 Rule", description: "Use parabolic arcs through pairs of intervals for higher-order accuracy.",
    difficulty: "Intermediate", topic: "Quadratic interpolation, Newton–Cotes",
    applications: "Flow coefficient averaging, cross-sections", icon: AreaChart, accent: "from-emerald-500 to-teal-600", status: "complete",
  },
  {
    id: "simpson-38", moduleNumber: 8, module: "Additional Experiments",
    name: "Simpson's 3/8 Rule", description: "A cubic Newton–Cotes rule integrating three intervals at a time.",
    difficulty: "Intermediate", topic: "Cubic interpolation, Newton–Cotes",
    applications: "Spectra integration over odd grids", icon: Mountain, accent: "from-teal-500 to-emerald-600", status: "complete",
  },
  {
    id: "lcg", moduleNumber: 8, module: "Additional Experiments",
    name: "Linear Congruential Generator", description: "Generate pseudo-random sequences and study their period and uniformity.",
    difficulty: "Beginner", topic: "Modular arithmetic, pseudo-randomness",
    applications: "Monte Carlo event generation", icon: Binary, accent: "from-fuchsia-500 to-purple-600", status: "complete",
  },
  {
    id: "monte-carlo-pi", moduleNumber: 8, module: "Additional Experiments",
    name: "Monte Carlo Estimation of π", description: "Estimate π by random sampling of points in a square and circle.",
    difficulty: "Beginner", topic: "Monte Carlo integration, probability",
    applications: "Particle production simulation", icon: Target, accent: "from-purple-500 to-fuchsia-600", status: "complete",
  },
  {
    id: "euler", moduleNumber: 8, module: "Additional Experiments",
    name: "Euler Method", description: "The simplest explicit scheme for solving first-order ODEs y' = f(x,y).",
    difficulty: "Beginner", topic: "First-order ODE, finite steps",
    applications: "Radioactive decay, simple kinetics", icon: Footprints, accent: "from-emerald-500 to-teal-600", status: "complete",
  },
  {
    id: "rk2", moduleNumber: 8, module: "Additional Experiments",
    name: "Runge–Kutta (RK2)", description: "Second-order Runge–Kutta improving on Euler using a midpoint/trapezoidal estimate.",
    difficulty: "Intermediate", topic: "Predictor–corrector, second-order accuracy",
    applications: "Transport equations, decay chains", icon: Waves, accent: "from-teal-500 to-emerald-600", status: "complete",
  },
  {
    id: "rk4", moduleNumber: 8, module: "Additional Experiments",
    name: "Runge–Kutta (RK4)", description: "The workhorse fourth-order method balancing accuracy and cost.",
    difficulty: "Advanced", topic: "Fourth-order accuracy, weighted slopes",
    applications: "Hydrodynamic evolution, orbital mechanics", icon: Gauge, accent: "from-green-600 to-teal-600", status: "complete",
  },
  {
    id: "differentiation", moduleNumber: 8, module: "Additional Experiments",
    name: "Numerical Differentiation", description: "Compare forward, backward and central difference formulas and their errors.",
    difficulty: "Intermediate", topic: "Finite differences, truncation error",
    applications: "Velocity/acceleration from data", icon: GitCompareArrows, accent: "from-cyan-500 to-sky-600", status: "complete",
  },
];

export function getExperiment(id: string): ExperimentMeta | undefined {
  return EXPERIMENTS.find((e) => e.id === id);
}

export function getNeighbors(id: string) {
  const idx = EXPERIMENTS.findIndex((e) => e.id === id);
  return {
    prev: idx > 0 ? EXPERIMENTS[idx - 1] : undefined,
    next: idx >= 0 && idx < EXPERIMENTS.length - 1 ? EXPERIMENTS[idx + 1] : undefined,
  };
}

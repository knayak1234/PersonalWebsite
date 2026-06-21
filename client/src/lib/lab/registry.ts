import {
  Sigma, Dice5, Crosshair, Activity, TrendingUp, GitCompareArrows,
  Grid3x3, Spline, AreaChart, Target, Binary, Waves, FunctionSquare,
  ScatterChart, Calculator, LineChart,
  Triangle, Split, Footprints, Ruler, Table2, Waypoints,
} from "lucide-react";
import type { ExperimentMeta, LabModule } from "./types";

/** The 8 modules shown on the dashboard. */
export const MODULES: LabModule[] = [
  { number: 1, title: "Numerical Integration", blurb: "Trapezoidal & Simpson's rules", icon: Sigma, accent: "from-blue-500 to-indigo-600" },
  { number: 2, title: "Random Numbers & Monte Carlo", blurb: "LCG generators and Monte Carlo estimation", icon: Dice5, accent: "from-fuchsia-500 to-purple-600" },
  { number: 3, title: "Root Finding", blurb: "Bisection, Newton–Raphson, Secant", icon: Crosshair, accent: "from-rose-500 to-red-600" },
  { number: 4, title: "Differential Equations", blurb: "Euler, RK2 and RK4 methods", icon: Activity, accent: "from-emerald-500 to-teal-600" },
  { number: 5, title: "Curve Fitting", blurb: "Least-squares regression", icon: TrendingUp, accent: "from-amber-500 to-orange-600" },
  { number: 6, title: "Numerical Differentiation", blurb: "Forward, backward & central differences", icon: GitCompareArrows, accent: "from-cyan-500 to-sky-600" },
  { number: 7, title: "Matrix Methods", blurb: "Gauss elimination & Gauss–Seidel", icon: Grid3x3, accent: "from-violet-500 to-indigo-600" },
  { number: 8, title: "Interpolation", blurb: "Newton forward & Lagrange", icon: Spline, accent: "from-pink-500 to-rose-600" },
];

/**
 * Master registry of every experiment. `status: "complete"` experiments have a
 * full interactive page; `"soon"` experiments appear on the dashboard with a
 * "Coming soon" badge and a theory-ready placeholder.
 */
export const EXPERIMENTS: ExperimentMeta[] = [
  // Module 1
  {
    id: "trapezoidal", moduleNumber: 1, module: "Numerical Integration",
    name: "Trapezoidal Rule", description: "Approximate a definite integral by summing trapezoidal strips under the curve.",
    difficulty: "Beginner", topic: "Definite integration, polynomial approximation",
    applications: "Particle spectra, total multiplicity", icon: Triangle, accent: "from-blue-500 to-indigo-600", status: "complete",
  },
  {
    id: "simpson-13", moduleNumber: 1, module: "Numerical Integration",
    name: "Simpson's 1/3 Rule", description: "Use parabolic arcs through pairs of intervals for higher-order accuracy.",
    difficulty: "Intermediate", topic: "Quadratic interpolation, Newton–Cotes",
    applications: "Flow coefficient averaging, cross-sections", icon: AreaChart, accent: "from-blue-500 to-cyan-600", status: "complete",
  },
  {
    id: "simpson-38", moduleNumber: 1, module: "Numerical Integration",
    name: "Simpson's 3/8 Rule", description: "A cubic Newton–Cotes rule integrating three intervals at a time.",
    difficulty: "Intermediate", topic: "Cubic interpolation, Newton–Cotes",
    applications: "Spectra integration over odd grids", icon: AreaChart, accent: "from-indigo-500 to-blue-600", status: "complete",
  },
  // Module 2
  {
    id: "lcg", moduleNumber: 2, module: "Random Numbers",
    name: "Linear Congruential Generator", description: "Generate pseudo-random sequences and study their period and uniformity.",
    difficulty: "Beginner", topic: "Modular arithmetic, pseudo-randomness",
    applications: "Monte Carlo event generation", icon: Binary, accent: "from-fuchsia-500 to-purple-600", status: "soon",
  },
  {
    id: "monte-carlo-pi", moduleNumber: 2, module: "Random Numbers",
    name: "Monte Carlo Estimation of π", description: "Estimate π by random sampling of points in a square and circle.",
    difficulty: "Beginner", topic: "Monte Carlo integration, probability",
    applications: "Particle production simulation", icon: Target, accent: "from-purple-500 to-fuchsia-600", status: "complete",
  },
  // Module 3
  {
    id: "bisection", moduleNumber: 3, module: "Root Finding",
    name: "Bisection Method", description: "Bracket a root and halve the interval until the desired tolerance is met.",
    difficulty: "Beginner", topic: "Intermediate Value Theorem, bracketing",
    applications: "Transcendental equations, freeze-out T", icon: Split, accent: "from-rose-500 to-red-600", status: "complete",
  },
  {
    id: "newton-raphson", moduleNumber: 3, module: "Root Finding",
    name: "Newton–Raphson Method", description: "Use tangent lines and derivatives for rapid quadratic convergence to a root.",
    difficulty: "Intermediate", topic: "Taylor expansion, fixed-point iteration",
    applications: "Equation of state, transcendental roots", icon: FunctionSquare, accent: "from-red-500 to-orange-600", status: "complete",
  },
  {
    id: "secant", moduleNumber: 3, module: "Root Finding",
    name: "Secant Method", description: "Derivative-free root finding using secant lines through two points.",
    difficulty: "Intermediate", topic: "Finite-difference Newton, superlinear convergence",
    applications: "Roots without analytic derivative", icon: LineChart, accent: "from-orange-500 to-rose-600", status: "complete",
  },
  // Module 4
  {
    id: "euler", moduleNumber: 4, module: "Differential Equations",
    name: "Euler Method", description: "The simplest explicit scheme for solving first-order ODEs y' = f(x,y).",
    difficulty: "Beginner", topic: "First-order ODE, finite steps",
    applications: "Radioactive decay, simple kinetics", icon: Footprints, accent: "from-emerald-500 to-teal-600", status: "complete",
  },
  {
    id: "rk2", moduleNumber: 4, module: "Differential Equations",
    name: "Runge–Kutta (RK2)", description: "Second-order Runge–Kutta improving on Euler using a midpoint/trapezoidal estimate.",
    difficulty: "Intermediate", topic: "Predictor–corrector, second-order accuracy",
    applications: "Transport equations, decay chains", icon: Waves, accent: "from-teal-500 to-emerald-600", status: "soon",
  },
  {
    id: "rk4", moduleNumber: 4, module: "Differential Equations",
    name: "Runge–Kutta (RK4)", description: "The workhorse fourth-order method balancing accuracy and cost.",
    difficulty: "Advanced", topic: "Fourth-order accuracy, weighted slopes",
    applications: "Hydrodynamic evolution, orbital mechanics", icon: Waves, accent: "from-green-600 to-teal-600", status: "complete",
  },
  // Module 5
  {
    id: "least-squares", moduleNumber: 5, module: "Curve Fitting",
    name: "Least Squares Fitting", description: "Fit the best straight line to data by minimising squared residuals.",
    difficulty: "Intermediate", topic: "Normal equations, regression, R²",
    applications: "pT spectra fitting, exponential/Gaussian fits", icon: Ruler, accent: "from-amber-500 to-orange-600", status: "complete",
  },
  // Module 6
  {
    id: "differentiation", moduleNumber: 6, module: "Numerical Differentiation",
    name: "Numerical Differentiation", description: "Compare forward, backward and central difference formulas and their errors.",
    difficulty: "Intermediate", topic: "Finite differences, truncation error",
    applications: "Velocity/acceleration from data", icon: GitCompareArrows, accent: "from-cyan-500 to-sky-600", status: "soon",
  },
  // Module 7
  {
    id: "gauss-elimination", moduleNumber: 7, module: "Matrix Methods",
    name: "Gauss Elimination", description: "Solve a linear system by forward elimination and back substitution.",
    difficulty: "Intermediate", topic: "Linear systems, pivoting",
    applications: "Detector calibration, coupled equations", icon: Table2, accent: "from-violet-500 to-indigo-600", status: "complete",
  },
  {
    id: "gauss-seidel", moduleNumber: 7, module: "Matrix Methods",
    name: "Gauss–Seidel Method", description: "Iteratively solve a linear system and watch the error decay to zero.",
    difficulty: "Advanced", topic: "Iterative solvers, diagonal dominance",
    applications: "Large sparse systems, relaxation", icon: Calculator, accent: "from-indigo-500 to-violet-600", status: "soon",
  },
  // Module 8
  {
    id: "newton-forward", moduleNumber: 8, module: "Interpolation",
    name: "Newton Forward Interpolation", description: "Build a forward-difference table and interpolate on equally spaced data.",
    difficulty: "Intermediate", topic: "Finite differences, interpolation polynomial",
    applications: "Tabulated data interpolation", icon: ScatterChart, accent: "from-pink-500 to-rose-600", status: "soon",
  },
  {
    id: "lagrange", moduleNumber: 8, module: "Interpolation",
    name: "Lagrange Interpolation", description: "Construct an interpolating polynomial for arbitrarily spaced data points.",
    difficulty: "Intermediate", topic: "Lagrange basis polynomials",
    applications: "Unequal-spacing interpolation", icon: Waypoints, accent: "from-rose-500 to-pink-600", status: "soon",
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

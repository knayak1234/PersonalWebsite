import { Link } from "wouter";
import LabShell from "@/components/lab/LabShell";
import ExperimentScaffold from "@/components/lab/ExperimentScaffold";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getExperiment, getNeighbors } from "@/lib/lab/registry";
import type { ExperimentMeta } from "@/lib/lab/types";
import type { ExperimentContent } from "@/components/lab/ExperimentScaffold";
import { Construction, ArrowLeft } from "lucide-react";

// Builders for fully-implemented experiments.
import buildTrapezoidal from "@/components/lab/experiments/trapezoidal";
import buildSimpson13 from "@/components/lab/experiments/simpson13";
import buildSimpson38 from "@/components/lab/experiments/simpson38";
import buildMonteCarloPi from "@/components/lab/experiments/monteCarloPi";
import buildBisection from "@/components/lab/experiments/bisection";
import buildNewtonRaphson from "@/components/lab/experiments/newtonRaphson";
import buildSecant from "@/components/lab/experiments/secant";
import buildEuler from "@/components/lab/experiments/euler";
import buildRk2 from "@/components/lab/experiments/rk2";
import buildRk4 from "@/components/lab/experiments/rk4";
import buildLeastSquares from "@/components/lab/experiments/leastSquares";
import buildGaussElimination from "@/components/lab/experiments/gaussElimination";
import buildLcg from "@/components/lab/experiments/lcg";
import buildDifferentiation from "@/components/lab/experiments/differentiation";
import buildGaussSeidel from "@/components/lab/experiments/gaussSeidel";
import buildNewtonForward from "@/components/lab/experiments/newtonForward";
import buildLagrange from "@/components/lab/experiments/lagrange";

type Builder = (meta: ExperimentMeta, prev?: ExperimentMeta, next?: ExperimentMeta) => ExperimentContent;

const BUILDERS: Record<string, Builder> = {
  trapezoidal: buildTrapezoidal,
  "simpson-13": buildSimpson13,
  "simpson-38": buildSimpson38,
  "monte-carlo-pi": buildMonteCarloPi,
  bisection: buildBisection,
  "newton-raphson": buildNewtonRaphson,
  secant: buildSecant,
  euler: buildEuler,
  rk2: buildRk2,
  rk4: buildRk4,
  "least-squares": buildLeastSquares,
  "gauss-elimination": buildGaussElimination,
  lcg: buildLcg,
  differentiation: buildDifferentiation,
  "gauss-seidel": buildGaussSeidel,
  "newton-forward": buildNewtonForward,
  lagrange: buildLagrange,
};

function ComingSoon({ meta }: { meta: ExperimentMeta }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mx-auto mb-6">
        <Construction className="w-8 h-8" />
      </div>
      <Badge variant="outline" className="mb-3">Module {meta.moduleNumber} · {meta.module}</Badge>
      <h1 className="text-3xl font-bold font-serif gradient-text mb-3">{meta.name}</h1>
      <p className="text-muted-foreground mb-2">{meta.description}</p>
      <p className="text-sm text-muted-foreground mb-8">
        This experiment's interactive page is being prepared and will follow the same 10-section
        format (theory, derivation, simulator, visualization, C program, viva and practice problems)
        as the published experiments. The numerical engine for it is already implemented.
      </p>
      <Button asChild>
        <Link href="/teaching/computer-programming">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}

export default function ExperimentPage({ params }: { params: { id: string } }) {
  const meta = getExperiment(params.id);

  if (!meta) {
    return (
      <LabShell crumb="Not found">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Experiment not found</h1>
          <p className="text-muted-foreground mb-6">No experiment matches “{params.id}”.</p>
          <Button asChild>
            <Link href="/teaching/computer-programming">Back to Dashboard</Link>
          </Button>
        </div>
      </LabShell>
    );
  }

  const builder = BUILDERS[meta.id];
  if (!builder) {
    return (
      <LabShell crumb={meta.name}>
        <ComingSoon meta={meta} />
      </LabShell>
    );
  }

  const { prev, next } = getNeighbors(meta.id);
  const content = builder(meta, prev, next);

  return (
    <LabShell crumb={meta.name}>
      <ExperimentScaffold content={content} />
    </LabShell>
  );
}

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LabShell from "@/components/lab/LabShell";
import { MODULES, EXPERIMENTS } from "@/lib/lab/registry";
import type { ExperimentMeta } from "@/lib/lab/types";
import {
  FlaskConical, ArrowRight, Sparkles, BookOpenCheck, Code2, GitCompareArrows, Atom,
} from "lucide-react";

const diffStyle: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Advanced: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function ExperimentCard({ exp }: { exp: ExperimentMeta }) {
  const Icon = exp.icon;
  const isSoon = exp.status === "soon";
  const inner = (
    <Card className={`research-card h-full group ${isSoon ? "opacity-75" : "hover:glow-border cursor-pointer"}`}>
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${exp.accent} text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <Badge className={`text-[10px] ${diffStyle[exp.difficulty]}`}>{exp.difficulty}</Badge>
        </div>
        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{exp.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">{exp.description}</p>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-start gap-1.5 text-[11px]">
            <GitCompareArrows className="w-3 h-3 mt-0.5 text-primary shrink-0" />
            <span className="text-muted-foreground"><strong className="text-foreground">Topic:</strong> {exp.topic}</span>
          </div>
          <div className="flex items-start gap-1.5 text-[11px]">
            <Atom className="w-3 h-3 mt-0.5 text-primary shrink-0" />
            <span className="text-muted-foreground"><strong className="text-foreground">Physics:</strong> {exp.applications}</span>
          </div>
        </div>
        {isSoon ? (
          <Badge variant="outline" className="text-[10px] w-fit">Coming soon</Badge>
        ) : (
          <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 gap-1 transition-all">
            Open Experiment <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
  return isSoon ? <div>{inner}</div> : (
    <Link href={`/teaching/computer-programming/${exp.id}`}>{inner}</Link>
  );
}

export default function LabHome() {
  const [filter, setFilter] = useState<number | "all">("all");

  useEffect(() => {
    document.title = "MSc Physics Computer Programming Laboratory | Numerical Methods & Computational Physics | Dr. Kishora Nayak";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Interactive virtual laboratory for the PH-C-415 Computer Practical (I) syllabus: quadratic equations, sorting, series summation, interpolation (linear, quadratic, Stirling, cubic spline, Newton, Lagrange), transcendental equations, matrix operations, determinant, inverse, Gauss elimination, LU decomposition and least-squares fitting with live simulators, derivations, C programs and viva questions."
      );
    }
    window.scrollTo(0, 0);
  }, []);

  const completed = EXPERIMENTS.filter((e) => e.status === "complete").length;
  const visible = filter === "all" ? EXPERIMENTS : EXPERIMENTS.filter((e) => e.moduleNumber === filter);

  return (
    <LabShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Virtual Laboratory
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif gradient-text mb-4 max-w-4xl">
            MSc Physics Computer Programming Laboratory
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            Interactive Numerical Methods and Computational Physics Learning Portal. Learn the
            theory, experiment with live simulators, visualise algorithms, study the C
            implementations, and prepare for your viva.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Button asChild>
              <a href="#experiments"><FlaskConical className="w-4 h-4 mr-1" /> Explore Experiments</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/teaching/computer-programming/comparison">
                <GitCompareArrows className="w-4 h-4 mr-1" /> Comparison Dashboard
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
            {[
              { icon: FlaskConical, n: `${completed}`, l: "Interactive Experiments" },
              { icon: BookOpenCheck, n: `${MODULES.length}`, l: "Modules" },
              { icon: Code2, n: `${completed}`, l: "C Programs" },
              { icon: Atom, n: "10", l: "Sections / Experiment" },
            ].map((s, i) => (
              <Card key={i} className="text-center research-card glow">
                <CardContent className="p-4">
                  <s.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold stat-number">{s.n}</div>
                  <div className="text-[11px] text-muted-foreground">{s.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Module filter */}
      <section id="experiments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold font-serif mb-1">Experiments by Module</h2>
        <p className="text-sm text-muted-foreground mb-6">Filter by module or browse the full catalogue.</p>
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            All Modules
          </button>
          {MODULES.map((m) => (
            <button
              key={m.number}
              onClick={() => setFilter(m.number)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === m.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {m.number}. {m.title}
            </button>
          ))}
        </div>

        {(filter === "all" ? MODULES : MODULES.filter((m) => m.number === filter)).map((m) => {
          const exps = visible.filter((e) => e.moduleNumber === m.number);
          if (!exps.length) return null;
          const MIcon = m.icon;
          return (
            <div key={m.number} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.accent} text-white flex items-center justify-center shadow`}>
                  <MIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Module {m.number}: {m.title}</h3>
                  <p className="text-xs text-muted-foreground">{m.blurb}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exps.map((e) => <ExperimentCard key={e.id} exp={e} />)}
              </div>
            </div>
          );
        })}
      </section>
    </LabShell>
  );
}

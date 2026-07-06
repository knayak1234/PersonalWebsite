import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LabShell from "@/components/lab/LabShell";
import { MODULES, EXPERIMENTS } from "@/lib/lab/registry";
import type { ExperimentMeta } from "@/lib/lab/types";
import {
  FlaskConical, ArrowRight, Sparkles, BookOpenCheck, Code2, GitCompareArrows, Atom,
  ListTree, ChevronRight, Search, SearchX,
} from "lucide-react";

/** Fade-up entrance used for scroll-reveal blocks. */
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
} as const;

/** Animated integer that counts up when it scrolls into view. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 900;
    const t0 = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{n}</span>;
}

const diffStyle: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Advanced: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

const diffDot: Record<string, string> = {
  Beginner: "bg-green-500",
  Intermediate: "bg-amber-500",
  Advanced: "bg-rose-500",
};

function ExperimentCard({ exp }: { exp: ExperimentMeta }) {
  const Icon = exp.icon;
  const isSoon = exp.status === "soon";
  const inner = (
    <Card className={`research-card h-full group transition-all duration-300 ${isSoon ? "opacity-75" : "hover:glow-border cursor-pointer hover:-translate-y-1 hover:shadow-lg"}`}>
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${exp.accent} text-white flex items-center justify-center shadow group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
            <Icon className="w-4 h-4" />
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
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matchesQuery = (e: ExperimentMeta) =>
    !q ||
    e.name.toLowerCase().includes(q) ||
    e.topic.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q);
  const matchCount = EXPERIMENTS.filter(matchesQuery).length;

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
        {/* Slow-drifting ambient blobs */}
        <motion.div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/25 to-indigo-500/15 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-fuchsia-400/15 to-sky-400/20 blur-3xl"
          animate={{ x: [0, 36, 0], y: [0, -18, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" /> Interactive Virtual Laboratory
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-3xl sm:text-5xl font-bold font-serif gradient-text mb-4 max-w-4xl"
          >
            MSc Physics Computer Programming Laboratory
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-lg text-muted-foreground max-w-3xl mb-6"
          >
            Interactive Numerical Methods and Computational Physics Learning Portal. Learn the
            theory, experiment with live simulators, visualise algorithms, study the C
            implementations, and prepare for your viva.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Button asChild>
              <a href="#experiments"><FlaskConical className="w-4 h-4 mr-1" /> Explore Experiments</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/teaching/computer-programming/comparison">
                <GitCompareArrows className="w-4 h-4 mr-1" /> Comparison Dashboard
              </Link>
            </Button>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
            {[
              { icon: FlaskConical, n: completed, l: "Interactive Experiments" },
              { icon: BookOpenCheck, n: MODULES.length, l: "Modules" },
              { icon: Code2, n: completed, l: "C Programs" },
              { icon: Atom, n: 10, l: "Sections / Experiment" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
              >
                <Card className="text-center research-card glow transition-transform duration-300 hover:-translate-y-1">
                  <CardContent className="p-4">
                    <s.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold stat-number"><CountUp value={s.n} /></div>
                    <div className="text-[11px] text-muted-foreground">{s.l}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course contents — quick index of every experiment.
          Modules are grouped into four explicit columns of near-equal height. */}
      <section id="contents" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ListTree className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold font-serif">Course Contents</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Jump straight to any experiment in any module.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search experiments…"
              aria-label="Search experiments"
              className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/40 focus:border-primary/50 placeholder:text-muted-foreground"
            />
            {q && (
              <span className="absolute -bottom-5 left-3 text-[11px] text-muted-foreground">
                {matchCount} match{matchCount === 1 ? "" : "es"}
              </span>
            )}
          </div>
        </div>
        {matchCount === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <SearchX className="w-8 h-8" />
            <p className="text-sm">No experiments match “{query}”.</p>
            <button onClick={() => setQuery("")} className="text-xs text-primary hover:underline">
              Clear search
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {[[1, 2, 3], [4, 7], [5, 6], [8]].map((col, ci) => (
            <div key={ci} className="space-y-4">
              {col.map((num) => {
                const m = MODULES.find((x) => x.number === num)!;
                const exps = EXPERIMENTS.filter((e) => e.moduleNumber === m.number).filter(matchesQuery);
                if (!exps.length) return null;
                const MIcon = m.icon;
                return (
                  <motion.div key={m.number} {...fadeUp} transition={{ duration: 0.45, delay: ci * 0.06 }}>
                  <Card className="research-card transition-shadow duration-300 hover:shadow-md">
                <CardContent className="p-4">
                  <button
                    onClick={() => {
                      setFilter(m.number);
                      document.getElementById("experiments")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-2.5 mb-3 w-full text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.accent} text-white flex items-center justify-center shadow shrink-0`}>
                      <MIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Module {m.number}
                      </div>
                      <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {m.title}
                      </div>
                    </div>
                  </button>
                  <ul className="space-y-0.5">
                    {exps.map((e) => {
                      const n = EXPERIMENTS.indexOf(e) + 1;
                      const row = (
                        <span className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug hover:bg-primary/5 hover:text-primary transition-colors">
                          <span className="w-5 shrink-0 text-right text-[10px] font-mono text-muted-foreground">
                            {n}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffDot[e.difficulty]}`}
                            title={e.difficulty}
                          />
                          <span className="flex-1">{e.name}</span>
                          {e.status === "soon" ? (
                            <Badge variant="outline" className="text-[9px] shrink-0">Soon</Badge>
                          ) : (
                            <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      );
                      return (
                        <li key={e.id}>
                          {e.status === "soon" ? (
                            <span className="block opacity-60 cursor-default">{row}</span>
                          ) : (
                            <Link href={`/teaching/computer-programming/${e.id}`}>{row}</Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                    </CardContent>
                  </Card>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Module filter */}
      <section id="experiments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-border/60">
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
              <motion.div {...fadeUp} transition={{ duration: 0.45 }} className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.accent} text-white flex items-center justify-center shadow`}>
                  <MIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Module {m.number}: {m.title}</h3>
                  <p className="text-xs text-muted-foreground">{m.blurb}</p>
                </div>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exps.map((e, i) => (
                  <motion.div key={e.id} {...fadeUp} transition={{ duration: 0.45, delay: (i % 3) * 0.07 }} className="h-full">
                    <ExperimentCard exp={e} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </LabShell>
  );
}

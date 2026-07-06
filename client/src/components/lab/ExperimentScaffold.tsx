import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import CodeBlock from "./CodeBlock";
import VivaAccordion from "./VivaAccordion";
import PracticeProblems from "./PracticeProblems";
import { AlgorithmSteps, Pseudocode, Flowchart } from "./Pseudocode";
import type { ExperimentMeta, VivaQA, Problem, AlgoStep } from "@/lib/lab/types";
import {
  BookOpen, Lightbulb, ListOrdered, FlaskConical, BarChart3,
  Code2, HelpCircle, PencilRuler, Library, ChevronLeft, ChevronRight, Atom,
} from "lucide-react";

export interface ExperimentContent {
  meta: ExperimentMeta;
  intro: React.ReactNode;
  applications: React.ReactNode; // physics applications block
  theory: React.ReactNode;
  algorithm: { steps: AlgoStep[]; pseudocode: string; flowchart: string[] };
  simulator: React.ReactNode; // interactive component (controls + viz + results)
  cCode: string;
  cFilename: string;
  viva: VivaQA[];
  problems: Problem[];
  references: React.ReactNode;
  prev?: { id: string; name: string };
  next?: { id: string; name: string };
}

const SECTIONS = [
  { id: "introduction", label: "Introduction", icon: BookOpen },
  { id: "theory", label: "Theory", icon: Lightbulb },
  { id: "algorithm", label: "Algorithm", icon: ListOrdered },
  { id: "lab", label: "Interactive Lab", icon: FlaskConical },
  { id: "applications", label: "Physics", icon: Atom },
  { id: "code", label: "C Program", icon: Code2 },
  { id: "viva", label: "Viva", icon: HelpCircle },
  { id: "practice", label: "Practice", icon: PencilRuler },
  { id: "references", label: "References", icon: Library },
];

const diffStyle: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Advanced: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function SectionHeader({ icon: Icon, title, n }: { icon: any; title: string; n: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold font-serif">
        <span className="text-primary mr-2">{n}.</span>
        {title}
      </h2>
    </div>
  );
}

/**
 * ExperimentScaffold — renders the standard 10-section experiment page used by
 * every experiment, with a sticky in-page section navigator and prev/next links.
 */
export default function ExperimentScaffold({ content }: { content: ExperimentContent }) {
  const { meta } = content;
  const [active, setActive] = useState("introduction");

  // Update SEO tags for this experiment (client-side; SPA).
  useEffect(() => {
    const title = `${meta.name} — MSc Physics Computer Programming Lab | Dr. Kishora Nayak`;
    document.title = title;
    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        const [k, v] = attr.split("=");
        el.setAttribute(k, v.replace(/"/g, ""));
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };
    const desc = `${meta.name}: ${meta.description} Interactive simulator, theory, derivation, C program, viva questions and practice problems for MSc Physics students.`;
    setMeta('meta[name="description"]', 'name="description"', desc);
    setMeta('meta[property="og:title"]', 'property="og:title"', title);
    setMeta('meta[property="og:description"]', 'property="og:description"', desc);
    window.scrollTo(0, 0);
    return () => {
      document.title = "Dr. Kishora Nayak | Experimental Physicist | High Energy Physics & QCD Research";
    };
  }, [meta]);

  // Scroll-spy for the section navigator.
  useEffect(() => {
    const handler = () => {
      let current = "introduction";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs">Module {meta.moduleNumber} · {meta.module}</Badge>
          <Badge className={`text-xs ${diffStyle[meta.difficulty]}`}>{meta.difficulty}</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif gradient-text mb-2">{meta.name}</h1>
        <p className="text-muted-foreground max-w-3xl">{meta.description}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-muted-foreground">
          <span><strong className="text-foreground">Topic:</strong> {meta.topic}</span>
          <span><strong className="text-foreground">Applications:</strong> {meta.applications}</span>
        </div>
      </div>

      {/* Sticky section navigator */}
      <div className="sticky top-14 z-40 -mx-4 px-4 py-2 mb-8 bg-background/90 backdrop-blur border-y border-border no-print">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                active === s.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-14">
        {/* 1. Introduction */}
        <section id="introduction" className="scroll-mt-32">
          <SectionHeader icon={BookOpen} title="Introduction" n={1} />
          <div className="prose-lab">{content.intro}</div>
        </section>

        {/* 2. Theory */}
        <section id="theory" className="scroll-mt-32">
          <SectionHeader icon={Lightbulb} title="Theory & Derivation" n={2} />
          <div className="prose-lab">{content.theory}</div>
        </section>

        {/* 3. Algorithm */}
        <section id="algorithm" className="scroll-mt-32">
          <SectionHeader icon={ListOrdered} title="Algorithm" n={3} />
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Step-by-step procedure</h3>
                  <AlgorithmSteps steps={content.algorithm.steps} />
                </CardContent>
              </Card>
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Pseudocode</h3>
                <Pseudocode code={content.algorithm.pseudocode} />
              </div>
            </div>
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Flowchart</h3>
                <Flowchart steps={content.algorithm.flowchart} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4-6. Interactive Lab (simulator + visualization + numerical results) */}
        <section id="lab" className="scroll-mt-32">
          <SectionHeader icon={FlaskConical} title="Interactive Lab" n={4} />
          <p className="text-sm text-muted-foreground mb-5 -mt-2">
            Change parameters, run the computation, and watch the visualization, numerical
            output and convergence update live.
          </p>
          {content.simulator}
        </section>

        {/* Physics applications */}
        <section id="applications" className="scroll-mt-32">
          <SectionHeader icon={Atom} title="Physics Applications" n={5} />
          <div className="prose-lab">{content.applications}</div>
        </section>

        {/* 7. C Program */}
        <section id="code" className="scroll-mt-32">
          <SectionHeader icon={Code2} title="C Program" n={6} />
          <CodeBlock code={content.cCode} filename={content.cFilename} language="c" />
        </section>

        {/* 8. Viva */}
        <section id="viva" className="scroll-mt-32">
          <SectionHeader icon={HelpCircle} title="Viva Questions" n={7} />
          <p className="text-sm text-muted-foreground mb-4 -mt-2">
            Tap a question to reveal the answer. {content.viva.length} questions for exam preparation.
          </p>
          <VivaAccordion items={content.viva} />
        </section>

        {/* 9. Practice */}
        <section id="practice" className="scroll-mt-32">
          <SectionHeader icon={PencilRuler} title="Practice Problems" n={8} />
          <PracticeProblems problems={content.problems} />
        </section>

        {/* 10. References */}
        <section id="references" className="scroll-mt-32">
          <SectionHeader icon={Library} title="References" n={9} />
          <div className="prose-lab text-sm">{content.references}</div>
        </section>
      </div>

      {/* Prev / Next */}
      <div className="grid sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-border">
        {content.prev ? (
          <Link
            href={`/teaching/computer-programming/${content.prev.id}`}
            className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Previous</div>
              <div className="text-sm font-semibold">{content.prev.name}</div>
            </div>
          </Link>
        ) : <div />}
        {content.next && (
          <Link
            href={`/teaching/computer-programming/${content.next.id}`}
            className="group flex items-center justify-end gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-right"
          >
            <div>
              <div className="text-xs text-muted-foreground">Next</div>
              <div className="text-sm font-semibold">{content.next.name}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </Link>
        )}
      </div>
    </div>
  );
}

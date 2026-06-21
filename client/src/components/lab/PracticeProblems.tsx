import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import type { Problem } from "@/lib/lab/types";

const levelStyle: Record<Problem["level"], string> = {
  Easy: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Advanced: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function ProblemCard({ problem, index }: { problem: Problem; index: number }) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">Problem {index + 1}</span>
        <Badge className={`text-xs ${levelStyle[problem.level]}`}>{problem.level}</Badge>
      </div>
      <p className="text-sm leading-relaxed">{problem.text}</p>
      {problem.hint && (
        <div className="mt-3">
          <button
            onClick={() => setShowHint((s) => !s)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? "Hide hint" : "Show hint"}
          </button>
          {showHint && (
            <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">{problem.hint}</p>
          )}
        </div>
      )}
    </div>
  );
}

/** Groups practice problems by difficulty (Easy → Medium → Advanced). */
export default function PracticeProblems({ problems }: { problems: Problem[] }) {
  const groups: Problem["level"][] = ["Easy", "Medium", "Advanced"];
  return (
    <div className="space-y-6">
      {groups.map((level) => {
        const items = problems.filter((p) => p.level === level);
        if (!items.length) return null;
        return (
          <div key={level}>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Badge className={`text-xs ${levelStyle[level]}`}>{level}</Badge>
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((p, i) => (
                <ProblemCard key={i} problem={p} index={problems.indexOf(p)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

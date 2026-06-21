import type { AlgoStep } from "@/lib/lab/types";
import { ArrowDown } from "lucide-react";

/** Renders a numbered step-by-step procedure (algorithm). */
export function AlgorithmSteps({ steps }: { steps: AlgoStep[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

/** Monospaced pseudocode block. */
export function Pseudocode({ code }: { code: string }) {
  return (
    <pre className="rounded-lg border border-border bg-muted/50 p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
      {code}
    </pre>
  );
}

/** A simple vertical flowchart built from step labels. */
export function Flowchart({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {steps.map((label, i) => {
        const isTerminal = i === 0 || i === steps.length - 1;
        return (
          <div key={i} className="flex flex-col items-center w-full max-w-sm">
            <div
              className={`w-full text-center text-xs font-medium px-4 py-2.5 border shadow-sm ${
                isTerminal
                  ? "rounded-full bg-primary/10 border-primary/30 text-primary"
                  : "rounded-md bg-card border-border"
              }`}
            >
              {label}
            </div>
            {i < steps.length - 1 && <ArrowDown className="w-4 h-4 text-muted-foreground my-0.5" />}
          </div>
        );
      })}
    </div>
  );
}

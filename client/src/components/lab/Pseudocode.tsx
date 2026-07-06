import type { AlgoStep } from "@/lib/lab/types";
import type { ReactNode } from "react";
import { ArrowDown } from "lucide-react";

/**
 * Render inline scientific notation as real <sub>/<sup> elements.
 * Supports `x_0`, `x^2` (single char), `x_{k+1}`, `A^{-1}` ({} group) and
 * `(−1)^(number of swaps)` (() group). Any other text (including existing
 * Unicode sub/superscripts like x₀ or A⁻¹) is passed through unchanged.
 */
export function Sci({ children }: { children: string }) {
  const nodes: ReactNode[] = [];
  let buf = "";
  let key = 0;
  const flush = () => {
    if (buf) {
      nodes.push(buf);
      buf = "";
    }
  };

  for (let i = 0; i < children.length; i++) {
    const ch = children[i];
    if ((ch === "_" || ch === "^") && i + 1 < children.length) {
      const opener = children[i + 1];
      let content = "";
      let next = i;
      if (opener === "{" || opener === "(") {
        const closer = opener === "{" ? "}" : ")";
        let j = i + 2;
        while (j < children.length && children[j] !== closer) content += children[j++];
        next = j; // index of closer; loop's i++ steps past it
      } else {
        content = opener;
        next = i + 1;
      }
      if (content) {
        flush();
        nodes.push(ch === "_" ? <sub key={key++}>{content}</sub> : <sup key={key++}>{content}</sup>);
        i = next;
        continue;
      }
    }
    buf += ch;
  }
  flush();
  return <>{nodes}</>;
}

/** Renders a numbered step-by-step procedure (algorithm). */
export function AlgorithmSteps({ steps }: { steps: AlgoStep[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed"><Sci>{s.label}</Sci></span>
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

type NodeKind = "terminal" | "io" | "decision" | "process";

/** Classify a flowchart step into a standard flowchart symbol. */
function nodeKind(label: string, i: number, len: number): NodeKind {
  const t = label.trim();
  if (i === 0 || i === len - 1) return "terminal";
  if (t.endsWith("?")) return "decision";
  if (/^(read|input|output|print|display)\b/i.test(t)) return "io";
  return "process";
}

/** A single flowchart node rendered with its correct symbol shape. */
function FlowNode({ label, kind }: { label: string; kind: NodeKind }) {
  if (kind === "terminal") {
    return (
      <div className="rounded-full border border-primary/30 bg-primary/10 text-primary px-6 py-2.5 text-xs font-semibold text-center shadow-sm">
        <Sci>{label}</Sci>
      </div>
    );
  }

  if (kind === "io") {
    // Parallelogram (input/output): skew the box, counter-skew the text.
    return (
      <div className="-skew-x-[18deg] rounded-sm border border-sky-400/50 bg-sky-50 dark:bg-sky-950/30 px-5 py-2.5 shadow-sm">
        <span className="block skew-x-[18deg] text-xs font-medium text-center text-sky-700 dark:text-sky-300">
          <Sci>{label}</Sci>
        </span>
      </div>
    );
  }

  if (kind === "decision") {
    // Diamond: a rotated square with the (upright) condition text centered on top.
    return (
      <div className="relative flex items-center justify-center h-28 w-28 my-1">
        <div className="absolute inset-0 rotate-45 rounded-md border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 shadow-sm" />
        <span className="relative z-10 max-w-[6.5rem] px-1 text-center text-xs font-medium text-amber-700 dark:text-amber-300">
          <Sci>{label}</Sci>
        </span>
      </div>
    );
  }

  // Process: plain rectangle.
  return (
    <div className="rounded-md border border-border bg-card px-4 py-2.5 text-xs font-medium text-center shadow-sm">
      <Sci>{label}</Sci>
    </div>
  );
}

/** A vertical flowchart built from step labels, using standard flowchart symbols. */
export function Flowchart({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {steps.map((label, i) => {
        const kind = nodeKind(label, i, steps.length);
        return (
          <div key={i} className="flex w-full max-w-[16rem] flex-col items-center">
            <FlowNode label={label} kind={kind} />
            {i < steps.length - 1 && (
              <ArrowDown className="my-1 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}

import { Info, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

type Tone = "info" | "warn" | "success" | "tip";

const toneMap: Record<Tone, { icon: any; cls: string }> = {
  info: { icon: Info, cls: "border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800" },
  warn: { icon: AlertTriangle, cls: "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800" },
  success: { icon: CheckCircle2, cls: "border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800" },
  tip: { icon: Zap, cls: "border-violet-300 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-800" },
};

/** Coloured callout box used inside theory / introduction sections. */
export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, cls } = toneMap[tone];
  return (
    <div className={`rounded-lg border p-4 my-4 ${cls}`}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
        <div className="text-sm leading-relaxed">
          {title && <div className="font-semibold mb-1">{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

/** A compact two-column list of facts (advantages, limitations, etc.). */
export function FactGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 my-4">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-border p-3 bg-card">
          <div className="text-xs font-semibold text-primary mb-0.5">{it.label}</div>
          <div className="text-sm text-muted-foreground">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

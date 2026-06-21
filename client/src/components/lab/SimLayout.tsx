import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";

/**
 * SimLayout — standard two-column simulator layout: a controls panel on the
 * left and an output (visualization + results) area on the right. Keeps every
 * experiment's interactive lab visually consistent.
 */
export default function SimLayout({
  controls,
  output,
  onRun,
  onReset,
  runLabel = "Run",
}: {
  controls: React.ReactNode;
  output: React.ReactNode;
  onRun?: () => void;
  onReset?: () => void;
  runLabel?: string;
}) {
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <Card className="h-fit lg:sticky lg:top-32">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Parameters</h3>
          {controls}
          {(onRun || onReset) && (
            <div className="flex gap-2 pt-2">
              {onRun && (
                <Button onClick={onRun} className="flex-1" size="sm">
                  <Play className="w-4 h-4 mr-1" /> {runLabel}
                </Button>
              )}
              {onReset && (
                <Button onClick={onReset} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="space-y-6 min-w-0">{output}</div>
    </div>
  );
}

/** A labelled stat tile for showing a key numeric output (value, error, etc.). */
export function StatTile({ label, value, accent = "text-primary" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className={`text-lg font-bold font-mono ${accent}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

/** A titled output sub-section (Visualization / Numerical Results). */
export function OutputBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">{title}</h4>
        {children}
      </CardContent>
    </Card>
  );
}

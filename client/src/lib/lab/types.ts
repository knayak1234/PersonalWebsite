import type { LucideIcon } from "lucide-react";

/** Difficulty levels shown on cards and badges. */
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

/** A single viva question with a hidden answer. */
export interface VivaQA {
  q: string;
  a: string;
}

/** A practice problem at a given difficulty. */
export interface Problem {
  level: "Easy" | "Medium" | "Advanced";
  text: string;
  hint?: string;
}

/** A flowchart / algorithm step. */
export interface AlgoStep {
  label: string;
}

/** Metadata used by the dashboard cards and registry. */
export interface ExperimentMeta {
  id: string;
  moduleNumber: number;
  module: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  topic: string; // mathematical topic
  applications: string; // physics applications (short)
  icon: LucideIcon;
  accent: string; // tailwind gradient e.g. "from-blue-500 to-indigo-600"
  status: "complete" | "soon";
}

/** Module grouping for the dashboard. */
export interface LabModule {
  number: number;
  title: string;
  blurb: string;
  icon: LucideIcon;
  accent: string;
}

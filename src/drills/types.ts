import type { Case, Declension } from '../data/nouns';

// What gets written to `attempts` alongside the drill type — each drill fills in
// whatever it can meaningfully attribute an answer to.
export interface AttemptMeta {
  chapter?: number;
  declension?: Declension;
  case?: Case;
}

export interface McDrill {
  kind: 'mc';
  type: string;
  label: string;
  prompt: string;
  options: string[];
  answer: string;
  // Shown after answering — why the answer is what it is.
  explanation?: string;
  meta: AttemptMeta;
}

export type Drill = McDrill;

// The pool a generator may draw from — set by the course gates, not the drill.
export interface DrillContext {
  declensions: Set<Declension>;
  chapters: Set<number>;
}

export interface DrillType {
  type: string;
  label: string;
  // Null when the current gates leave nothing to draw from.
  make: (ctx: DrillContext) => Drill | null;
}

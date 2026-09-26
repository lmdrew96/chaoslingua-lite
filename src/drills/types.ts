import type { Case, Declension, Parse, ParseNoun } from '../data/nouns';

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

// Form → case + number + declension + job. Graded against every valid parse, since
// many forms fit more than one slot.
export interface ParseDrill {
  kind: 'parse';
  type: string;
  label: string;
  noun: ParseNoun;
  form: string;
  parses: Parse[];
  meta: AttemptMeta;
}

export type Drill = McDrill | ParseDrill;

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
  // A follow-up drill that must come next (e.g. a minimal-pair partner), if any.
  takeQueued?: () => Drill | null;
}

import { pick } from '../lib/random';
import { ch1Generators } from './ch1';
import { ch2Generators } from './ch2';
import { ch3Generators } from './ch3';
import { ch4Generators } from './ch4';
import { ch5Generators } from './ch5';
import type { DrillGenerator, GeneratedDrill } from './types';

// Chapter registry — future chapters get appended here without touching
// each chapter's own drill logic.
const CHAPTER_GENERATORS: Array<{ chapter: number; generators: DrillGenerator[] }> = [
  { chapter: 1, generators: ch1Generators },
  { chapter: 2, generators: ch2Generators },
  { chapter: 3, generators: ch3Generators },
  { chapter: 4, generators: ch4Generators },
  { chapter: 5, generators: ch5Generators },
];

export const CHAPTERS: number[] = CHAPTER_GENERATORS.map((c) => c.chapter);

export interface DrillGroup {
  chapter: number;
  type: string;
  label: string;
  generator: DrillGenerator;
}

// Every generator returns a fixed `type`/`label` regardless of its random content, so
// sampling each one once at module load builds the filter menu without a second
// place to keep those strings in sync.
export const DRILL_GROUPS: DrillGroup[] = CHAPTER_GENERATORS.flatMap(({ chapter, generators }) =>
  generators.map((generator) => {
    const sample = generator();
    return { chapter, type: sample.type, label: sample.label, generator };
  }),
);

export const ALL_LABELS: string[] = [...new Set(DRILL_GROUPS.map((g) => g.label))];

export interface DrillFilter {
  chapters: Set<number>;
  types: Set<string>;
}

export function matchingDrillCount(filter: DrillFilter): number {
  return DRILL_GROUPS.filter((g) => filter.chapters.has(g.chapter) && filter.types.has(g.label)).length;
}

export function makeDrill(filter?: DrillFilter): GeneratedDrill {
  const pool = filter
    ? DRILL_GROUPS.filter((g) => filter.chapters.has(g.chapter) && filter.types.has(g.label))
    : DRILL_GROUPS;
  const chosen = pool.length ? pool : DRILL_GROUPS;
  const group = pick(chosen);
  return { ...group.generator(), chapter: group.chapter };
}

// Maps weak-area drillType strings (from convex/attempts.getWeakAreas) back to the
// chapter/label combination the practice filter understands.
export function drillGroupsForTypes(types: string[]): DrillGroup[] {
  const wanted = new Set(types);
  return DRILL_GROUPS.filter((g) => wanted.has(g.type));
}

export type { Drill, GeneratedDrill } from './types';

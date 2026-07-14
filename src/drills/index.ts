import { pick } from '../lib/random';
import { ch1Generators } from './ch1';
import type { Drill, DrillGenerator } from './types';

// Chapter registry — future chapters (ch2Generators, etc.) get appended here
// without touching each chapter's own drill logic.
const ALL_GENERATORS: DrillGenerator[] = [...ch1Generators];

export function makeDrill(): Drill {
  return pick(ALL_GENERATORS)();
}

export type { Drill } from './types';

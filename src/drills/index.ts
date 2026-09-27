import { shuffle } from '../lib/random';
import { decodeDrill } from './decode';
import { parseDrill } from './parse';
import { wordOrderDrill } from './wordOrder';
import type { Drill, DrillContext, DrillType } from './types';

// Drill registry — new drill types get appended here.
export const DRILL_TYPES: DrillType[] = [parseDrill, decodeDrill, wordOrderDrill];

export const ALL_TYPES: string[] = DRILL_TYPES.map((d) => d.type);

export const labelFor = (type: string): string => DRILL_TYPES.find((d) => d.type === type)?.label ?? type;

// Serves any queued follow-up first (a minimal pair's partner), then tries the selected
// types in random order until one can build a drill under the current gates. Falls
// back to any type if the selection is empty.
export function makeDrill(types: Set<string>, ctx: DrillContext): Drill | null {
  const selected = DRILL_TYPES.filter((d) => types.has(d.type));
  for (const drillType of selected) {
    const queued = drillType.takeQueued?.();
    if (queued) return queued;
  }
  for (const drillType of shuffle(selected.length ? selected : DRILL_TYPES)) {
    const drill = drillType.make(ctx);
    if (drill) return drill;
  }
  return null;
}

export type { Drill, DrillContext } from './types';

import { useMemo, useState } from 'react';
import { CHAPTER_UNLOCKS, DECLENSION_UNLOCKS, openByDate, type Unlock } from '../data/course';
import type { Declension } from '../data/nouns';
import type { DrillContext } from '../drills/types';

const STORAGE_KEY = 'chaoslingua-lite:courseOverrides';

// Only the units Nae has flipped away from the schedule are stored, so a unit whose
// date arrives later still opens on its own unless she's explicitly turned it off.
interface Overrides {
  chapters: Record<string, boolean>;
  declensions: Record<string, boolean>;
}

const EMPTY: Overrides = { chapters: {}, declensions: {} };

function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Overrides>;
    return { chapters: parsed.chapters ?? {}, declensions: parsed.declensions ?? {} };
  } catch (err) {
    console.warn('Ignoring unreadable course settings', err);
    return EMPTY;
  }
}

const effective = <T extends number>(unlocks: Unlock<T>[], overrides: Record<string, boolean>): Set<T> => {
  const byDate = openByDate(unlocks);
  return new Set(unlocks.filter((u) => overrides[u.id] ?? byDate.has(u.id)).map((u) => u.id));
};

export function useCourse() {
  const [overrides, setOverrides] = useState<Overrides>(loadOverrides);

  const ctx = useMemo<DrillContext>(
    () => ({
      chapters: effective(CHAPTER_UNLOCKS, overrides.chapters),
      declensions: effective(DECLENSION_UNLOCKS, overrides.declensions),
    }),
    [overrides],
  );

  const save = (next: Overrides) => {
    setOverrides(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  // Flipping a unit back to what the schedule says drops its override entirely.
  const toggle = (kind: keyof Overrides, id: number, isOn: boolean, unlocks: Unlock<number>[]) => {
    const scheduled = openByDate(unlocks).has(id);
    const next = { ...overrides[kind] };
    if (!isOn === scheduled) delete next[id];
    else next[id] = !isOn;
    save({ ...overrides, [kind]: next });
  };

  const toggleChapter = (id: number) => toggle('chapters', id, ctx.chapters.has(id), CHAPTER_UNLOCKS);
  const toggleDeclension = (id: Declension) => toggle('declensions', id, ctx.declensions.has(id), DECLENSION_UNLOCKS);
  const followSchedule = () => save(EMPTY);
  const customized = Object.keys(overrides.chapters).length + Object.keys(overrides.declensions).length > 0;

  return { ctx, toggleChapter, toggleDeclension, followSchedule, customized };
}

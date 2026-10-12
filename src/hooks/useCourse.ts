import { useMemo, useState } from 'react';
import {
  CHAPTER_UNLOCKS,
  CONJUGATION_UNLOCKS,
  DECLENSION_UNLOCKS,
  TENSE_UNLOCKS,
  TOPIC_UNLOCKS,
  openByDate,
  type Topic,
  type Unlock,
} from '../data/course';
import type { Declension } from '../data/nouns';
import type { Tense, VerbGate } from '../data/verbs';
import type { DrillContext } from '../drills/types';

const STORAGE_KEY = 'chaoslingua-lite:courseOverrides';

// Only the units Nae has flipped away from the schedule are stored, so a unit whose
// date arrives later still opens on its own unless she's explicitly turned it off.
interface Overrides {
  chapters: Record<string, boolean>;
  declensions: Record<string, boolean>;
  tenses: Record<string, boolean>;
  conjugations: Record<string, boolean>;
  topics: Record<string, boolean>;
}

const EMPTY: Overrides = { chapters: {}, declensions: {}, tenses: {}, conjugations: {}, topics: {} };

function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Overrides>;
    return {
      chapters: parsed.chapters ?? {},
      declensions: parsed.declensions ?? {},
      tenses: parsed.tenses ?? {},
      conjugations: parsed.conjugations ?? {},
      topics: parsed.topics ?? {},
    };
  } catch (err) {
    console.warn('Ignoring unreadable course settings', err);
    return EMPTY;
  }
}

const effective = <T extends number | string>(unlocks: Unlock<T>[], overrides: Record<string, boolean>): Set<T> => {
  const byDate = openByDate(unlocks);
  return new Set(unlocks.filter((u) => overrides[String(u.id)] ?? byDate.has(u.id)).map((u) => u.id));
};

export function useCourse() {
  const [overrides, setOverrides] = useState<Overrides>(loadOverrides);

  const ctx = useMemo<DrillContext>(
    () => ({
      chapters: effective(CHAPTER_UNLOCKS, overrides.chapters),
      declensions: effective(DECLENSION_UNLOCKS, overrides.declensions),
      tenses: effective(TENSE_UNLOCKS, overrides.tenses),
      conjugations: effective(CONJUGATION_UNLOCKS, overrides.conjugations),
      topics: effective(TOPIC_UNLOCKS, overrides.topics),
    }),
    [overrides],
  );

  const save = (next: Overrides) => {
    setOverrides(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  // Flipping a unit back to what the schedule says drops its override entirely.
  const toggle = <T extends number | string>(kind: keyof Overrides, id: T, isOn: boolean, unlocks: Unlock<T>[]) => {
    const scheduled = openByDate(unlocks).has(id);
    const next = { ...overrides[kind] };
    if (!isOn === scheduled) delete next[String(id)];
    else next[String(id)] = !isOn;
    save({ ...overrides, [kind]: next });
  };

  const toggleChapter = (id: number) => toggle('chapters', id, ctx.chapters.has(id), CHAPTER_UNLOCKS);
  const toggleDeclension = (id: Declension) => toggle('declensions', id, ctx.declensions.has(id), DECLENSION_UNLOCKS);
  const toggleTense = (id: Tense) => toggle('tenses', id, ctx.tenses.has(id), TENSE_UNLOCKS);
  const toggleConjugation = (id: VerbGate) =>
    toggle('conjugations', id, ctx.conjugations.has(id), CONJUGATION_UNLOCKS);
  const toggleTopic = (id: Topic) => toggle('topics', id, ctx.topics.has(id), TOPIC_UNLOCKS);
  const followSchedule = () => save(EMPTY);
  const customized = Object.values(overrides).some((o) => Object.keys(o).length > 0);

  return { ctx, toggleChapter, toggleDeclension, toggleTense, toggleConjugation, toggleTopic, followSchedule, customized };
}

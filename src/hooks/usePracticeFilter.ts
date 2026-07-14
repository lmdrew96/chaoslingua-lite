import { useState } from 'react';
import { ALL_LABELS, CHAPTERS } from '../drills';

const STORAGE_KEY = 'chaoslingua-lite:practiceFilter';

interface StoredFilter {
  chapters: number[];
  types: string[];
}

function loadStored(): StoredFilter {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('no stored filter');
    const parsed = JSON.parse(raw) as Partial<StoredFilter>;
    const chapters = Array.isArray(parsed.chapters) ? parsed.chapters.filter((c) => CHAPTERS.includes(c)) : [];
    const types = Array.isArray(parsed.types) ? parsed.types.filter((t) => ALL_LABELS.includes(t)) : [];
    return {
      chapters: chapters.length ? chapters : [...CHAPTERS],
      types: types.length ? types : [...ALL_LABELS],
    };
  } catch {
    return { chapters: [...CHAPTERS], types: [...ALL_LABELS] };
  }
}

function persist(chapters: Set<number>, types: Set<string>) {
  const value: StoredFilter = { chapters: [...chapters], types: [...types] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function usePracticeFilter() {
  const [stored] = useState(loadStored);
  const [chapters, setChapters] = useState<Set<number>>(() => new Set(stored.chapters));
  const [types, setTypes] = useState<Set<string>>(() => new Set(stored.types));

  const toggleChapter = (chapter: number) => {
    setChapters((prev) => {
      if (prev.has(chapter) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      persist(next, types);
      return next;
    });
  };

  const toggleType = (label: string) => {
    setTypes((prev) => {
      if (prev.has(label) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      persist(chapters, next);
      return next;
    });
  };

  const resetFilter = () => {
    const allChapters = new Set(CHAPTERS);
    const allTypes = new Set(ALL_LABELS);
    setChapters(allChapters);
    setTypes(allTypes);
    persist(allChapters, allTypes);
  };

  // Bulk-replace the whole selection at once — used by "focus on weak spots" rather
  // than toggle-by-toggle, since that always has an exact target combination in mind.
  const applyFilter = (nextChapters: number[], nextTypes: string[]) => {
    const chaptersSet = new Set(nextChapters.length ? nextChapters : CHAPTERS);
    const typesSet = new Set(nextTypes.length ? nextTypes : ALL_LABELS);
    setChapters(chaptersSet);
    setTypes(typesSet);
    persist(chaptersSet, typesSet);
  };

  return { chapters, types, toggleChapter, toggleType, resetFilter, applyFilter };
}

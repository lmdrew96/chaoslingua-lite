import { useState } from 'react';
import { ALL_TYPES } from '../drills';

const STORAGE_KEY = 'chaoslingua-lite:practiceTypes';

function loadStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...ALL_TYPES];
    const parsed: unknown = JSON.parse(raw);
    const types = Array.isArray(parsed) ? parsed.filter((t): t is string => ALL_TYPES.includes(t)) : [];
    return types.length ? types : [...ALL_TYPES];
  } catch (err) {
    console.warn('Ignoring unreadable practice filter', err);
    return [...ALL_TYPES];
  }
}

function persist(types: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...types]));
}

export function usePracticeFilter() {
  const [types, setTypes] = useState<Set<string>>(() => new Set(loadStored()));

  const toggleType = (type: string) => {
    setTypes((prev) => {
      if (prev.has(type) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      persist(next);
      return next;
    });
  };

  const resetFilter = () => {
    const all = new Set(ALL_TYPES);
    setTypes(all);
    persist(all);
  };

  // Bulk-replace the selection — used by "focus on weak spots", which always has an
  // exact target set in mind.
  const applyFilter = (nextTypes: string[]) => {
    const next = new Set(nextTypes.filter((t) => ALL_TYPES.includes(t)));
    const final = next.size ? next : new Set(ALL_TYPES);
    setTypes(final);
    persist(final);
  };

  return { types, toggleType, resetFilter, applyFilter };
}

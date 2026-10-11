import { useState } from 'react';
import { ALL_TYPES } from '../drills';

const STORAGE_KEY = 'chaoslingua-lite:practiceTypes';
const ASK_CONJ_KEY = 'chaoslingua-lite:askConjugation';
const TYPE_KEY = 'chaoslingua-lite:typeAnswers';

function loadFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === 'on';
  } catch (err) {
    console.warn(`Ignoring unreadable setting ${key}`, err);
    return fallback;
  }
}

function saveFlag(key: string, on: boolean) {
  try {
    localStorage.setItem(key, on ? 'on' : 'off');
  } catch (err) {
    console.warn(`Could not save setting ${key}`, err);
  }
}

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
  // Whether the verb parse also asks for the conjugation.
  const [askConjugation, setAskConjugation] = useState(() => loadFlag(ASK_CONJ_KEY, true));
  // Whether drills that allow it (Conjugate) take a typed answer instead of MC.
  const [typeAnswers, setTypeAnswers] = useState(() => loadFlag(TYPE_KEY, false));

  const toggleAskConjugation = () => {
    saveFlag(ASK_CONJ_KEY, !askConjugation);
    setAskConjugation(!askConjugation);
  };

  const toggleTypeAnswers = () => {
    saveFlag(TYPE_KEY, !typeAnswers);
    setTypeAnswers(!typeAnswers);
  };

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

  return {
    types,
    toggleType,
    resetFilter,
    applyFilter,
    askConjugation,
    toggleAskConjugation,
    typeAnswers,
    toggleTypeAnswers,
  };
}

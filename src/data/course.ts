// When each Suburani chapter and noun declension opens up, following the LATN 101
// Canvas schedule. Adding a chapter or declension is a data change here — drills and
// Learn read these lists, they don't hardcode them.

import type { Declension } from './nouns';

export interface Unlock<T> {
  id: T;
  // Local calendar date (YYYY-MM-DD) the unit becomes available by default; null when
  // the class date isn't known yet, so it stays closed until toggled on.
  opens: string | null;
}

// Each chapter opens on the day Canvas assigns it as textbook reading (Modules 1–6).
export const CHAPTER_UNLOCKS: Unlock<number>[] = [
  { id: 1, opens: '2026-09-02' },
  { id: 2, opens: '2026-09-16' },
  { id: 3, opens: '2026-09-16' },
  { id: 4, opens: '2026-09-21' },
  { id: 5, opens: '2026-10-07' },
  { id: 6, opens: '2026-10-21' },
  { id: 7, opens: '2026-10-07' },
  { id: 8, opens: '2026-10-12' },
  { id: 9, opens: '2026-10-12' },
  { id: 10, opens: '2026-11-18' },
  { id: 11, opens: '2026-11-18' },
  // Ch.12 isn't assigned anywhere in the Module 1–6 schedules.
  { id: 12, opens: null },
  { id: 13, opens: '2026-12-02' },
  { id: 14, opens: '2026-12-04' },
  { id: 15, opens: '2026-12-04' },
  { id: 16, opens: '2026-12-02' },
  // Book 2 isn't on the Module 1–6 schedules; these stay closed until toggled on.
  { id: 17, opens: null },
  { id: 18, opens: null },
  { id: 19, opens: null },
  { id: 20, opens: null },
  { id: 21, opens: null },
  { id: 22, opens: null },
  { id: 23, opens: null },
  { id: 24, opens: null },
  { id: 25, opens: null },
  { id: 26, opens: null },
  { id: 27, opens: null },
  { id: 28, opens: null },
  { id: 29, opens: null },
  { id: 30, opens: null },
  { id: 31, opens: null },
  { id: 32, opens: null },
];

export const DECLENSION_UNLOCKS: Unlock<Declension>[] = [
  { id: 1, opens: '2026-09-02' },
  { id: 2, opens: '2026-09-02' },
  { id: 3, opens: '2026-09-02' },
  // Class covers the 4th and 5th declensions on Mon 9/28.
  { id: 4, opens: '2026-09-28' },
  { id: 5, opens: '2026-09-28' },
];

// Local date, not UTC — an evening study session shouldn't unlock tomorrow's chapter.
export const todayKey = (now: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const openByDate = <T>(unlocks: Unlock<T>[], today: string = todayKey()): Set<T> =>
  new Set(unlocks.filter((u) => u.opens !== null && u.opens <= today).map((u) => u.id));

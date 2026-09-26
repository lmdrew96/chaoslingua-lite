// When each Suburani chapter and noun declension opens up, following the LATN 101
// Canvas schedule. Adding a chapter or declension is a data change here — drills and
// Learn read these lists, they don't hardcode them.

import type { Declension } from './nouns';

export interface Unlock<T> {
  id: T;
  // Local calendar date (YYYY-MM-DD) the unit becomes available by default.
  opens: string;
}

export const CHAPTER_UNLOCKS: Unlock<number>[] = [
  { id: 1, opens: '2026-09-02' },
  { id: 2, opens: '2026-09-16' },
  { id: 3, opens: '2026-09-16' },
  { id: 4, opens: '2026-09-21' },
  // Ch.5 homework is due 10/9 and ch.6 on 10/21; each opens a week ahead.
  { id: 5, opens: '2026-10-02' },
  { id: 6, opens: '2026-10-14' },
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
  new Set(unlocks.filter((u) => u.opens <= today).map((u) => u.id));

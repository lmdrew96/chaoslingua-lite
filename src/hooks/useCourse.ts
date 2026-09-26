import { useMemo } from 'react';
import { CHAPTER_UNLOCKS, DECLENSION_UNLOCKS, openByDate } from '../data/course';
import type { DrillContext } from '../drills/types';

// Which chapters and declensions are open right now. The context object is memoized so
// drill-session effects don't re-fire on every render.
export function useCourse() {
  const ctx = useMemo<DrillContext>(
    () => ({ chapters: openByDate(CHAPTER_UNLOCKS), declensions: openByDate(DECLENSION_UNLOCKS) }),
    [],
  );
  return { ctx };
}

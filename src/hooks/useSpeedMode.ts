import { useState } from 'react';

const STORAGE_KEY = 'chaoslingua-lite:parseSpeedMode';

// Opt-in timing for the parse drill. It only observes: grading, progress, and logged
// attempts are untouched. Session-only stats; just the on/off choice is remembered.
export interface SpeedStats {
  // Consecutive correct parses, and the best run this session.
  streak: number;
  best: number;
  // Times of correct parses only, so a quick wrong guess can't pull the average down.
  correctMs: number[];
  lastMs: number | null;
}

const ZERO: SpeedStats = { streak: 0, best: 0, correctMs: [], lastMs: null };

function loadEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch (err) {
    console.warn('Ignoring unreadable speed-mode setting', err);
    return false;
  }
}

export function useSpeedMode() {
  const [enabled, setEnabled] = useState(loadEnabled);
  const [stats, setStats] = useState<SpeedStats>(ZERO);

  const toggle = () => {
    setEnabled((on) => {
      try {
        localStorage.setItem(STORAGE_KEY, on ? 'off' : 'on');
      } catch (err) {
        console.warn('Could not save speed-mode setting', err);
      }
      return !on;
    });
    setStats(ZERO);
  };

  const record = (isCorrect: boolean, ms: number) => {
    setStats((s) => {
      const streak = isCorrect ? s.streak + 1 : 0;
      return {
        streak,
        best: Math.max(s.best, streak),
        correctMs: isCorrect ? [...s.correctMs, ms] : s.correctMs,
        lastMs: ms,
      };
    });
  };

  return { enabled, stats, toggle, record };
}

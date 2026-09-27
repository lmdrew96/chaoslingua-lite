import { useEffect, useState } from 'react';
import type { SpeedStats } from '../hooks/useSpeedMode';

interface SpeedBarProps {
  startedAt: number;
  answered: boolean;
  stats: SpeedStats;
}

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

// Live clock while the parse is open; once checked, this parse's time plus the
// session's streak and average.
export function SpeedBar({ startedAt, answered, stats }: SpeedBarProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (answered) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [answered]);

  const avg = stats.correctMs.length
    ? stats.correctMs.reduce((a, b) => a + b, 0) / stats.correctMs.length
    : null;

  return (
    <div className="speed-bar" aria-live="off">
      <span className="stat">⏱ <b>{answered && stats.lastMs !== null ? seconds(stats.lastMs) : seconds(now - startedAt)}</b></span>
      <span className="stat">Streak: <b>{stats.streak}</b></span>
      <span className="stat">Best: <b>{stats.best}</b></span>
      <span className="stat">Avg correct: <b>{avg === null ? '—' : seconds(avg)}</b></span>
    </div>
  );
}

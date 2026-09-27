interface StreakPillProps {
  streak: number;
}

// Keyed on the streak so each increment remounts the pill and replays the pop.
export function StreakPill({ streak }: StreakPillProps) {
  return (
    <span key={streak} className={`pill${streak > 0 ? ' streak-pop' : ''}`}>
      🔥 {streak} streak
    </span>
  );
}

interface StreakPillProps {
  streak: number;
}

export function StreakPill({ streak }: StreakPillProps) {
  return <span className="pill">🔥 {streak} streak</span>;
}

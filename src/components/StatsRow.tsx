interface StatsRowProps {
  attempted: number;
  correct: number;
}

export function StatsRow({ attempted, correct }: StatsRowProps) {
  const accuracy = attempted ? `${Math.round((100 * correct) / attempted)}%` : '—';
  return (
    <div className="scoreboard">
      <div className="score">
        <b>{attempted}</b>
        <span>Attempted</span>
      </div>
      <div className="score">
        <b>{correct}</b>
        <span>Correct</span>
      </div>
      <div className="score">
        <b>{accuracy}</b>
        <span>Accuracy</span>
      </div>
    </div>
  );
}

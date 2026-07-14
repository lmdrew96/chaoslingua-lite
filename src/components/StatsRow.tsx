interface StatsRowProps {
  attempted: number;
  correct: number;
}

export function StatsRow({ attempted, correct }: StatsRowProps) {
  const accuracy = attempted ? `${Math.round((100 * correct) / attempted)}%` : '—';
  return (
    <div className="stats">
      <div className="stat">Attempted: <b>{attempted}</b></div>
      <div className="stat">Correct: <b>{correct}</b></div>
      <div className="stat">Accuracy: <b>{accuracy}</b></div>
    </div>
  );
}

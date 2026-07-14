interface ProgressBarProps {
  attempted: number;
  goal: number;
}

export function ProgressBar({ attempted, goal }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((100 * attempted) / goal));
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

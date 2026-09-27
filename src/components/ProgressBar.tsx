interface ProgressBarProps {
  attempted: number;
  goal: number;
}

export function ProgressBar({ attempted, goal }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((100 * attempted) / goal));
  const label = attempted < goal ? `${attempted} / ${goal}` : `Goal reached · ${attempted} done`;
  return (
    <div className="progress">
      <div className="progress-label">{label}</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

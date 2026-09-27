import { useState } from 'react';
import type { AttemptMeta, Drill } from '../drills/types';
import type { SpeedStats } from '../hooks/useSpeedMode';
import { McAnswer } from './McAnswer';
import { ParseAnswer } from './ParseAnswer';
import { ProgressBar } from './ProgressBar';
import { SpeedBar } from './SpeedBar';

// Present only while parse speed mode is on.
export interface SpeedModeProps {
  stats: SpeedStats;
  onResult: (isCorrect: boolean, ms: number) => void;
}

interface DrillCardProps {
  drill: Drill;
  attempted: number;
  sessionGoal: number;
  onAnswer: (isCorrect: boolean, meta?: AttemptMeta) => void;
  onNext: () => void;
  onReset: () => void;
  speed: SpeedModeProps | null;
}

// The parent remounts this card (via `key`) for every new drill, so answer state and
// the answer components' selections start fresh without a reset effect.
export function DrillCard({ drill, attempted, sessionGoal, onAnswer, onNext, onReset, speed }: DrillCardProps) {
  const [answered, setAnswered] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const timed = speed !== null && drill.kind === 'parse';

  const submit = (isCorrect: boolean, meta?: AttemptMeta) => {
    if (answered) return;
    setAnswered(true);
    if (timed) speed.onResult(isCorrect, Date.now() - startedAt);
    onAnswer(isCorrect, meta);
  };

  return (
    <div className="card">
      <div className="drill-type-label">{drill.label}</div>

      {drill.kind === 'parse' ? (
        <>
          <div className="prompt">
            Parse <span className="latin">{drill.form}</span>
          </div>
          {timed && <SpeedBar startedAt={startedAt} answered={answered} stats={speed.stats} />}
          <ParseAnswer drill={drill} answered={answered} onSubmit={submit} />
        </>
      ) : (
        <>
          <div className="prompt" dangerouslySetInnerHTML={{ __html: drill.prompt }} />
          <McAnswer drill={drill} answered={answered} onSubmit={(ok) => submit(ok)} />
        </>
      )}

      <ProgressBar attempted={attempted} goal={sessionGoal} />

      <div className="footer-row">
        <button className="reset-link" onClick={onReset}>
          Reset progress
        </button>
        {answered && (
          <button className="btn btn-secondary" onClick={onNext}>
            Next drill →
          </button>
        )}
      </div>
    </div>
  );
}

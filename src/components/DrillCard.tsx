import { useState } from 'react';
import type { AttemptMeta, Drill } from '../drills/types';
import { McAnswer } from './McAnswer';
import { ParseAnswer } from './ParseAnswer';
import { ProgressBar } from './ProgressBar';

interface DrillCardProps {
  drill: Drill;
  attempted: number;
  sessionGoal: number;
  onAnswer: (isCorrect: boolean, meta?: AttemptMeta) => void;
  onNext: () => void;
  onReset: () => void;
}

// The parent remounts this card (via `key`) for every new drill, so answer state and
// the answer components' selections start fresh without a reset effect.
export function DrillCard({ drill, attempted, sessionGoal, onAnswer, onNext, onReset }: DrillCardProps) {
  const [answered, setAnswered] = useState(false);

  const submit = (isCorrect: boolean, meta?: AttemptMeta) => {
    if (answered) return;
    setAnswered(true);
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

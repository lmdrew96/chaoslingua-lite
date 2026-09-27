import { useEffect, useState } from 'react';
import type { AttemptMeta, Drill } from '../drills/types';
import type { SpeedStats } from '../hooks/useSpeedMode';
import { McAnswer } from './McAnswer';
import { ParseAnswer } from './ParseAnswer';
import { ProgressBar } from './ProgressBar';
import { SpeedBar } from './SpeedBar';
import { shouldIgnoreHotkey } from '../lib/hotkeys';

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
  const [result, setResult] = useState<'good' | 'bad' | null>(null);
  const answered = result !== null;
  const [startedAt] = useState(() => Date.now());
  const timed = speed !== null && drill.kind === 'parse';

  const submit = (isCorrect: boolean, meta?: AttemptMeta) => {
    if (answered) return;
    setResult(isCorrect ? 'good' : 'bad');
    if (timed) speed.onResult(isCorrect, Date.now() - startedAt);
    onAnswer(isCorrect, meta);
  };

  // Enter moves on once the drill is answered.
  useEffect(() => {
    if (!answered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || shouldIgnoreHotkey(e)) return;
      e.preventDefault();
      onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, onNext]);

  return (
    <div className={`card stage-card${result ? ` result-${result}` : ''}`}>
      <div className="stage-head">
        <div className="drill-type-label">{drill.label}</div>
        <ProgressBar attempted={attempted} goal={sessionGoal} />
      </div>

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

      <div className="footer-row stage-foot">
        <button className="reset-link" onClick={onReset}>
          Reset progress
        </button>
        {answered ? (
          <button className="btn btn-secondary" onClick={onNext}>
            Next drill → <kbd className="btn-key" aria-hidden="true">Enter</kbd>
          </button>
        ) : (
          <span className="key-hint" aria-hidden="true">
            {drill.kind === 'mc' ? 'Press a number to answer' : 'Enter checks when every row is picked'}
          </span>
        )}
      </div>
    </div>
  );
}

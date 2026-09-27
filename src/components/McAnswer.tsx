import { useEffect, useState } from 'react';
import type { McDrill } from '../drills/types';
import { OptionButton } from './OptionButton';
import { shouldIgnoreHotkey } from '../lib/hotkeys';

interface McAnswerProps {
  drill: McDrill;
  answered: boolean;
  onSubmit: (isCorrect: boolean) => void;
}

export function McAnswer({ drill, answered, onSubmit }: McAnswerProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const correct = chosen === drill.answer;

  const choose = (opt: string) => {
    if (answered) return;
    setChosen(opt);
    onSubmit(opt === drill.answer);
  };

  // Number keys pick the matching option (1 = first).
  useEffect(() => {
    if (answered) return;
    const onKey = (e: KeyboardEvent) => {
      if (shouldIgnoreHotkey(e)) return;
      const opt = drill.options[Number(e.key) - 1];
      if (opt === undefined) return;
      e.preventDefault();
      choose(opt);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <div className="options">
        {drill.options.map((opt, i) => (
          <OptionButton
            key={opt}
            option={opt}
            answer={drill.answer}
            answered={answered}
            chosen={chosen}
            hotkey={i + 1}
            onClick={() => choose(opt)}
          />
        ))}
      </div>

      <div className={`feedback ${answered ? `show ${correct ? 'good' : 'bad'}` : ''}`}>
        {answered && (correct ? 'Recte! Correct.' : `Not quite — correct answer: ${drill.answer}`)}
        {answered && drill.explanation && <div className="feedback-detail">{drill.explanation}</div>}
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import type { Drill } from '../drills/types';
import { OptionButton } from './OptionButton';
import { TextAnswerInput } from './TextAnswerInput';
import { ProgressBar } from './ProgressBar';

interface DrillCardProps {
  drill: Drill;
  attempted: number;
  sessionGoal: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  onReset: () => void;
}

export function DrillCard({ drill, attempted, sessionGoal, onAnswer, onNext, onReset }: DrillCardProps) {
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);

  useEffect(() => {
    setAnswered(false);
    setChosen(null);
    setWasCorrect(false);
  }, [drill]);

  const submit = (isCorrect: boolean, choice: string | null) => {
    if (answered) return;
    setAnswered(true);
    setChosen(choice);
    setWasCorrect(isCorrect);
    onAnswer(isCorrect);
  };

  const isTextDrill = drill.type === 'translate_english_type';

  return (
    <div className="card">
      <div className="drill-type-label">{drill.label}</div>
      <div className="prompt" dangerouslySetInnerHTML={{ __html: drill.prompt }} />

      {isTextDrill ? (
        <TextAnswerInput
          drill={drill}
          answered={answered}
          onSubmit={(isCorrect, value) => submit(isCorrect, value)}
        />
      ) : (
        <div className="options">
          {drill.options?.map((opt) => (
            <OptionButton
              key={opt}
              option={opt}
              answer={drill.answer}
              answered={answered}
              chosen={chosen}
              onClick={() => submit(opt === drill.answer, opt)}
            />
          ))}
        </div>
      )}

      <div className={`feedback ${answered ? `show ${wasCorrect ? 'good' : 'bad'}` : ''}`}>
        {answered && (wasCorrect ? 'Recte! Correct.' : `Not quite — correct answer: ${drill.answer}`)}
      </div>

      <ProgressBar attempted={attempted} goal={sessionGoal} />

      <div className="footer-row">
        <button className="reset-link" onClick={onReset}>Reset progress</button>
        {answered && (
          <button className="btn btn-secondary" onClick={onNext}>
            Next drill →
          </button>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { McDrill } from '../drills/types';

interface TypedAnswerProps {
  drill: McDrill;
  answered: boolean;
  onSubmit: (isCorrect: boolean) => void;
}

const stripMacrons = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// Typed version of an MC drill. Grading ignores macrons — keyboards make them a chore
// — but a macron slip is pointed out, since mittis and mittēs are different forms.
export function TypedAnswer({ drill, answered, onSubmit }: TypedAnswerProps) {
  const [value, setValue] = useState('');
  const typed = value.trim().normalize('NFC');
  const exact = typed === drill.answer.normalize('NFC');
  const correct = stripMacrons(typed) === stripMacrons(drill.answer);

  const check = () => {
    if (answered || !typed) return;
    // Hand Enter back to the card's "next drill" hotkey once the input is gone.
    (document.activeElement as HTMLElement | null)?.blur();
    onSubmit(correct);
  };

  return (
    <>
      <form
        className="text-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <input
          type="text"
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Your answer"
          value={value}
          disabled={answered}
          onChange={(e) => setValue(e.target.value)}
        />
        {!answered && (
          <button type="submit" className="btn btn-primary" disabled={!typed}>
            Check
          </button>
        )}
      </form>
      <p className="filter-hint">Macrons optional — ā ē ī ō ū can be typed as a e i o u.</p>

      <div className={`feedback ${answered ? `show ${correct ? 'good' : 'bad'}` : ''}`}>
        {answered && (correct ? 'Recte! Correct.' : `Not quite — correct answer: ${drill.answer}`)}
        {answered && correct && !exact && (
          <div className="feedback-detail">
            Watch the macrons: it’s spelled <span className="latin">{drill.answer}</span>.
          </div>
        )}
        {answered && drill.explanation && <div className="feedback-detail">{drill.explanation}</div>}
      </div>
    </>
  );
}

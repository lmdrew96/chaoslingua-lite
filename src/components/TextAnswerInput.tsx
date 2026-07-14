import { useEffect, useRef, useState } from 'react';
import type { Drill } from '../drills/types';

interface TextAnswerInputProps {
  drill: Drill;
  answered: boolean;
  onSubmit: (isCorrect: boolean, value: string) => void;
}

export function TextAnswerInput({ drill, answered, onSubmit }: TextAnswerInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    inputRef.current?.focus();
  }, [drill]);

  const submit = () => {
    if (answered) return;
    const raw = value.trim().toLowerCase();
    const accept = (drill.accept ?? []).map((a) => a.toLowerCase());
    onSubmit(accept.includes(raw), value);
  };

  return (
    <div className="text-input-row">
      <input
        ref={inputRef}
        type="text"
        placeholder="Type your answer"
        autoComplete="off"
        spellCheck={false}
        value={value}
        disabled={answered}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !answered) submit();
        }}
      />
      <button className="btn btn-primary" disabled={answered} onClick={submit}>
        Check
      </button>
    </div>
  );
}

import { useState } from 'react';
import { caseJobs, caseUses } from '../data/cases';
import { CASES, DECLENSIONS, NUMBERS, caseNames, numberNames, ordinal, type Case, type Declension, type GNumber } from '../data/nouns';
import { jobPhrase } from '../drills/parse';
import type { AttemptMeta, ParseDrill } from '../drills/types';
import { shuffle } from '../lib/random';

interface ParseAnswerProps {
  drill: ParseDrill;
  answered: boolean;
  onSubmit: (isCorrect: boolean, meta: AttemptMeta) => void;
}

interface ChipRowProps<T extends string | number> {
  label: string;
  values: T[];
  selected: T | null;
  disabled: boolean;
  render: (v: T) => string;
  onSelect: (v: T) => void;
}

function ChipRow<T extends string | number>({ label, values, selected, disabled, render, onSelect }: ChipRowProps<T>) {
  return (
    <div className="parse-row">
      <div className="filter-group-label">{label}</div>
      <div className="chip-row">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            className={`chip-btn${selected === v ? ' active' : ''}`}
            aria-pressed={selected === v}
            disabled={disabled}
            onClick={() => onSelect(v)}
          >
            {render(v)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ParseAnswer({ drill, answered, onSubmit }: ParseAnswerProps) {
  const [chosenCase, setCase] = useState<Case | null>(null);
  const [chosenNumber, setNumber] = useState<GNumber | null>(null);
  const [chosenDecl, setDecl] = useState<Declension | null>(null);
  const [jobCase, setJobCase] = useState<Case | null>(null);

  // Jobs in a fresh order per drill, so the row never mirrors the chart's case order.
  const [jobOrder] = useState(() => shuffle(CASES));
  const jobNumber = chosenNumber ?? 'sg';

  const { noun, parses } = drill;
  const caseNumberOk = parses.some((p) => p.case === chosenCase && p.number === chosenNumber);
  const declOk = chosenDecl === noun.declension;
  const jobOk = jobCase === chosenCase;
  const ready = chosenCase && chosenNumber && chosenDecl && jobCase;

  const check = () => {
    if (!ready || answered) return;
    const correct = caseNumberOk && declOk && jobOk;
    // A correct answer on an ambiguous form is credited to the parse actually chosen.
    onSubmit(correct, correct ? { ...drill.meta, case: chosenCase } : drill.meta);
  };

  const correct = caseNumberOk && declOk && jobOk;

  return (
    <>
      <div className="parse-grid">
        <ChipRow label="Case" values={CASES} selected={chosenCase} disabled={answered} render={(c) => caseNames[c]} onSelect={setCase} />
        <ChipRow label="Number" values={NUMBERS} selected={chosenNumber} disabled={answered} render={(n) => numberNames[n]} onSelect={setNumber} />
        <ChipRow label="Declension" values={DECLENSIONS} selected={chosenDecl} disabled={answered} render={ordinal} onSelect={setDecl} />
        <ChipRow
          label="What it's doing"
          values={jobOrder}
          selected={jobCase}
          disabled={answered}
          render={(c) => jobPhrase(c, jobNumber, noun)}
          onSelect={setJobCase}
        />
      </div>

      {!answered && (
        <div className="footer-row">
          <span />
          <button className="btn btn-primary" disabled={!ready} onClick={check}>
            Check
          </button>
        </div>
      )}

      <div className={`feedback ${answered ? `show ${correct ? 'good' : 'bad'}` : ''}`}>
        {answered && (
          <>
            <div>{correct ? 'Recte! Correct.' : 'Not quite.'}</div>
            {!declOk && (
              <div className="feedback-detail">
                Declension: {noun.forms.sg.nom}, {noun.forms.sg.gen} is {ordinal(noun.declension)} declension.
              </div>
            )}
            {chosenCase && !jobOk && (
              <div className="feedback-detail">
                “{jobPhrase(jobCase!, jobNumber, noun)}” is the {caseNames[jobCase!]}’s job, not the {caseNames[chosenCase]}’s.
              </div>
            )}
            <div className="feedback-detail">
              <span className="latin">{drill.form}</span> {parses.length > 1 ? 'can be any of these:' : 'is:'}
              <ul className="parse-list">
                {parses.map((p) => (
                  <li key={`${p.case}-${p.number}`}>
                    <strong>
                      {caseNames[p.case]} {numberNames[p.number]}
                    </strong>{' '}
                    → {jobPhrase(p.case, p.number, noun)}
                    <div className="parse-use">
                      {caseNames[p.case]}: {caseJobs[p.case]} — e.g. <span className="latin">{caseUses[p.case][0].example}</span>{' '}
                      ({caseUses[p.case][0].translation})
                    </div>
                  </li>
                ))}
              </ul>
              {parses.length > 1 && <div>On its own the form fits all of these — in a sentence, the context decides.</div>}
            </div>
          </>
        )}
      </div>
    </>
  );
}

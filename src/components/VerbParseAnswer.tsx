import { useEffect, useState } from 'react';
import { NUMBERS, numberNames, type GNumber } from '../data/nouns';
import { englishFor } from '../data/englishVerbs';
import {
  CONJUGATIONS,
  PERSONS,
  conjugationLabel,
  lemmaOf,
  personNames,
  sameSlot,
  segmentsOf,
  tenseNames,
  type Conjugation,
  type Person,
  type Tense,
  type VerbSlot,
} from '../data/verbs';
import type { AttemptMeta, VerbParseDrill } from '../drills/types';
import { shouldIgnoreHotkey } from '../lib/hotkeys';
import { ChipRow } from './ParseAnswer';
import { VerbParts } from './VerbParts';

interface VerbParseAnswerProps {
  drill: VerbParseDrill;
  askConjugation: boolean;
  answered: boolean;
  onSubmit: (isCorrect: boolean, meta: AttemptMeta) => void;
}

const slotName = (s: VerbSlot): string => `${personNames[s.person]} ${numberNames[s.number]} ${tenseNames[s.tense]}`;

export function VerbParseAnswer({ drill, askConjugation, answered, onSubmit }: VerbParseAnswerProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [number, setNumber] = useState<GNumber | null>(null);
  const [tense, setTense] = useState<Tense | null>(null);
  const [conj, setConj] = useState<Conjugation | null>(null);
  const [meaning, setMeaning] = useState<number | null>(null);

  const { verb, parses, meanings } = drill;
  const english = (s: VerbSlot) => englishFor(verb.gloss, s.tense, s.number, s.person);
  const chosen = person && number && tense ? { person, number, tense } : null;
  const slotOk = chosen !== null && parses.some((p) => sameSlot(p, chosen));
  const conjOk = !askConjugation || conj === verb.conjugation;
  const chosenMeaning = meaning === null ? null : meanings[meaning];
  const meaningOk = chosen !== null && chosenMeaning !== null && sameSlot(chosenMeaning, chosen);
  const ready = chosen && (!askConjugation || conj) && meaning !== null;
  const correct = slotOk && conjOk && meaningOk;
  const dictionary = `${lemmaOf(verb)}, ${verb.infinitive}`;

  const check = () => {
    if (!ready || answered) return;
    // A correct answer on an ambiguous form is credited to the parse actually chosen.
    onSubmit(correct, correct && chosen ? { ...drill.meta, ...chosen } : drill.meta);
  };

  // Enter checks once every row is picked.
  useEffect(() => {
    if (answered || !ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || shouldIgnoreHotkey(e)) return;
      e.preventDefault();
      check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <div className="parse-grid">
        <ChipRow label="Person" values={PERSONS} selected={person} disabled={answered} render={(p) => personNames[p]} onSelect={setPerson} />
        <ChipRow label="Number" values={NUMBERS} selected={number} disabled={answered} render={(n) => numberNames[n]} onSelect={setNumber} />
        <ChipRow label="Tense" values={drill.tenses} selected={tense} disabled={answered} render={(t) => tenseNames[t]} onSelect={setTense} />
        {askConjugation && (
          <ChipRow label="Conjugation" values={CONJUGATIONS} selected={conj} disabled={answered} render={conjugationLabel} onSelect={setConj} />
        )}
        <ChipRow
          label="What it means"
          values={meanings.map((_, i) => i)}
          selected={meaning}
          disabled={answered}
          render={(i) => english(meanings[i])}
          onSelect={setMeaning}
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
            {!conjOk && (
              <div className="feedback-detail">
                Conjugation: <span className="latin">{dictionary}</span> is{' '}
                {verb.conjugation === 'irr' ? 'irregular' : `${conjugationLabel(verb.conjugation)} conjugation`}.
              </div>
            )}
            {chosen && chosenMeaning && !meaningOk && (
              <div className="feedback-detail">
                “{english(chosenMeaning)}” is the {slotName(chosenMeaning)}, not the {slotName(chosen)}.
              </div>
            )}
            <div className="feedback-detail">
              <span className="latin">{drill.form}</span> (from <span className="latin">{dictionary}</span>, “{verb.gloss}”){' '}
              {parses.length > 1 ? 'can be any of these:' : 'is:'}
              <ul className="parse-list">
                {parses.map((p) => {
                  const parts = segmentsOf(verb, p, drill.form);
                  return (
                    <li key={`${p.tense}-${p.number}-${p.person}`}>
                      <strong>{slotName(p)}</strong> → {english(p)}
                      {parts && (
                        <div className="parse-use">
                          <VerbParts {...parts} /> — {parts.sign ? 'stem · tense sign · ending' : 'stem · ending'}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}

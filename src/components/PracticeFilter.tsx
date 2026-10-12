import { useState } from 'react';
import {
  CHAPTER_UNLOCKS,
  CONJUGATION_UNLOCKS,
  DECLENSION_UNLOCKS,
  PERFECT_UNLOCKS,
  TENSE_UNLOCKS,
  TOPIC_UNLOCKS,
  openByDate,
  topicNames,
  type Topic,
} from '../data/course';
import { ordinal, type Declension } from '../data/nouns';
import { gateLabel, tenseNames, type Tense, type VerbGate } from '../data/verbs';
import { ALL_TYPES, descriptionFor, labelFor } from '../drills';
import type { DrillContext } from '../drills/types';

interface PracticeFilterProps {
  ctx: DrillContext;
  onToggleChapter: (id: number) => void;
  onToggleDeclension: (id: Declension) => void;
  onToggleTense: (id: Tense) => void;
  onToggleConjugation: (id: VerbGate) => void;
  onTogglePerfect: (id: VerbGate) => void;
  onToggleTopic: (id: Topic) => void;
  onFollowSchedule: () => void;
  customized: boolean;
  types: Set<string>;
  onToggleType: (type: string) => void;
  onReset: () => void;
  weakSpotsAvailable: boolean;
  onFocusWeakSpots: (() => void) | null;
  speedMode: boolean;
  onToggleSpeedMode: () => void;
  askConjugation: boolean;
  onToggleAskConjugation: () => void;
  typeAnswers: boolean;
  onToggleTypeAnswers: () => void;
}

// "1–3" for a contiguous run, "1, 2, 5" otherwise.
const rangeLabel = (ids: number[]): string => {
  const sorted = [...ids].sort((a, b) => a - b);
  if (!sorted.length) return 'none';
  const contiguous = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
  return contiguous && sorted.length > 1 ? `${sorted[0]}–${sorted[sorted.length - 1]}` : sorted.join(', ');
};

const shortDate = (iso: string | null): string => {
  if (!iso) return 'date TBD';
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
};

export function PracticeFilter({
  ctx,
  onToggleChapter,
  onToggleDeclension,
  onToggleTense,
  onToggleConjugation,
  onTogglePerfect,
  onToggleTopic,
  onFollowSchedule,
  customized,
  types,
  onToggleType,
  onReset,
  weakSpotsAvailable,
  onFocusWeakSpots,
  speedMode,
  onToggleSpeedMode,
  askConjugation,
  onToggleAskConjugation,
  typeAnswers,
  onToggleTypeAnswers,
}: PracticeFilterProps) {
  const [open, setOpen] = useState(false);

  const isNarrowed = types.size !== ALL_TYPES.length;
  const summary = isNarrowed ? [...types].map(labelFor).join(', ') : 'All drills';
  const scheduledChapters = openByDate(CHAPTER_UNLOCKS);
  const scheduledDeclensions = openByDate(DECLENSION_UNLOCKS);
  const scheduledTenses = openByDate(TENSE_UNLOCKS);
  const scheduledConjugations = openByDate(CONJUGATION_UNLOCKS);
  const scheduledPerfect = openByDate(PERFECT_UNLOCKS);
  const scheduledTopics = openByDate(TOPIC_UNLOCKS);

  return (
    <div className="practice-filter">
      <button type="button" className="pill pill-button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Practicing: {summary} · Decl. {rangeLabel([...ctx.declensions])} · Ch. {rangeLabel([...ctx.chapters])}{' '}
        {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-group">
            <div className="filter-group-label">Drill type</div>
            <div className="chip-row">
              {ALL_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`chip-btn chip-described${types.has(type) ? ' active' : ''}`}
                  aria-pressed={types.has(type)}
                  disabled={types.has(type) && types.size === 1}
                  onClick={() => onToggleType(type)}
                >
                  <span className="chip-label">{labelFor(type)}</span>
                  <span className="chip-desc">{descriptionFor(type)}</span>
                </button>
              ))}
            </div>
          </div>

          {(types.has('parse') || types.has('verb-parse')) && (
            <div className="filter-group">
              <div className="filter-group-label">Parse options</div>
              <div className="option-stack">
                <div className="chip-row">
                  <button
                    type="button"
                    className={`chip-btn${speedMode ? ' active' : ''}`}
                    aria-pressed={speedMode}
                    onClick={onToggleSpeedMode}
                  >
                    ⏱ Speed mode
                  </button>
                </div>
                <p className="filter-hint">Times each parse and tracks a streak of correct ones. Grading stays the same.</p>
                {types.has('verb-parse') && (
                  <div className="chip-row">
                    <button
                      type="button"
                      className={`chip-btn${askConjugation ? ' active' : ''}`}
                      aria-pressed={askConjugation}
                      onClick={onToggleAskConjugation}
                    >
                      Ask the verb’s conjugation
                    </button>
                  </div>
                )}
                {types.has('verb-parse') && (
                  <p className="filter-hint">Verb parses also ask which conjugation the verb belongs to.</p>
                )}
              </div>
            </div>
          )}

          {types.has('conjugate') && (
            <div className="filter-group">
              <div className="filter-group-label">Conjugate</div>
              <div className="chip-row">
                <button
                  type="button"
                  className={`chip-btn${typeAnswers ? ' active' : ''}`}
                  aria-pressed={typeAnswers}
                  onClick={onToggleTypeAnswers}
                >
                  ⌨ Type the answer
                </button>
              </div>
              <p className="filter-hint">Type the form instead of choosing it. Missing macrons are pointed out, not marked wrong.</p>
            </div>
          )}

          <div className="filter-group">
            <div className="filter-group-label">Declensions</div>
            <div className="chip-row">
              {DECLENSION_UNLOCKS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`chip-btn${ctx.declensions.has(u.id) ? ' active' : ''}`}
                  aria-pressed={ctx.declensions.has(u.id)}
                  onClick={() => onToggleDeclension(u.id)}
                >
                  {ordinal(u.id)}
                  {!scheduledDeclensions.has(u.id) && <span className="chip-note"> · class {shortDate(u.opens)}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Verb tenses</div>
            <div className="chip-row">
              {TENSE_UNLOCKS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`chip-btn${ctx.tenses.has(u.id) ? ' active' : ''}`}
                  aria-pressed={ctx.tenses.has(u.id)}
                  onClick={() => onToggleTense(u.id)}
                >
                  {tenseNames[u.id]}
                  {!scheduledTenses.has(u.id) && <span className="chip-note"> · class {shortDate(u.opens)}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Conjugations</div>
            <div className="chip-row">
              {CONJUGATION_UNLOCKS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`chip-btn${ctx.conjugations.has(u.id) ? ' active' : ''}`}
                  aria-pressed={ctx.conjugations.has(u.id)}
                  onClick={() => onToggleConjugation(u.id)}
                >
                  {gateLabel(u.id)}
                  {!scheduledConjugations.has(u.id) && <span className="chip-note"> · class {shortDate(u.opens)}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Topics</div>
            <div className="chip-row">
              {TOPIC_UNLOCKS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`chip-btn${ctx.topics.has(u.id) ? ' active' : ''}`}
                  aria-pressed={ctx.topics.has(u.id)}
                  onClick={() => onToggleTopic(u.id)}
                >
                  {topicNames[u.id]}
                  {!scheduledTopics.has(u.id) && <span className="chip-note"> · class {shortDate(u.opens)}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Perfect system</div>
            <div className="chip-row">
              {PERFECT_UNLOCKS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`chip-btn${ctx.perfectGates.has(u.id) ? ' active' : ''}`}
                  aria-pressed={ctx.perfectGates.has(u.id)}
                  onClick={() => onTogglePerfect(u.id)}
                >
                  {gateLabel(u.id)}
                  {!scheduledPerfect.has(u.id) && <span className="chip-note"> · class {shortDate(u.opens)}</span>}
                </button>
              ))}
            </div>
            <p className="filter-hint">
              Which verbs drill the perfect, future perfect and pluperfect once those tenses are on. Irregulars other
              than sum open with the chapter that introduces them.
            </p>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Suburani chapters (decode vocab)</div>
            <div className="chip-row">
              {CHAPTER_UNLOCKS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`chip-btn${ctx.chapters.has(u.id) ? ' active' : ''}`}
                  aria-pressed={ctx.chapters.has(u.id)}
                  onClick={() => onToggleChapter(u.id)}
                >
                  Ch. {u.id}
                  {!scheduledChapters.has(u.id) && <span className="chip-note"> · {shortDate(u.opens)}</span>}
                </button>
              ))}
            </div>
            <p className="filter-hint">
              These open on their own as class reaches them.
              {customized && (
                <>
                  {' '}
                  <button type="button" className="reset-link" onClick={onFollowSchedule}>
                    Follow the class schedule again
                  </button>
                </>
              )}
            </p>
          </div>

          {onFocusWeakSpots && !weakSpotsAvailable && (
            <p className="filter-hint">Keep practicing — weak-spot tracking needs a few more logged attempts.</p>
          )}

          <div className="filter-footer">
            <p className="filter-hint">Applies to your next drill.</p>
            <div className="filter-footer-actions">
              {onFocusWeakSpots && (
                <button type="button" className="btn btn-ghost" disabled={!weakSpotsAvailable} onClick={onFocusWeakSpots}>
                  🎯 Focus on weak spots
                </button>
              )}
              {isNarrowed && (
                <button type="button" className="reset-link" onClick={onReset}>
                  Reset filter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

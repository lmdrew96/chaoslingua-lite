import { useState } from 'react';
import { ALL_LABELS, CHAPTERS, matchingDrillCount } from '../drills';

interface PracticeFilterProps {
  chapters: Set<number>;
  types: Set<string>;
  onToggleChapter: (chapter: number) => void;
  onToggleType: (label: string) => void;
  onReset: () => void;
}

function summarize(size: number, total: number, allLabel: string, unit: string): string {
  return size === total ? allLabel : `${size}/${total} ${unit}`;
}

export function PracticeFilter({ chapters, types, onToggleChapter, onToggleType, onReset }: PracticeFilterProps) {
  const [open, setOpen] = useState(false);

  const chapterSummary = summarize(chapters.size, CHAPTERS.length, 'All chapters', 'chapters');
  const typeSummary = summarize(types.size, ALL_LABELS.length, 'All types', 'types');
  const isNarrowed = chapters.size !== CHAPTERS.length || types.size !== ALL_LABELS.length;
  const matchCount = matchingDrillCount({ chapters, types });

  return (
    <div className="practice-filter">
      <button type="button" className="pill pill-button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Practicing: {chapterSummary} · {typeSummary} {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-group">
            <div className="filter-group-label">Chapters</div>
            <div className="chip-row">
              {CHAPTERS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  className={`chip-btn${chapters.has(ch) ? ' active' : ''}`}
                  aria-pressed={chapters.has(ch)}
                  disabled={chapters.has(ch) && chapters.size === 1}
                  onClick={() => onToggleChapter(ch)}
                >
                  Ch. {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Drill type</div>
            <div className="chip-row">
              {ALL_LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`chip-btn${types.has(label) ? ' active' : ''}`}
                  aria-pressed={types.has(label)}
                  disabled={types.has(label) && types.size === 1}
                  onClick={() => onToggleType(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {matchCount === 0 && (
            <div className="filter-warning">
              No drills match that combination — showing all chapters and types until you adjust it.
            </div>
          )}

          <div className="filter-footer">
            <p className="filter-hint">Applies to your next drill.</p>
            {isNarrowed && (
              <button type="button" className="reset-link" onClick={onReset}>
                Reset filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

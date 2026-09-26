import { useState } from 'react';
import { ALL_TYPES, labelFor } from '../drills';

interface PracticeFilterProps {
  types: Set<string>;
  onToggleType: (type: string) => void;
  onReset: () => void;
  weakSpotsAvailable: boolean;
  onFocusWeakSpots: (() => void) | null;
}

export function PracticeFilter({ types, onToggleType, onReset, weakSpotsAvailable, onFocusWeakSpots }: PracticeFilterProps) {
  const [open, setOpen] = useState(false);

  if (ALL_TYPES.length === 0) return null;

  const isNarrowed = types.size !== ALL_TYPES.length;
  const summary = isNarrowed ? [...types].map(labelFor).join(', ') : 'All drills';

  return (
    <div className="practice-filter">
      <button type="button" className="pill pill-button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Practicing: {summary} {open ? '▴' : '▾'}
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
                  className={`chip-btn${types.has(type) ? ' active' : ''}`}
                  aria-pressed={types.has(type)}
                  disabled={types.has(type) && types.size === 1}
                  onClick={() => onToggleType(type)}
                >
                  {labelFor(type)}
                </button>
              ))}
            </div>
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

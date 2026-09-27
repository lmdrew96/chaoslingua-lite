// Sourced full paradigms for vocab nouns — the only place sentence drills get a
// dative, ablative, or genitive from. Endings are never applied by rule.

import { MODEL_NOUNS, type Case, type GNumber } from '../data/nouns';
import { IMPORTED_PARADIGMS } from '../data/paradigms.generated';
import type { VocabEntry } from '../data/vocab';

export type Forms = Record<GNumber, Record<Case, string>>;

// The textbook table when the noun is a model noun (puella, amīcus, cīvis, …), else
// its Wiktionary import if that passed review. Null when neither exists.
export const sourcedForms = (v: VocabEntry): Forms | null => {
  const model = MODEL_NOUNS.find((n) => n.forms.sg.nom === v.la);
  if (model) return model.forms;
  const imported = IMPORTED_PARADIGMS[v.id];
  return imported && !imported.review ? imported.forms : null;
};

// The first listed English sense: "slave, enslaved person (male)" → "slave",
// "chief; emperor" → "chief".
export const english = (v: VocabEntry): string => v.en.split(/[,;]/)[0].trim();

export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

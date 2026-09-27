// Hand-maintained inputs to scripts/import-paradigms.ts — the only place a human
// decision changes what the Wiktionary import produces.

import type { Case } from './nouns';

// Exceptions to the import's "first listed form wins" rule, keyed by the vocab entry's
// nominative. `sg`/`pl` replace single slots; `replace` rewrites a substring in every
// form of that noun. Mostly for Wiktionary's macron+breve marks (ō̆ = "length
// uncertain"): Suburani commits to one length, and that spelling is what goes here.
export interface FormOverride {
  sg?: Partial<Record<Case, string>>;
  pl?: Partial<Record<Case, string>>;
  replace?: Array<[from: string, to: string]>;
}

export const FORM_OVERRIDES: Record<string, FormOverride> = {
  cornū: { sg: { nom: 'cornū', acc: 'cornū' } },
  homō: { replace: [['ō̆', 'ō']] },
  sanguis: { replace: [['ī̆', 'i']] },
  prīnceps: { replace: [['ī̆', 'ī']] },
  // Suburani lists spēs, spēī; Wiktionary has speī. Dative follows, as in the 5th-
  // declension tables (diēī diēī, reī reī). Chosen by Nae 9/26.
  spēs: { sg: { gen: 'spēī', dat: 'spēī' } },
};

// Nouns the import flagged for review (irregular, or disagreeing with the Suburani
// list) that Nae has checked and approved for drills. Keyed by vocab id.
export const APPROVED_FOR_DRILLS: string[] = [
  // Irregular plural (dī, deōrum, dīs) — approved by Nae 9/25.
  'ch4-deus',
];

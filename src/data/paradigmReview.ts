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

// ── Verbs (inputs to scripts/import-conjugations.ts) ──────────────────────────

// Vocab verbs the import doesn't try, with why. Keyed by vocab id.
export const VERB_SKIPS: Record<string, string> = {
  'ch1-es': 'a form of sum, which has its own table',
  'ch1-est': 'a form of sum, which has its own table',
  'ch4-adsum': 'irregular compound of sum — not reviewed yet',
  'ch6-inquit': 'defective (only a few forms exist)',
  'ch13-coepī': 'defective (perfect forms only)',
  'ch32-valē!': 'listed as an imperative only',
};

// Spelling fixes applied to every imported form of a verb, keyed by the vocab lemma.
// Suburani's macrons win where Wiktionary differs.
export const VERB_FORM_OVERRIDES: Record<string, { replace: Array<[from: string, to: string]> }> = {
  nārrō: { replace: [['narr', 'nārr']] },
};

// Vocab verbs the import flagged for review that Nae has checked and approved for
// drills. Keyed by vocab id.
export const VERB_APPROVED_FOR_DRILLS: string[] = [];

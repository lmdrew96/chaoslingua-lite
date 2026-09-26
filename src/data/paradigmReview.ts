// Hand-maintained inputs to scripts/import-paradigms.ts — the only place a human
// decision changes what the Wiktionary import produces.

import type { Case, GNumber } from './nouns';

// Slots where Wiktionary lists a variant first that Suburani doesn't use. Keyed by
// the vocab entry's nominative. The import's rule stays "first listed form wins";
// these are explicit exceptions, not a second rule.
export const FORM_OVERRIDES: Record<string, Partial<Record<GNumber, Partial<Record<Case, string>>>>> = {
  // Wiktionary writes cornū̆ (breve = vowel length uncertain); Suburani writes cornū.
  cornū: { sg: { nom: 'cornū', acc: 'cornū' } },
};

// Nouns the import flagged for review (irregular, or disagreeing with the Suburani
// list) that Nae has checked and approved for drills. Keyed by vocab id.
export const APPROVED_FOR_DRILLS: string[] = [
  // Irregular plural (dī, deōrum, dīs) — approved by Nae 9/25.
  'ch4-deus',
];

// Wheelock Ch.5 — 1st/2nd declension -er adjectives; apposition; word order.
//
// -er adjectives (liber, libera, liberum / pulcher, pulchra, pulchrum) are irregular
// in the masculine nominative singular only — some keep the stem's "e" (liber stays
// "liber-" throughout), some drop it (pulcher becomes "pulchr-" everywhere except the
// bare nom. sg. "pulcher" itself). Rather than encode a keep/drop rule, each
// adjective's stem is derived from its given feminine form (which is always regular),
// same approach as Ch.3's ager/puer nouns.
//
// Apposition: a noun placed beside another to rename/describe it agrees with it in
// CASE (gender and number are not required to match — Ch.5 nouns already span
// different declensions and genders, so the drill deliberately pairs mismatched nouns
// to make that point concrete).
//
// Word order: Latin's default is Subject-Object-Verb, with case endings (not word
// position) carrying grammatical function — this is a conceptual point, not something
// generated from vocab data, so it's a small curated question bank rather than a
// declension table.

import { vocab } from '../vocab';
import { cases, numbers, caseNames, numberWord, firstDeclensionEndings, type Case, type GNumber } from './ch2';
import { secondDeclensionEndings } from './ch3';
import { neuterEndings, predicateNouns, type Gender, type PredicateNoun } from './ch4';

export interface ErAdjective {
  id: string;
  nomSgM: string;
  stem: string;
  gloss: string;
}

// Stem is derived from the feminine principal part (always regular -a), not guessed
// from the masculine — this is what correctly separates liber (keeps e) from pulcher
// (drops e) without hand-coding which is which. Ch.5 also has a regular -us adjective
// (sanus) which is filtered out here — it already works with the existing chapter <=4
// adjectiveForm and doesn't need this -er-specific machinery.
export const erAdjectives: ErAdjective[] = vocab
  .filter((v) => v.chapter === 5 && v.pos === 'Adjective')
  .filter((v) => !v.la.split(', ')[0].endsWith('us'))
  .map((v) => {
    const [nomSgM, nomSgF] = v.la.split(', ');
    return { id: v.id, nomSgM, stem: nomSgF.replace(/a$/, ''), gloss: v.en };
  });

export const erAdjectiveForm = (adj: ErAdjective, gender: Gender, c: Case, n: GNumber): string => {
  if (gender === 'm' && c === 'nom' && n === 'sg') return adj.nomSgM;
  const endings = gender === 'f' ? firstDeclensionEndings : gender === 'n' ? neuterEndings : secondDeclensionEndings;
  return adj.stem + endings[n][c];
};

export interface WordOrderQuestion {
  id: string;
  prompt: string;
  correct: string;
  wrong: string[];
}

// Verified against general Latin grammar reference (not tied to any one textbook's
// chapter numbering): SOV default order; case endings, not position, carry meaning;
// descriptive adjectives usually follow their noun, but size/quantity/evaluation
// adjectives usually precede it.
export const wordOrderQuestions: WordOrderQuestion[] = [
  {
    id: 'wo-sov',
    prompt: 'What is the normal/default word order in a Latin sentence?',
    correct: 'Subject – Object – Verb (SOV)',
    wrong: ['Subject – Verb – Object (SVO)', 'Verb – Subject – Object (VSO)', 'Object – Verb – Subject (OVS)'],
  },
  {
    id: 'wo-descriptive-adj',
    prompt: 'Where does a typical descriptive adjective (e.g. a color or material) usually go relative to its noun?',
    correct: 'after the noun',
    wrong: ['before the noun', 'at the very start of the sentence', 'immediately after the verb'],
  },
  {
    id: 'wo-limiting-adj',
    prompt: 'Where do adjectives of size, quantity, or evaluation (e.g. "large", "many", "good") usually go?',
    correct: 'before the noun',
    wrong: ['after the noun', 'at the end of the sentence', 'immediately before the verb'],
  },
  {
    id: 'wo-why-flexible',
    prompt: 'Why can Latin word order vary so much while the sentence stays grammatically clear?',
    correct: "case endings show each word's grammatical role, not its position",
    wrong: ['Latin has no fixed grammar rules', 'word order never actually varies in real Latin texts', "only the verb's position ever matters"],
  },
];

export { cases, numbers, caseNames, numberWord, predicateNouns };
export type { Case, GNumber, Gender, PredicateNoun };

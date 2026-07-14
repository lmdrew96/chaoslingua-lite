// Wheelock Ch.3 — 2nd declension masculine nouns; 1st/2nd declension adjective agreement.
//
// 2nd declension endings verified against Wheelock + Wiktionary (amicus paradigm):
// sg nom -us, gen -ī, dat -ō, acc -um, abl -ō
// pl nom -ī, gen -ōrum, dat -īs, acc -ōs, abl -īs
//
// -er/-ir nouns (ager, puer, vir) are irregular in the nominative singular only —
// some keep the stem's "e" (puer -> puerī), some drop it (ager -> agrī). Rather than
// encode a rule (the Ch.5 patch explicitly warns against assuming one for a similar
// case with -er adjectives), each noun's actual nominative + genitive come straight
// from the vocab data, already verified against Wheelock, so the irregularity is
// captured by construction instead of guessed at.
//
// Adjectives (magnus/-a/-um type): masculine agreement uses 2nd declension endings,
// feminine agreement reuses Ch.2's 1st declension endings. Neuter is out of scope —
// no neuter nouns exist until Ch.4.

import { vocab } from '../vocab';
import {
  cases,
  numbers,
  caseNames,
  caseFunctions,
  numberWord,
  firstDeclensionEndings,
  nouns as ch2Nouns,
  declinedForm as ch2DeclinedForm,
  type Case,
  type GNumber,
} from './ch2';

export type Gender = 'm' | 'f';

const secondDeclensionEndings: Record<GNumber, Record<Case, string>> = {
  sg: { nom: 'us', gen: 'ī', dat: 'ō', acc: 'um', abl: 'ō' },
  pl: { nom: 'ī', gen: 'ōrum', dat: 'īs', acc: 'ōs', abl: 'īs' },
};

export interface SecondDeclensionNoun {
  id: string;
  nomSg: string;
  stem: string;
  gloss: string;
}

// 2nd declension masculine nouns, filtered from Ch.3 vocab by genitive ending in "-i"
// rather than "-ae" — some Ch.3 vocab (agricola, amica, femina, filia, sapientia) is
// 1st declension despite appearing in this chapter's word list.
export const nouns: SecondDeclensionNoun[] = vocab
  .filter((v) => v.chapter === 3 && v.pos === 'Noun')
  .filter((v) => {
    const genitive = v.la.split(', ')[1];
    return genitive.endsWith('i') && !genitive.endsWith('ae');
  })
  .map((v) => {
    const [nominative, genitive] = v.la.split(', ');
    return {
      id: v.id,
      nomSg: nominative,
      stem: genitive.replace(/i$/, ''),
      gloss: v.en,
    };
  });

export const declinedForm = (noun: SecondDeclensionNoun, c: Case, n: GNumber): string => {
  if (c === 'nom' && n === 'sg') return noun.nomSg;
  return noun.stem + secondDeclensionEndings[n][c];
};

// "-ī" is shared by gen sg / nom pl, and "-ō"/"-īs" by sg-abl/dat and pl-abl/dat
// respectively — same kind of ambiguity as Ch.2's 1st declension, just a different
// cluster. Only these 4 slots map a form to exactly one case+number.
export const unambiguousSlots: Array<{ c: Case; n: GNumber }> = [
  { c: 'nom', n: 'sg' },
  { c: 'acc', n: 'sg' },
  { c: 'gen', n: 'pl' },
  { c: 'acc', n: 'pl' },
];

export interface Adjective {
  id: string;
  stem: string;
  gloss: string;
}

// 1st/2nd declension adjectives (and determiners, which decline identically) covered
// so far — all regular -us/-a/-um type; -er adjectives are Ch.5.
export const adjectives: Adjective[] = vocab
  .filter((v) => v.chapter <= 3 && (v.pos === 'Adjective' || v.pos === 'Determiner'))
  .map((v) => ({
    id: v.id,
    stem: v.la.split(', ')[0].replace(/us$/, ''),
    gloss: v.en,
  }));

export const adjectiveForm = (adj: Adjective, gender: Gender, c: Case, n: GNumber): string => {
  const endings = gender === 'f' ? firstDeclensionEndings : secondDeclensionEndings;
  return adj.stem + endings[n][c];
};

export interface AgreementNoun {
  id: string;
  gloss: string;
  gender: Gender;
  declinedForm: (c: Case, n: GNumber) => string;
}

// Every noun introduced so far, regardless of its OWN declension, tagged with the
// grammatical gender that determines which adjective endings agree with it. This is
// what makes nauta/poeta (Ch.2, masculine but 1st-declension in form) interesting:
// an adjective modifying "nauta" still takes 2nd-declension (masculine) endings.
export const agreementNouns: AgreementNoun[] = [
  ...ch2Nouns.map((noun) => ({
    id: noun.id,
    gloss: noun.gloss,
    gender: noun.gender,
    declinedForm: (c: Case, n: GNumber) => ch2DeclinedForm(noun, c, n),
  })),
  ...nouns.map((noun) => ({
    id: noun.id,
    gloss: noun.gloss,
    gender: 'm' as Gender,
    declinedForm: (c: Case, n: GNumber) => declinedForm(noun, c, n),
  })),
];

export { cases, numbers, caseNames, caseFunctions, numberWord };
export type { Case, GNumber };

// Wheelock Ch.2 — 1st declension nouns, case endings + basic case functions.
// Endings verified against the standard Wheelock paradigm (porta/puella/rosa):
// sg nom -a, gen -ae, dat -ae, acc -am, abl -ā
// pl nom -ae, gen -ārum, dat -īs, acc -ās, abl -īs

import { vocab } from '../vocab';

export type Case = 'nom' | 'gen' | 'dat' | 'acc' | 'abl';
export type GNumber = 'sg' | 'pl';

export const cases: Case[] = ['nom', 'gen', 'dat', 'acc', 'abl'];
export const numbers: GNumber[] = ['sg', 'pl'];

export const caseNames: Record<Case, string> = {
  nom: 'nominative',
  gen: 'genitive',
  dat: 'dative',
  acc: 'accusative',
  abl: 'ablative',
};

// What each case does grammatically — Wheelock frames these as: nominative = subject,
// genitive = possession ('s/of), dative = indirectly affected (to/for), accusative =
// direct object, ablative = with/by (means/agent).
export const caseFunctions: Record<Case, string> = {
  nom: 'subject',
  gen: 'possession',
  dat: 'indirect object',
  acc: 'direct object',
  abl: 'means/agent',
};

const endings: Record<GNumber, Record<Case, string>> = {
  sg: { nom: 'a', gen: 'ae', dat: 'ae', acc: 'am', abl: 'ā' },
  pl: { nom: 'ae', gen: 'ārum', dat: 'īs', acc: 'ās', abl: 'īs' },
};

export interface FirstDeclensionNoun {
  id: string;
  stem: string;
  gloss: string;
  gender: 'm' | 'f';
}

// Pulled from the already-verified Ch.2 vocab slice (src/data/vocab.ts) rather than
// re-typed — stem is the genitive singular minus its -ae ending.
export const nouns: FirstDeclensionNoun[] = vocab
  .filter((v) => v.chapter === 2 && v.pos === 'Noun')
  .map((v) => {
    const genitive = v.la.split(', ')[1];
    return {
      id: v.id,
      stem: genitive.replace(/ae$/, ''),
      gloss: v.en,
      gender: (v.gender === 'm' ? 'm' : 'f') as 'm' | 'f',
    };
  });

export const declinedForm = (noun: FirstDeclensionNoun, c: Case, n: GNumber): string =>
  noun.stem + endings[n][c];

export const numberWord = (n: GNumber): string => (n === 'sg' ? 'singular' : 'plural');

// "-ae" is shared by gen sg / dat sg / nom pl, and "-īs" by dat pl / abl pl — genuinely
// ambiguous without sentence context. Case-identification drills are restricted to the
// slots below, where the form (with its macron) maps to exactly one case+number.
export const unambiguousSlots: Array<{ c: Case; n: GNumber }> = [
  { c: 'nom', n: 'sg' },
  { c: 'acc', n: 'sg' },
  { c: 'abl', n: 'sg' },
  { c: 'gen', n: 'pl' },
  { c: 'acc', n: 'pl' },
];

// Wheelock Ch.1 — present active indicative + imperative, amāre & monēre.
// Ported from the chaoslingua-lite.html prototype's `conjugations` object.

export type VerbKey = 'amare' | 'monere';
export type Person = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';

export interface Conjugation {
  stem: string;
  stem1: string;
  vowel: string;
  gloss: string;
  forms: Record<Person, string>;
  imperativeSg: string;
  imperativePl: string;
}

export const conjugations: Record<VerbKey, Conjugation> = {
  amare: {
    stem: 'amā', stem1: 'am', vowel: 'ā', gloss: 'love',
    forms: {
      '1sg': 'amō', '2sg': 'amās', '3sg': 'amat',
      '1pl': 'amāmus', '2pl': 'amātis', '3pl': 'amant',
    },
    imperativeSg: 'amā', imperativePl: 'amāte',
  },
  monere: {
    stem: 'monē', stem1: 'mon', vowel: 'ē', gloss: 'warn, advise',
    forms: {
      '1sg': 'moneō', '2sg': 'monēs', '3sg': 'monet',
      '1pl': 'monēmus', '2pl': 'monētis', '3pl': 'monent',
    },
    imperativeSg: 'monē', imperativePl: 'monēte',
  },
};

export const personLabels: Record<Person, string> = {
  '1sg': 'I', '2sg': 'you (sg.)', '3sg': 'he/she/it',
  '1pl': 'we', '2pl': 'you (pl.)', '3pl': 'they',
};

const englishBase: Record<Person, string> = {
  '1sg': 'I', '2sg': 'you', '3sg': 'he/she/it',
  '1pl': 'we', '2pl': 'you (all)', '3pl': 'they',
};

export const englishFor = (verbKey: VerbKey, person: Person): string => {
  const gloss = conjugations[verbKey].gloss.split(',')[0].trim();
  const verbForm = person === '3sg' ? gloss + 's' : gloss;
  return `${englishBase[person]} ${verbForm}`;
};

export const conjLabel = (verbKey: VerbKey): string => (verbKey === 'amare' ? '1st' : '2nd');

export const persons: Person[] = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
export const verbKeys: VerbKey[] = ['amare', 'monere'];

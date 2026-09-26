// Suburani model nouns — one paradigm table per declension pattern, copied from the
// Suburani Reference Grammar (Book 2 "Nouns" tables; Book 1 has the 1st–3rd subset).
// Every form below was checked against the textbook HTML, not generated from endings:
// stems shift (nox → noct-, caput → capit-), 3rd-decl genitive plurals split -um/-ium,
// and neuters have their own nom/acc, so a rule would get several of these wrong.

export type Case = 'nom' | 'gen' | 'dat' | 'acc' | 'abl';
export type GNumber = 'sg' | 'pl';
export type Gender = 'm' | 'f' | 'n';
export type Declension = 1 | 2 | 3 | 4 | 5;

// Suburani's (and LATN 101's) case order.
export const CASES: Case[] = ['nom', 'gen', 'dat', 'acc', 'abl'];
export const NUMBERS: GNumber[] = ['sg', 'pl'];
export const DECLENSIONS: Declension[] = [1, 2, 3, 4, 5];

export const caseNames: Record<Case, string> = {
  nom: 'nominative',
  gen: 'genitive',
  dat: 'dative',
  acc: 'accusative',
  abl: 'ablative',
};

export const numberNames: Record<GNumber, string> = { sg: 'singular', pl: 'plural' };

export const genderNames: Record<Gender, string> = { m: 'masculine', f: 'feminine', n: 'neuter' };

export const ordinal = (d: Declension): string => ['1st', '2nd', '3rd', '4th', '5th'][d - 1];

export interface ModelNoun {
  id: string;
  declension: Declension;
  gender: Gender;
  gloss: string;
  // English plural for drill feedback ("of the nights") — English, not Latin, so it's
  // hand-written rather than sourced.
  glossPl: string;
  forms: Record<GNumber, Record<Case, string>>;
  note?: string;
}

const paradigm = (sg: string, pl: string): Record<GNumber, Record<Case, string>> => {
  const row = (s: string): Record<Case, string> => {
    const [nom, gen, dat, acc, abl] = s.split(' ');
    return { nom, gen, dat, acc, abl };
  };
  return { sg: row(sg), pl: row(pl) };
};

export const MODEL_NOUNS: ModelNoun[] = [
  {
    id: 'puella', declension: 1, gender: 'f', gloss: 'girl', glossPl: 'girls',
    forms: paradigm('puella puellae puellae puellam puellā', 'puellae puellārum puellīs puellās puellīs'),
  },
  {
    id: 'amicus', declension: 2, gender: 'm', gloss: 'friend', glossPl: 'friends',
    forms: paradigm('amīcus amīcī amīcō amīcum amīcō', 'amīcī amīcōrum amīcīs amīcōs amīcīs'),
  },
  {
    id: 'puer', declension: 2, gender: 'm', gloss: 'boy', glossPl: 'boys',
    forms: paradigm('puer puerī puerō puerum puerō', 'puerī puerōrum puerīs puerōs puerīs'),
  },
  {
    id: 'donum', declension: 2, gender: 'n', gloss: 'gift', glossPl: 'gifts',
    forms: paradigm('dōnum dōnī dōnō dōnum dōnō', 'dōna dōnōrum dōnīs dōna dōnīs'),
  },
  {
    id: 'fur', declension: 3, gender: 'm', gloss: 'thief', glossPl: 'thieves',
    forms: paradigm('fūr fūris fūrī fūrem fūre', 'fūrēs fūrum fūribus fūrēs fūribus'),
  },
  {
    id: 'nox', declension: 3, gender: 'f', gloss: 'night', glossPl: 'nights',
    forms: paradigm('nox noctis noctī noctem nocte', 'noctēs noctium noctibus noctēs noctibus'),
  },
  {
    id: 'urbs', declension: 3, gender: 'f', gloss: 'city', glossPl: 'cities',
    forms: paradigm('urbs urbis urbī urbem urbe', 'urbēs urbium urbibus urbēs urbibus'),
  },
  {
    id: 'caput', declension: 3, gender: 'n', gloss: 'head', glossPl: 'heads',
    forms: paradigm('caput capitis capitī caput capite', 'capita capitum capitibus capita capitibus'),
    note: 'The ablative singular of mare ("sea") is marī.',
  },
  {
    id: 'manus', declension: 4, gender: 'm', gloss: 'hand', glossPl: 'hands',
    forms: paradigm('manus manūs manuī manum manū', 'manūs manuum manibus manūs manibus'),
  },
  {
    id: 'cornu', declension: 4, gender: 'n', gloss: 'horn', glossPl: 'horns',
    forms: paradigm('cornū cornūs cornū cornū cornū', 'cornua cornuum cornibus cornua cornibus'),
  },
  {
    id: 'res', declension: 5, gender: 'f', gloss: 'thing', glossPl: 'things',
    forms: paradigm('rēs reī reī rem rē', 'rēs rērum rēbus rēs rēbus'),
  },
  {
    id: 'dies', declension: 5, gender: 'm', gloss: 'day', glossPl: 'days',
    forms: paradigm('diēs diēī diēī diem diē', 'diēs diērum diēbus diēs diēbus'),
  },
];

// Displayed gloss for the Learn tables — Suburani glosses manus as "hand; group".
export const tableGloss: Record<string, string> = { manus: 'hand; group' };

export const modelNounsFor = (d: Declension): ModelNoun[] => MODEL_NOUNS.filter((n) => n.declension === d);

export interface Parse {
  case: Case;
  number: GNumber;
}

// Every case+number slot a form could be. Syncretism is the norm, not the edge case
// (puellae = gen sg / dat sg / nom pl; cornū = four singular cases), so drills grade
// against this whole set instead of the one slot they happened to sample.
export const parsesOf = (noun: ModelNoun, form: string): Parse[] =>
  NUMBERS.flatMap((number) => CASES.filter((c) => noun.forms[number][c] === form).map((c) => ({ case: c, number })));

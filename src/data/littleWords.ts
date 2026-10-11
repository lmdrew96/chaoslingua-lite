// Module 4's "little words": prepositions, conjunctions, adverbs.
//
// Prepositions take their case from the vocab lists' "+ acc." / "+ abl." markers.
// Four early ones are listed without a marker (in, cum, per, ad); their cases come
// from the Reference Grammar Book 1 uses-of-the-cases table, which lists "ad
// (towards), per (through), trāns (across), in (into)" with the accusative and "in
// (in, on), cum (with), ā/ab, ē/ex" with the ablative.
//
// Adverbs: only pairs Suburani itself gives — the Book 2 "Adverbs" table (laetē,
// cautē, celeriter, facile), its irregular-adverbs table (bene, magnopere, multum),
// and adverbs in the vocab lists whose adjective is also listed (lentus → lentē).

import { vocab, type VocabEntry } from './vocab';

export type PrepCase = 'acc' | 'abl';

export interface PrepSense {
  case: PrepCase | 'either';
  en: string;
  chapter: number;
}

export interface Preposition {
  la: string;
  senses: PrepSense[];
}

// Book 1 uses-of-the-cases table, for the vocab entries listed without a marker.
const UNMARKED: Record<string, PrepCase> = {
  'ch1-in': 'abl',
  'ch3-cum': 'abl',
  'ch3-per': 'acc',
  'ch4-ad': 'acc',
};

// "ā, ab + abl." → ā, ab / abl; "sub + acc. or abl." → sub / either.
const parsePrep = (v: VocabEntry): { la: string; case: PrepSense['case'] } | null => {
  const m = v.la.match(/^(.*?)\s*\+\s*(acc\.|abl\.)(?: or (acc\.|abl\.))?$/);
  if (m) return { la: m[1], case: m[3] ? 'either' : m[2] === 'acc.' ? 'acc' : 'abl' };
  return UNMARKED[v.id] ? { la: v.la, case: UNMARKED[v.id] } : null;
};

// Prepositions with a sense in an open chapter. A preposition relisted with the same
// case keeps its earliest open sense (prō in ch.11 and 17); in keeps both cases.
export const openPrepositions = (chapters: Set<number>): Preposition[] => {
  const byLa = new Map<string, PrepSense[]>();
  for (const v of vocab) {
    if (v.pos !== 'Preposition' || !chapters.has(v.chapter)) continue;
    const p = parsePrep(v);
    if (!p) continue;
    const senses = byLa.get(p.la) ?? [];
    if (!senses.some((s) => s.case === p.case)) senses.push({ case: p.case, en: v.en, chapter: v.chapter });
    byLa.set(p.la, senses);
  }
  return [...byLa].map(([la, senses]) => ({ la, senses }));
};

export interface AdverbPair {
  adj: string;
  adjEn: string;
  adv: string;
  advEn: string;
  // Which pattern it follows — or doesn't.
  pattern: '1st/2nd → -ē' | '3rd → -iter' | 'exception';
  // A plausible wrong answer: the other pattern, or the regular form an irregular
  // adverb would have had. Shown only as a wrong choice.
  wrong: string;
  // Vocab chapter where the pair becomes available; null = textbook table, always.
  chapter: number | null;
}

export const ADVERB_PAIRS: AdverbPair[] = [
  // Book 2 "Adverbs" table.
  { adj: 'laetus', adjEn: 'happy', adv: 'laetē', advEn: 'happily', pattern: '1st/2nd → -ē', wrong: 'laetiter', chapter: null },
  { adj: 'cautus', adjEn: 'cautious', adv: 'cautē', advEn: 'cautiously', pattern: '1st/2nd → -ē', wrong: 'cautiter', chapter: null },
  { adj: 'celer', adjEn: 'quick', adv: 'celeriter', advEn: 'quickly', pattern: '3rd → -iter', wrong: 'celerē', chapter: null },
  { adj: 'facilis', adjEn: 'easy', adv: 'facile', advEn: 'easily', pattern: 'exception', wrong: 'faciliter', chapter: null },
  // Book 2 "Irregular forms of adverbs" table.
  { adj: 'bonus', adjEn: 'good', adv: 'bene', advEn: 'well', pattern: 'exception', wrong: 'bonē', chapter: null },
  { adj: 'magnus', adjEn: 'great', adv: 'magnopere', advEn: 'greatly', pattern: 'exception', wrong: 'magnē', chapter: null },
  { adj: 'multus', adjEn: 'much', adv: 'multum', advEn: 'much', pattern: 'exception', wrong: 'multē', chapter: null },
  // Both words in the vocab lists; available once the later of the two chapters opens.
  { adj: 'lentus', adjEn: 'slow', adv: 'lentē', advEn: 'slowly', pattern: '1st/2nd → -ē', wrong: 'lentiter', chapter: 19 },
  { adj: 'longus', adjEn: 'long', adv: 'longē', advEn: 'far off', pattern: '1st/2nd → -ē', wrong: 'longiter', chapter: 21 },
  { adj: 'gravis', adjEn: 'heavy', adv: 'graviter', advEn: 'heavily', pattern: '3rd → -iter', wrong: 'gravē', chapter: 20 },
];

export const openAdverbPairs = (chapters: Set<number>): AdverbPair[] =>
  ADVERB_PAIRS.filter((p) => p.chapter === null || chapters.has(p.chapter));

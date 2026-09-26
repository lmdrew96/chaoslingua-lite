// 3rd-person singular present forms for the decode drill, from the Suburani vocab
// lists (src/data/vocab.ts). Verified the same way as the noun forms:
//   - vocat, videt, laudat appear verbatim in the Suburani Reference Grammar.
//   - The others follow its present-tense table exactly: 1st conj. vocō → vocat
//     (salūtō, spectō, exspectō, rogō), 2nd conj. teneō → tenet (timeō), 4th conj.
//     audiō → audit.
// English is the listed gloss in the 3rd person ("I look at, watch" → "watches").

export interface DecodeVerb {
  chapter: number;
  la: string;
  en: string;
}

export const DECODE_VERBS: DecodeVerb[] = [
  { chapter: 2, la: 'salūtat', en: 'greets' },
  { chapter: 2, la: 'spectat', en: 'watches' },
  { chapter: 2, la: 'videt', en: 'sees' },
  { chapter: 2, la: 'vocat', en: 'calls' },
  { chapter: 4, la: 'laudat', en: 'praises' },
  { chapter: 5, la: 'audit', en: 'hears' },
  { chapter: 5, la: 'timet', en: 'fears' },
  { chapter: 6, la: 'exspectat', en: 'waits for' },
  { chapter: 6, la: 'rogat', en: 'asks' },
];

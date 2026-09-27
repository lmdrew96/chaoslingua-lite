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

// Verbs for the decode drill's dative and ablative tiers, verified the same way:
//   - dat and ambulat appear verbatim in the Reference Grammar's uses-of-the-cases
//     examples (puella amīcō dōnum dat; puella cum amīcō in forō ambulat).
//   - offert follows the irregular ferō → fert in its table.
//   - The rest follow the present-tense table: mittō → mittit (trādit, ostendit,
//     currit, discēdit), audiō → audit (venit), capiō → capit (fugit), teneō → tenet
//     (sedet), vocō → vocat (labōrat).

// "The X gives Y to Z" — a giver (nom), a thing (acc), and a recipient (dat).
export const DATIVE_VERBS: DecodeVerb[] = [
  { chapter: 5, la: 'dat', en: 'gives' },
  { chapter: 9, la: 'trādit', en: 'hands over' },
  { chapter: 12, la: 'offert', en: 'offers' },
  { chapter: 14, la: 'ostendit', en: 'shows' },
];

// Intransitive verbs for a preposition + ablative phrase. `en` reads before the
// preposition's English ("walks" + "with the girl", "runs" + "away from the king").
export interface PrepVerb extends DecodeVerb {
  prep: 'cum' | 'ab';
}

export const PREP_VERBS: PrepVerb[] = [
  { chapter: 1, la: 'labōrat', en: 'works', prep: 'cum' },
  { chapter: 3, la: 'ambulat', en: 'walks', prep: 'cum' },
  { chapter: 3, la: 'currit', en: 'runs', prep: 'cum' },
  { chapter: 4, la: 'venit', en: 'comes', prep: 'cum' },
  { chapter: 6, la: 'sedet', en: 'sits', prep: 'cum' },
  { chapter: 6, la: 'discēdit', en: 'goes', prep: 'ab' },
  { chapter: 11, la: 'fugit', en: 'runs', prep: 'ab' },
];

// Motion verbs for the decode drill's route tier (ē/ex + abl → in + acc). `en` reads
// before the route ("runs" + "out of the city into the forest"). festīnat follows
// vocō → vocat; the rest are verified above.
export const ROUTE_VERBS: DecodeVerb[] = [
  { chapter: 3, la: 'ambulat', en: 'walks' },
  { chapter: 3, la: 'currit', en: 'runs' },
  { chapter: 3, la: 'festīnat', en: 'hurries' },
  { chapter: 11, la: 'fugit', en: 'flees' },
];

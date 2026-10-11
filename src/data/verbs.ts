// Suburani model verbs — one paradigm per conjugation, plus the irregulars, copied
// from the Suburani Reference Grammar Book 2 ("Verbs: Active indicative", "Irregular
// verbs: indicative", the ferō table, and "Other parts of the verb"). Book 2 rather
// than Book 1, which only gives the future for the 1st and 2nd conjugations.
// Active indicative only: LATN 101 doesn't cover the passive or subjunctive, and
// those Book 2 tables have typos (mittm, teneānt, audīāmus, ferotur).
// Like the noun tables, every form is copied, not generated from endings.

import { IMPORTED_CONJUGATIONS } from './conjugations.generated';
import type { GNumber } from './nouns';
import { vocab } from './vocab';

export type Person = 1 | 2 | 3;
export type Tense = 'pres' | 'impf' | 'fut' | 'perf' | 'plup' | 'futperf';
// '3io' is Suburani's "3rd/4th conjugation" (capiō); 'irr' is the irregulars.
export type Conjugation = 1 | 2 | 3 | '3io' | 4 | 'irr';

export const PERSONS: Person[] = [1, 2, 3];
// Suburani's table order.
export const TENSES: Tense[] = ['pres', 'fut', 'impf', 'perf', 'futperf', 'plup'];
export const CONJUGATIONS: Conjugation[] = [1, 2, 3, 4, '3io', 'irr'];

export const tenseNames: Record<Tense, string> = {
  pres: 'present',
  impf: 'imperfect',
  fut: 'future',
  perf: 'perfect',
  plup: 'pluperfect',
  futperf: 'future perfect',
};

export const personNames: Record<Person, string> = { 1: '1st person', 2: '2nd person', 3: '3rd person' };

// Suburani's row labels.
export const personLabels: Record<GNumber, Record<Person, string>> = {
  sg: { 1: 'I', 2: 'you (sing.)', 3: 'he, she, it' },
  pl: { 1: 'we', 2: 'you (pl.)', 3: 'they' },
};

// Suburani's English frame for each tense heading.
export const tenseFrames: Record<Tense, string> = {
  pres: 'I call, am calling',
  fut: 'I shall call',
  impf: 'I was calling, used to call',
  perf: 'I called, have called',
  futperf: 'I shall have called',
  plup: 'I had called',
};

export const conjugationLabel = (c: Conjugation): string =>
  c === '3io' ? '3rd/4th' : c === 'irr' ? 'irregular' : ['1st', '2nd', '3rd', '4th'][c - 1];

export type TenseTable = Record<GNumber, Record<Person, string>>;

export interface ModelVerb {
  id: string;
  conjugation: Conjugation;
  // English base form from the table header ("call"), for drill feedback.
  gloss: string;
  infinitive: string;
  // Null where Suburani gives none (possum, volō, mālō).
  imperative: { sg: string; pl: string } | null;
  // Present system now; the perfect system fills in with Module 5.
  forms: Partial<Record<Tense, TenseTable>>;
}

// Six forms in table order: I, you (sing.), he/she/it, we, you (pl.), they. A string
// splits on spaces; nōlō's "nōn vīs" needs the array form.
const table = (forms: string | string[]): TenseTable => {
  const [s1, s2, s3, p1, p2, p3] = typeof forms === 'string' ? forms.split(' ') : forms;
  return { sg: { 1: s1, 2: s2, 3: s3 }, pl: { 1: p1, 2: p2, 3: p3 } };
};

export const MODEL_VERBS: ModelVerb[] = [
  {
    id: 'voco', conjugation: 1, gloss: 'call', infinitive: 'vocāre', imperative: { sg: 'vocā', pl: 'vocāte' },
    forms: {
      pres: table('vocō vocās vocat vocāmus vocātis vocant'),
      fut: table('vocābō vocābis vocābit vocābimus vocābitis vocābunt'),
      impf: table('vocābam vocābās vocābat vocābāmus vocābātis vocābant'),
    },
  },
  {
    id: 'teneo', conjugation: 2, gloss: 'hold', infinitive: 'tenēre', imperative: { sg: 'tenē', pl: 'tenēte' },
    forms: {
      pres: table('teneō tenēs tenet tenēmus tenētis tenent'),
      fut: table('tenēbō tenēbis tenēbit tenēbimus tenēbitis tenēbunt'),
      impf: table('tenēbam tenēbās tenēbat tenēbāmus tenēbātis tenēbant'),
    },
  },
  {
    id: 'mitto', conjugation: 3, gloss: 'send', infinitive: 'mittere', imperative: { sg: 'mitte', pl: 'mittite' },
    forms: {
      pres: table('mittō mittis mittit mittimus mittitis mittunt'),
      fut: table('mittam mittēs mittet mittēmus mittētis mittent'),
      impf: table('mittēbam mittēbās mittēbat mittēbāmus mittēbātis mittēbant'),
    },
  },
  {
    id: 'audio', conjugation: 4, gloss: 'hear', infinitive: 'audīre', imperative: { sg: 'audī', pl: 'audīte' },
    forms: {
      pres: table('audiō audīs audit audīmus audītis audiunt'),
      fut: table('audiam audiēs audiet audiēmus audiētis audient'),
      impf: table('audiēbam audiēbās audiēbat audiēbāmus audiēbātis audiēbant'),
    },
  },
  {
    id: 'capio', conjugation: '3io', gloss: 'take', infinitive: 'capere', imperative: { sg: 'cape', pl: 'capite' },
    forms: {
      pres: table('capiō capis capit capimus capitis capiunt'),
      fut: table('capiam capiēs capiet capiēmus capiētis capient'),
      impf: table('capiēbam capiēbās capiēbat capiēbāmus capiēbātis capiēbant'),
    },
  },
];

export const IRREGULAR_VERBS: ModelVerb[] = [
  {
    id: 'sum', conjugation: 'irr', gloss: 'be', infinitive: 'esse', imperative: { sg: 'es', pl: 'este' },
    forms: {
      pres: table('sum es est sumus estis sunt'),
      fut: table('erō eris erit erimus eritis erunt'),
      impf: table('eram erās erat erāmus erātis erant'),
    },
  },
  {
    id: 'possum', conjugation: 'irr', gloss: 'be able', infinitive: 'posse', imperative: null,
    forms: {
      pres: table('possum potes potest possumus potestis possunt'),
      fut: table('poterō poteris poterit poterimus poteritis poterunt'),
      impf: table('poteram poterās poterat poterāmus poterātis poterant'),
    },
  },
  {
    id: 'eo', conjugation: 'irr', gloss: 'go', infinitive: 'īre', imperative: { sg: 'ī', pl: 'īte' },
    forms: {
      pres: table('eō īs it īmus ītis eunt'),
      fut: table('ībō ībis ībit ībimus ībitis ībunt'),
      impf: table('ībam ībās ībat ībāmus ībātis ībant'),
    },
  },
  {
    id: 'volo', conjugation: 'irr', gloss: 'want', infinitive: 'velle', imperative: null,
    forms: {
      pres: table('volō vīs vult volumus vultis volunt'),
      fut: table('volam volēs volet volēmus volētis volent'),
      impf: table('volēbam volēbās volēbat volēbāmus volēbātis volēbant'),
    },
  },
  {
    id: 'nolo', conjugation: 'irr', gloss: 'be unwilling', infinitive: 'nōlle', imperative: { sg: 'nōlī', pl: 'nōlīte' },
    forms: {
      pres: table(['nōlō', 'nōn vīs', 'nōn vult', 'nōlumus', 'nōn vultis', 'nōlunt']),
      fut: table('nōlam nōlēs nōlet nōlēmus nōlētis nōlent'),
      impf: table('nōlēbam nōlēbās nōlēbat nōlēbāmus nōlēbātis nōlēbant'),
    },
  },
  {
    id: 'malo', conjugation: 'irr', gloss: 'prefer', infinitive: 'mālle', imperative: null,
    forms: {
      pres: table('mālō māvīs māvult mālumus māvultis mālunt'),
      fut: table('mālam mālēs mālet mālēmus mālētis mālent'),
      impf: table('mālēbam mālēbās mālēbat mālēbāmus mālēbātis mālēbant'),
    },
  },
  // The textbook's ferō imperfect stops at "ferēbam, ferēbās, etc."; the rest continue
  // that pattern (as mittēbam does) and are confirmed by the import's round-trip.
  {
    id: 'fero', conjugation: 'irr', gloss: 'carry', infinitive: 'ferre', imperative: { sg: 'fer', pl: 'ferte' },
    forms: {
      pres: table('ferō fers fert ferimus fertis ferunt'),
      fut: table('feram ferēs feret ferēmus ferētis ferent'),
      impf: table('ferēbam ferēbās ferēbat ferēbāmus ferēbātis ferēbant'),
    },
  },
];

export const lemmaOf = (v: Pick<ModelVerb, 'forms'>): string => v.forms.pres!.sg[1];

// What a verb drill needs — textbook verbs and imported vocab verbs both fit.
export interface DrillVerb {
  id: string;
  conjugation: Conjugation;
  gloss: string;
  infinitive: string;
  forms: Partial<Record<Tense, TenseTable>>;
  chapter?: number;
}

// "I look at, watch" → "look at"; "take, catch, capture" → "take".
const verbGloss = (en: string): string => en.replace(/^I /, '').split(/[,;]/)[0].trim();

// The textbook verbs for every open conjugation (always — they're the tables class
// learns from), plus vocab verbs of open chapters whose Wiktionary import passed
// review. A vocab verb that's also a textbook verb (vocō, sum) uses the textbook table.
export const drillableVerbs = (chapters: Set<number>, conjugations: Set<Conjugation>): DrillVerb[] => {
  const pool: DrillVerb[] = [...MODEL_VERBS, ...IRREGULAR_VERBS].filter((v) => conjugations.has(v.conjugation));
  const seen = new Set([...MODEL_VERBS, ...IRREGULAR_VERBS].map(lemmaOf));
  for (const v of vocab) {
    const imported = IMPORTED_CONJUGATIONS[v.id];
    if (v.pos !== 'Verb' || !chapters.has(v.chapter) || !imported || imported.review) continue;
    if (!conjugations.has(imported.conjugation)) continue;
    // Skip repeats: legō is listed in ch.1 and again in ch.16.
    const lemma = imported.forms.pres!.sg[1];
    if (seen.has(lemma)) continue;
    seen.add(lemma);
    pool.push({
      id: v.id,
      conjugation: imported.conjugation,
      gloss: verbGloss(v.en),
      infinitive: imported.infinitive,
      forms: imported.forms,
      chapter: v.chapter,
    });
  }
  return pool;
};

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

// One cell of a verb's table.
export interface VerbSlot {
  tense: Tense;
  number: GNumber;
  person: Person;
}

export const sameSlot = (a: VerbSlot, b: VerbSlot): boolean =>
  a.tense === b.tense && a.number === b.number && a.person === b.person;

// Every slot a form could be, so drills grade against all of them (as parsesOf does
// for nouns). Active-indicative forms rarely collide, but nothing assumes they don't.
export const verbParsesOf = (verb: Pick<DrillVerb, 'forms'>, form: string): VerbSlot[] =>
  TENSES.flatMap((tense) =>
    (['sg', 'pl'] as GNumber[]).flatMap((number) =>
      PERSONS.filter((person) => verb.forms[tense]?.[number][person] === form).map((person) => ({ tense, number, person })),
    ),
  );

const ENDINGS: Record<GNumber, Record<Person, RegExp>> = {
  sg: { 1: /(ō|m)$/, 2: /s$/, 3: /t$/ },
  pl: { 1: /mus$/, 2: /tis$/, 3: /nt$/ },
};

// Splits a sourced form into stem · tense sign · personal ending, by checking it
// against the known endings and tense signs. Null when it doesn't split cleanly —
// irregulars, and anything unexpected — so feedback just shows the parse. Present
// forms have no tense sign; their stem keeps the joining vowel (vocā·mus, mittu·nt).
export const segmentsOf = (
  verb: Pick<DrillVerb, 'conjugation'>,
  slot: VerbSlot,
  form: string,
): { stem: string; sign?: string; ending: string } | null => {
  if (verb.conjugation === 'irr') return null;
  const ending = form.match(ENDINGS[slot.number][slot.person])?.[0];
  if (!ending) return null;
  const rest = form.slice(0, -ending.length);
  const sign = (re: RegExp) => {
    const m = rest.match(re);
    return m && m[1] ? { stem: m[1], sign: m[2], ending } : null;
  };
  if (slot.tense === 'pres') return rest ? { stem: rest, ending } : null;
  if (slot.tense === 'impf') return sign(/^(.+)(b[aā])$/);
  if (slot.tense === 'fut') {
    if (verb.conjugation === 1 || verb.conjugation === 2)
      // vocābō: the -bō is sign and ending in one.
      return slot.number === 'sg' && slot.person === 1 ? sign(/^(.+)(b)$/) : sign(/^(.+)(b[iu])$/);
    return sign(/^(.+)([aēe])$/);
  }
  return null;
};

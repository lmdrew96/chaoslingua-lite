// Suburani model verbs — one paradigm per conjugation, plus the irregulars, copied
// from the Suburani Reference Grammar Book 2 ("Verbs: Active indicative", "Irregular
// verbs: indicative", the ferō table, and "Other parts of the verb"). Book 2 rather
// than Book 1, which only gives the future for the 1st and 2nd conjugations.
// Active indicative only: LATN 101 doesn't cover the passive or subjunctive, and
// those Book 2 tables have typos (mittm, teneānt, audīāmus, ferotur).
// Like the noun tables, every form is copied, not generated from endings. The
// irregulars' perfect system is the exception: Book 2 gives only "I" and "you (sing.)"
// and calls the rest regular, so the rest comes from the import, which checks it
// against those textbook cells (IRREGULAR_PERFECT_CELLS).

import { IMPORTED_CONJUGATIONS, IRREGULAR_PERFECTS } from './conjugations.generated';
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
export const PERFECT_SYSTEM: Tense[] = ['perf', 'futperf', 'plup'];

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

// Personal endings, the same in every conjugation and tense of the present system.
export const PERSONAL_ENDINGS: Array<{ label: string; ending: string }> = [
  { label: 'I', ending: '-ō / -m' },
  { label: 'you (sing.)', ending: '-s' },
  { label: 'he, she, it', ending: '-t' },
  { label: 'we', ending: '-mus' },
  { label: 'you (pl.)', ending: '-tis' },
  { label: 'they', ending: '-nt' },
];

// The perfect system's own endings — the perfect tense only; the future perfect and
// pluperfect use the usual ones after their sign.
export const PERFECT_ENDINGS: Array<{ label: string; ending: string }> = [
  { label: 'I', ending: '-ī' },
  { label: 'you (sing.)', ending: '-istī' },
  { label: 'he, she, it', ending: '-it' },
  { label: 'we', ending: '-imus' },
  { label: 'you (pl.)', ending: '-istis' },
  { label: 'they', ending: '-ērunt' },
];

// Tense signs, each with forms from the model tables split stem · sign · ending (the
// Learn page checks that every example joins back to a real table form).
export interface TenseSign {
  tense: Tense;
  heading: string;
  note?: string;
  examples: Array<{ stem: string; sign?: string; ending?: string }>;
}

export const TENSE_SIGNS: TenseSign[] = [
  {
    tense: 'impf',
    heading: 'Imperfect: -ba- before the ending, in every conjugation',
    examples: [
      { stem: 'vocā', sign: 'ba', ending: 'm' },
      { stem: 'tenē', sign: 'bā', ending: 's' },
      { stem: 'mittē', sign: 'ba', ending: 't' },
      { stem: 'audiē', sign: 'bā', ending: 'mus' },
      { stem: 'capiē', sign: 'ba', ending: 'nt' },
    ],
  },
  {
    tense: 'fut',
    heading: 'Future, 1st and 2nd conjugations: -bō, -bi-, -bu-',
    examples: [
      { stem: 'vocā', sign: 'bō' },
      { stem: 'vocā', sign: 'bi', ending: 't' },
      { stem: 'tenē', sign: 'bi', ending: 'mus' },
      { stem: 'tenē', sign: 'bu', ending: 'nt' },
    ],
  },
  {
    tense: 'fut',
    heading: 'Future, 3rd, 4th and 3rd/4th: -a- for “I”, -ē- after that',
    note: 'short -e- before -t and -nt',
    examples: [
      { stem: 'mitt', sign: 'a', ending: 'm' },
      { stem: 'mitt', sign: 'ē', ending: 's' },
      { stem: 'audi', sign: 'e', ending: 't' },
      { stem: 'capi', sign: 'ē', ending: 'mus' },
      { stem: 'audi', sign: 'e', ending: 'nt' },
    ],
  },
  {
    tense: 'perf',
    heading: 'Perfect: the perfect stem (3rd principal part minus -ī) + the perfect endings',
    examples: [
      { stem: 'vocāv', ending: 'ī' },
      { stem: 'tenu', ending: 'istī' },
      { stem: 'mīs', ending: 'it' },
      { stem: 'audīv', ending: 'imus' },
      { stem: 'cēp', ending: 'ērunt' },
    ],
  },
  {
    tense: 'futperf',
    heading: 'Future perfect: perfect stem + -er- / -eri-',
    note: '-erō for “I”, -erint for “they”',
    examples: [
      { stem: 'vocāv', sign: 'er', ending: 'ō' },
      { stem: 'tenu', sign: 'eri', ending: 's' },
      { stem: 'mīs', sign: 'eri', ending: 't' },
      { stem: 'cēp', sign: 'eri', ending: 'nt' },
    ],
  },
  {
    tense: 'plup',
    heading: 'Pluperfect: perfect stem + -era-',
    examples: [
      { stem: 'vocāv', sign: 'era', ending: 'm' },
      { stem: 'tenu', sign: 'erā', ending: 's' },
      { stem: 'mīs', sign: 'era', ending: 't' },
      { stem: 'audīv', sign: 'erā', ending: 'mus' },
      { stem: 'cēp', sign: 'era', ending: 'nt' },
    ],
  },
];

// The notes below mark Latin words *like this* and emphasis **like this**, so they
// read fine as plain text (the MCP tutor) and Learn can style them.

// Why the conjugation matters for the future: its sign looks like another
// conjugation's present.
export const FUTURE_LOOKALIKE_NOTE =
  '**So the conjugation decides the tense.** *tenet* (2nd) is present, “holds”, but *mittet* (3rd) is future, “will send”. In the 3rd conjugation only a vowel separates the two: *mittit* / *mittet*, *mittis* / *mittēs*.';

export const CONJUGATION_FROM_INFINITIVE: Array<{ ending: string; conjugation: string; example: string }> = [
  { ending: '-āre', conjugation: '1st', example: 'vocō, vocāre' },
  { ending: '-ēre', conjugation: '2nd', example: 'teneō, tenēre' },
  { ending: '-ere', conjugation: '3rd — or 3rd/4th if the first part ends in -iō', example: 'mittō, mittere · capiō, capere' },
  { ending: '-īre', conjugation: '4th', example: 'audiō, audīre' },
];

export const INFINITIVE_TIEBREAK_NOTE =
  '-ēre and -ere differ only by the macron. The first part breaks the tie: an -eō verb (teneō) is 2nd conjugation; mittō is 3rd.';

export const PRINCIPAL_PARTS_NOTE =
  'A verb is listed by its principal parts, the forms you need to build everything else. From ch.7 the vocab lists give three: *nārrō, nārrāre, nārrāvī* — “I tell, to tell, I told”. Ch.5–6 give the first two; Book 2 adds a fourth (*līberātus*, “freed”). The first two give the present, future and imperfect; the third gives the perfect, which class reaches in Module 5.';

export type TenseTable = Record<GNumber, Record<Person, string>>;

export interface ModelVerb {
  id: string;
  conjugation: Conjugation;
  // English base form from the table header ("call"), for drill feedback.
  gloss: string;
  infinitive: string;
  // Null where Suburani gives none (possum, volō, mālō).
  imperative: { sg: string; pl: string } | null;
  // Irregulars may lack the perfect system until the import has supplied it.
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
      perf: table('vocāvī vocāvistī vocāvit vocāvimus vocāvistis vocāvērunt'),
      futperf: table('vocāverō vocāveris vocāverit vocāverimus vocāveritis vocāverint'),
      plup: table('vocāveram vocāverās vocāverat vocāverāmus vocāverātis vocāverant'),
    },
  },
  {
    id: 'teneo', conjugation: 2, gloss: 'hold', infinitive: 'tenēre', imperative: { sg: 'tenē', pl: 'tenēte' },
    forms: {
      pres: table('teneō tenēs tenet tenēmus tenētis tenent'),
      fut: table('tenēbō tenēbis tenēbit tenēbimus tenēbitis tenēbunt'),
      impf: table('tenēbam tenēbās tenēbat tenēbāmus tenēbātis tenēbant'),
      perf: table('tenuī tenuistī tenuit tenuimus tenuistis tenuērunt'),
      futperf: table('tenuerō tenueris tenuerit tenuerimus tenueritis tenuerint'),
      plup: table('tenueram tenuerās tenuerat tenuerāmus tenuerātis tenuerant'),
    },
  },
  {
    id: 'mitto', conjugation: 3, gloss: 'send', infinitive: 'mittere', imperative: { sg: 'mitte', pl: 'mittite' },
    forms: {
      pres: table('mittō mittis mittit mittimus mittitis mittunt'),
      fut: table('mittam mittēs mittet mittēmus mittētis mittent'),
      impf: table('mittēbam mittēbās mittēbat mittēbāmus mittēbātis mittēbant'),
      perf: table('mīsī mīsistī mīsit mīsimus mīsistis mīsērunt'),
      futperf: table('mīserō mīseris mīserit mīserimus mīseritis mīserint'),
      plup: table('mīseram mīserās mīserat mīserāmus mīserātis mīserant'),
    },
  },
  {
    id: 'audio', conjugation: 4, gloss: 'hear', infinitive: 'audīre', imperative: { sg: 'audī', pl: 'audīte' },
    forms: {
      pres: table('audiō audīs audit audīmus audītis audiunt'),
      fut: table('audiam audiēs audiet audiēmus audiētis audient'),
      impf: table('audiēbam audiēbās audiēbat audiēbāmus audiēbātis audiēbant'),
      perf: table('audīvī audīvistī audīvit audīvimus audīvistis audīvērunt'),
      futperf: table('audīverō audīveris audīverit audīverimus audīveritis audīverint'),
      plup: table('audīveram audīverās audīverat audīverāmus audīverātis audīverant'),
    },
  },
  {
    id: 'capio', conjugation: '3io', gloss: 'take', infinitive: 'capere', imperative: { sg: 'cape', pl: 'capite' },
    forms: {
      pres: table('capiō capis capit capimus capitis capiunt'),
      fut: table('capiam capiēs capiet capiēmus capiētis capient'),
      impf: table('capiēbam capiēbās capiēbat capiēbāmus capiēbātis capiēbant'),
      perf: table('cēpī cēpistī cēpit cēpimus cēpistis cēpērunt'),
      futperf: table('cēperō cēperis cēperit cēperimus cēperitis cēperint'),
      plup: table('cēperam cēperās cēperat cēperāmus cēperātis cēperant'),
    },
  },
];

// Book 2's perfect-system cells for the irregulars: "I" and "you (sing.)" of each tense
// (ferō: only the 3rd principal part, tulī). The import checks its tables against these.
export const IRREGULAR_PERFECT_CELLS: Record<string, Partial<Record<Tense, string[]>>> = {
  sum: { perf: ['fuī', 'fuistī'], futperf: ['fuerō', 'fueris'], plup: ['fueram', 'fuerās'] },
  possum: { perf: ['potuī', 'potuistī'], futperf: ['potuerō', 'potueris'], plup: ['potueram', 'potuerās'] },
  eo: { perf: ['iī', 'iistī'], futperf: ['ierō', 'ieris'], plup: ['ieram', 'ierās'] },
  volo: { perf: ['voluī', 'voluistī'], futperf: ['voluerō', 'volueris'], plup: ['volueram', 'voluerās'] },
  nolo: { perf: ['nōluī', 'nōluistī'], futperf: ['nōluerō', 'nōlueris'], plup: ['nōlueram', 'nōluerās'] },
  malo: { perf: ['māluī', 'māluistī'], futperf: ['māluerō', 'mālueris'], plup: ['mālueram', 'māluerās'] },
  fero: { perf: ['tulī'] },
};

const IRREGULAR_PRESENT: ModelVerb[] = [
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

export const IRREGULAR_VERBS: ModelVerb[] = IRREGULAR_PRESENT.map((v) => ({
  ...v,
  forms: { ...v.forms, ...IRREGULAR_PERFECTS[v.id] },
}));

export const lemmaOf = (v: Pick<ModelVerb, 'forms'>): string => v.forms.pres!.sg[1];

// What the course opens verbs by: the conjugation, except that sum gets its own gate —
// class has used it since Module 1, long before the other irregulars. A verb's
// conjugation stays 'irr' for grading and stats; only the unlock differs.
export type VerbGate = Conjugation | 'sum';
export const VERB_GATES: VerbGate[] = [...CONJUGATIONS.filter((c) => c !== 'irr'), 'sum', 'irr'];

export const gateOf = (v: Pick<ModelVerb, 'conjugation' | 'forms'>): VerbGate =>
  v.conjugation === 'irr' && lemmaOf(v) === 'sum' ? 'sum' : v.conjugation;

export const gateLabel = (g: VerbGate): string =>
  g === 'sum' ? 'sum' : g === 'irr' ? 'other irregulars' : conjugationLabel(g);

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

// The textbook verbs for every open gate (always — they're the tables class
// learns from), plus vocab verbs of open chapters whose Wiktionary import passed
// review. A vocab verb that's also a textbook verb (vocō, sum) uses the textbook table.
export const drillableVerbs = (chapters: Set<number>, gates: Set<VerbGate>): DrillVerb[] => {
  const pool: DrillVerb[] = [...MODEL_VERBS, ...IRREGULAR_VERBS].filter((v) => gates.has(gateOf(v)));
  const seen = new Set([...MODEL_VERBS, ...IRREGULAR_VERBS].map(lemmaOf));
  for (const v of vocab) {
    const imported = IMPORTED_CONJUGATIONS[v.id];
    if (v.pos !== 'Verb' || !chapters.has(v.chapter) || !imported || imported.review) continue;
    if (!gates.has(gateOf(imported))) continue;
    // Skip repeats: legō is listed in ch.1 and again in ch.16.
    const lemma = imported.forms.pres!.sg[1];
    if (seen.has(lemma)) continue;
    seen.add(lemma);
    // A perfect system awaiting Nae's confirm pass stays out; the present system drills.
    const forms = imported.perfectReview
      ? Object.fromEntries(Object.entries(imported.forms).filter(([t]) => !PERFECT_SYSTEM.includes(t as Tense)))
      : imported.forms;
    pool.push({
      id: v.id,
      conjugation: imported.conjugation,
      gloss: verbGloss(v.en),
      infinitive: imported.infinitive,
      forms,
      chapter: v.chapter,
    });
  }
  return pool;
};

// Semantic role lists for the decode drill: which verbs fit which sentence frame.
// Only the dictionary form and English are listed here — every form the drill shows
// comes from the verb's sourced table (drillableVerbs), so a verb drops out until its
// table is in the pool. `en` is the English base form, inflected per person, number,
// and tense by englishVerbs.ts.

export interface DecodeVerb {
  chapter: number;
  lemma: string;
  en: string;
}

// "The X greets the Y."
export const DECODE_VERBS: DecodeVerb[] = [
  { chapter: 2, lemma: 'salūtō', en: 'greet' },
  { chapter: 2, lemma: 'spectō', en: 'watch' },
  { chapter: 2, lemma: 'videō', en: 'see' },
  { chapter: 2, lemma: 'vocō', en: 'call' },
  { chapter: 4, lemma: 'laudō', en: 'praise' },
  { chapter: 5, lemma: 'audiō', en: 'hear' },
  { chapter: 5, lemma: 'timeō', en: 'fear' },
  { chapter: 6, lemma: 'exspectō', en: 'wait for' },
  { chapter: 6, lemma: 'rogō', en: 'ask' },
];

// "The X gives Y to Z" — a giver (nom), a thing (acc), and a recipient (dat).
export const DATIVE_VERBS: DecodeVerb[] = [
  { chapter: 5, lemma: 'dō', en: 'give' },
  { chapter: 9, lemma: 'trādō', en: 'hand over' },
  { chapter: 12, lemma: 'offerō', en: 'offer' },
  { chapter: 14, lemma: 'ostendō', en: 'show' },
];

// Intransitive verbs for a preposition + ablative phrase. `en` reads before the
// preposition's English ("walk" + "with the girl", "run" + "away from the king").
export interface PrepVerb extends DecodeVerb {
  prep: 'cum' | 'ab';
}

export const PREP_VERBS: PrepVerb[] = [
  { chapter: 1, lemma: 'labōrō', en: 'work', prep: 'cum' },
  { chapter: 3, lemma: 'ambulō', en: 'walk', prep: 'cum' },
  { chapter: 3, lemma: 'currō', en: 'run', prep: 'cum' },
  { chapter: 4, lemma: 'veniō', en: 'come', prep: 'cum' },
  { chapter: 6, lemma: 'sedeō', en: 'sit', prep: 'cum' },
  { chapter: 6, lemma: 'discēdō', en: 'go', prep: 'ab' },
  { chapter: 11, lemma: 'fugiō', en: 'run', prep: 'ab' },
];

// Motion verbs for the decode drill's route tier (ē/ex + abl → in + acc). `en` reads
// before the route ("run" + "out of the city into the forest").
export const ROUTE_VERBS: DecodeVerb[] = [
  { chapter: 3, lemma: 'ambulō', en: 'walk' },
  { chapter: 3, lemma: 'currō', en: 'run' },
  { chapter: 3, lemma: 'festīnō', en: 'hurry' },
  { chapter: 11, lemma: 'fugiō', en: 'flee' },
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
  verb: Pick<DrillVerb, 'conjugation' | 'forms'>,
  slot: VerbSlot,
  form: string,
): { stem: string; sign?: string; ending: string } | null => {
  if (verb.conjugation === 'irr') return null;
  if (PERFECT_SYSTEM.includes(slot.tense)) return perfectSegments(verb, slot, form);
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

const PERFECT_ENDING_RES: Record<GNumber, Record<Person, RegExp>> = {
  sg: { 1: /^ī$/, 2: /^istī$/, 3: /^it$/ },
  pl: { 1: /^imus$/, 2: /^istis$/, 3: /^ērunt$/ },
};

// The perfect system splits on the perfect stem (the 3rd principal part minus -ī):
// mīs·istī, vocāv·era·nt, cēp·eri·nt.
export const perfectStem = (verb: Pick<DrillVerb, 'forms'>): string | null => {
  const first = verb.forms.perf?.sg[1];
  return first?.endsWith('ī') ? first.slice(0, -1) : null;
};

const perfectSegments = (
  verb: Pick<DrillVerb, 'forms'>,
  slot: VerbSlot,
  form: string,
): { stem: string; sign?: string; ending: string } | null => {
  const stem = perfectStem(verb);
  if (!stem || !form.startsWith(stem)) return null;
  const rest = form.slice(stem.length);
  if (slot.tense === 'perf') return PERFECT_ENDING_RES[slot.number][slot.person].test(rest) ? { stem, ending: rest } : null;
  const m = rest.match(slot.tense === 'plup' ? /^(er[aā])(m|s|t|mus|tis|nt)$/ : /^(eri?)(ō|s|t|mus|tis|nt)$/);
  return m ? { stem, sign: m[1], ending: m[2] } : null;
};

// What a verb drill logs to `attempts` for the slot it tested.
export const verbMeta = (verb: Pick<DrillVerb, 'chapter' | 'conjugation'>, slot: VerbSlot) => ({
  ...(verb.chapter ? { chapter: verb.chapter } : {}),
  tense: slot.tense,
  person: slot.person,
  number: slot.number,
  conjugation: String(verb.conjugation),
});

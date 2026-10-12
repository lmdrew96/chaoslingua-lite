import { NUMBERS } from '../data/nouns';
import { PERSONS, TENSES, drillableVerbs, sameSlot, verbMeta, verbParsesOf, type Conjugation, type DrillVerb, type VerbSlot } from '../data/verbs';
import { pick, shuffle } from '../lib/random';
import type { DrillContext, DrillType, VerbParseDrill } from './types';

const MEANING_CHOICES = 5;

// Textbook verbs plus reviewed vocab verbs, grouped by conjugation, keeping only verbs
// with at least one open tense.
const pool = (ctx: DrillContext): Map<Conjugation, DrillVerb[]> => {
  const byConj = new Map<Conjugation, DrillVerb[]>();
  for (const v of drillableVerbs(ctx.chapters, ctx.conjugations, ctx.perfectGates)) {
    if (!TENSES.some((t) => ctx.tenses.has(t) && v.forms[t])) continue;
    byConj.set(v.conjugation, [...(byConj.get(v.conjugation) ?? []), v]);
  }
  return byConj;
};

// The meaning row: every valid parse, then the slots nearest the answer (one person,
// number, or tense away) so the English choices turn on the ending.
const meaningChoices = (parses: VerbSlot[], tenses: VerbSlot['tense'][]): VerbSlot[] => {
  const all = tenses.flatMap((tense) => NUMBERS.flatMap((number) => PERSONS.map((person) => ({ tense, number, person }))));
  const target = parses[0];
  const distance = (s: VerbSlot) =>
    Number(s.tense !== target.tense) + Number(s.number !== target.number) + Number(s.person !== target.person);
  const others = shuffle(all.filter((s) => !parses.some((p) => sameSlot(p, s)))).sort((a, b) => distance(a) - distance(b));
  return shuffle([...parses, ...others].slice(0, Math.max(MEANING_CHOICES, parses.length)));
};

let lastForm: string | null = null;

// Conjugation first, then verb, then tense and slot — so the five textbook conjugations
// come up equally often however many vocab verbs each one has.
const makeVerbParse = (ctx: DrillContext): VerbParseDrill | null => {
  const byConj = pool(ctx);
  const conjugations = [...byConj.keys()];
  if (!conjugations.length) return null;
  const tenses = TENSES.filter((t) => ctx.tenses.has(t));

  for (let tries = 0; tries < 10; tries++) {
    const verb = pick(byConj.get(pick(conjugations))!);
    const tense = pick(tenses.filter((t) => verb.forms[t]));
    const form = verb.forms[tense]![pick(NUMBERS)][pick(PERSONS)];
    if (form === lastForm) continue;
    lastForm = form;
    const parses = verbParsesOf(verb, form).filter((p) => tenses.includes(p.tense));
    return {
      kind: 'verbParse',
      type: 'verb-parse',
      label: 'Parse verb',
      verb,
      form,
      parses,
      tenses,
      meanings: meaningChoices(parses, tenses.filter((t) => verb.forms[t])),
      meta: verbMeta(verb, parses[0]),
    };
  }
  return null;
};

export const verbParseDrill: DrillType = { type: 'verb-parse', label: 'Parse verb', make: makeVerbParse };

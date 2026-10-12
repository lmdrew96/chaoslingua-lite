// Production direction: dictionary form + slot → the form. Tests ask students to
// conjugate, not just recognize, so this is the verb parse turned around. Every
// option comes from the same verb's sourced table, so the choice turns on the
// ending, not the stem.

import { englishFor } from '../data/englishVerbs';
import { NUMBERS, numberNames } from '../data/nouns';
import {
  PERSONS,
  TENSES,
  drillableVerbs,
  lemmaOf,
  personNames,
  segmentsOf,
  tenseNames,
  type Conjugation,
  type DrillVerb,
  type VerbSlot,
  verbMeta,
} from '../data/verbs';
import { pick, shuffle } from '../lib/random';
import type { DrillContext, DrillType, McDrill } from './types';

const OPTIONS = 4;

const pool = (ctx: DrillContext): Map<Conjugation, DrillVerb[]> => {
  const byConj = new Map<Conjugation, DrillVerb[]>();
  for (const v of drillableVerbs(ctx.chapters, ctx.conjugations, ctx.perfectGates)) {
    if (!TENSES.some((t) => ctx.tenses.has(t) && v.forms[t])) continue;
    byConj.set(v.conjugation, [...(byConj.get(v.conjugation) ?? []), v]);
  }
  return byConj;
};

// Distractors nearest the answer first: same tense with another person or number
// (portant), or the same person and number in another tense (portābunt).
const distractors = (verb: DrillVerb, target: VerbSlot, answer: string, tenses: VerbSlot['tense'][]): string[] => {
  const slots = tenses.flatMap((tense) => NUMBERS.flatMap((number) => PERSONS.map((person) => ({ tense, number, person }))));
  const distance = (s: VerbSlot) =>
    Number(s.tense !== target.tense) + Number(s.number !== target.number) + Number(s.person !== target.person);
  const forms = shuffle(slots)
    .sort((a, b) => distance(a) - distance(b))
    .map((s) => verb.forms[s.tense]![s.number][s.person]);
  return [...new Set(forms)].filter((f) => f !== answer).slice(0, OPTIONS - 1);
};

let lastAnswer: string | null = null;

const makeConjugate = (ctx: DrillContext): McDrill | null => {
  const byConj = pool(ctx);
  const conjugations = [...byConj.keys()];
  if (!conjugations.length) return null;
  const open = TENSES.filter((t) => ctx.tenses.has(t));

  for (let tries = 0; tries < 10; tries++) {
    const verb = pick(byConj.get(pick(conjugations))!);
    const tenses = open.filter((t) => verb.forms[t]);
    const slot: VerbSlot = { tense: pick(tenses), number: pick(NUMBERS), person: pick(PERSONS) };
    const answer = verb.forms[slot.tense]![slot.number][slot.person];
    if (answer === lastAnswer) continue;
    lastAnswer = answer;
    const parts = segmentsOf(verb, slot, answer);
    const english = englishFor(verb.gloss, slot.tense, slot.number, slot.person);
    return {
      kind: 'mc',
      type: 'conjugate',
      label: 'Conjugate',
      prompt: `<span class="latin">${lemmaOf(verb)}, ${verb.infinitive}</span> (${verb.gloss}) → <strong>${personNames[slot.person]} ${numberNames[slot.number]}, ${tenseNames[slot.tense]}</strong>`,
      options: shuffle([answer, ...distractors(verb, slot, answer, tenses)]),
      answer,
      explanation: parts
        ? `${[parts.stem, parts.sign, parts.ending].filter(Boolean).join('·')} — ${english}.`
        : `${answer} — ${english}.`,
      typeable: true,
      meta: verbMeta(verb, slot),
    };
  }
  return null;
};

export const conjugateDrill: DrillType = { type: 'conjugate', label: 'Conjugate', make: makeConjugate };

import { CASES, NUMBERS, modelNounsFor, parsesOf, type Case, type GNumber, type ModelNoun } from '../data/nouns';
import { pick } from '../lib/random';
import type { DrillContext, DrillType, ParseDrill } from './types';

// The English a case's job gives a noun — "of the nights" — so the parse ends in
// meaning, not just a label. Phrasing follows Suburani's uses-of-the-cases table.
export const jobPhrase = (c: Case, n: GNumber, noun: ModelNoun): string => {
  const the = `the ${n === 'sg' ? noun.gloss : noun.glossPl}`;
  switch (c) {
    case 'nom':
      return `${the} (doing the action)`;
    case 'gen':
      return `of ${the}`;
    case 'dat':
      return `to/for ${the}`;
    case 'acc':
      return `${the} (receiving the action)`;
    case 'abl':
      return `in/on/by/with/from/at ${the}`;
  }
};

let lastForm: string | null = null;

// Declension first, then noun, then slot — so a declension with one model noun (1st)
// comes up as often as one with four (3rd), keeping the pool interleaved.
const makeParse = (ctx: DrillContext): ParseDrill | null => {
  const declensions = [...ctx.declensions].filter((d) => modelNounsFor(d).length > 0);
  if (!declensions.length) return null;

  for (let tries = 0; tries < 10; tries++) {
    const noun = pick(modelNounsFor(pick(declensions)));
    const number = pick(NUMBERS);
    const c = pick(CASES);
    const form = noun.forms[number][c];
    if (form === lastForm) continue;
    lastForm = form;
    return {
      kind: 'parse',
      type: 'parse',
      label: 'Parse',
      noun,
      form,
      parses: parsesOf(noun, form),
      meta: { declension: noun.declension, case: c },
    };
  }
  return null;
};

export const parseDrill: DrillType = { type: 'parse', label: 'Parse', make: makeParse };

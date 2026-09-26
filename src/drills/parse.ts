import { ENGLISH_PLURALS } from '../data/englishPlurals';
import { CASES, MODEL_NOUNS, NUMBERS, parsesOf, type Case, type Declension, type GNumber, type ParseNoun } from '../data/nouns';
import { IMPORTED_PARADIGMS } from '../data/paradigms.generated';
import { drillableNouns } from '../data/vocab';
import { pick } from '../lib/random';
import type { DrillContext, DrillType, ParseDrill } from './types';

// The English a case's job gives a noun — "of the nights" — so the parse ends in
// meaning, not just a label. Phrasing follows Suburani's uses-of-the-cases table.
export const jobPhrase = (c: Case, n: GNumber, noun: ParseNoun): string => {
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

// The textbook model nouns for every enabled declension, plus the vocab nouns of
// enabled chapters whose Wiktionary-imported paradigm passed review. A vocab noun
// that's also a model noun (puella, urbs, …) uses the textbook table.
const pool = (ctx: DrillContext): Map<Declension, ParseNoun[]> => {
  const byDecl = new Map<Declension, ParseNoun[]>();
  const add = (n: ParseNoun) => byDecl.set(n.declension, [...(byDecl.get(n.declension) ?? []), n]);
  const modelNoms = new Set<string>(); // nominatives already in the pool
  for (const n of MODEL_NOUNS) {
    if (!ctx.declensions.has(n.declension)) continue;
    add(n);
    modelNoms.add(n.forms.sg.nom);
  }
  for (const v of drillableNouns(ctx.chapters, ctx.declensions)) {
    const imported = IMPORTED_PARADIGMS[v.id];
    // Skip repeats too: a noun can be relisted in a later chapter (īnsula in ch.1 and 7).
    if (!imported || imported.review || modelNoms.has(v.la)) continue;
    modelNoms.add(v.la);
    const gloss = v.en.split(',')[0].trim();
    add({
      id: v.id,
      declension: v.declension!,
      gloss,
      glossPl: ENGLISH_PLURALS[v.id] ?? `${gloss} (pl.)`,
      forms: imported.forms,
      chapter: v.chapter,
    });
  }
  return byDecl;
};

let lastForm: string | null = null;

// Declension first, then noun, then slot — so a declension with few nouns comes up as
// often as one with many, keeping the pool interleaved.
const makeParse = (ctx: DrillContext): ParseDrill | null => {
  const byDecl = pool(ctx);
  const declensions = [...byDecl.keys()];
  if (!declensions.length) return null;

  for (let tries = 0; tries < 10; tries++) {
    const noun = pick(byDecl.get(pick(declensions))!);
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
      meta: { declension: noun.declension, case: c, ...(noun.chapter ? { chapter: noun.chapter } : {}) },
    };
  }
  return null;
};

export const parseDrill: DrillType = { type: 'parse', label: 'Parse', make: makeParse };

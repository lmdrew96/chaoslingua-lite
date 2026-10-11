// English for a verb slot — "they were calling" — so a verb parse ends in meaning,
// the way noun parses end in a case job. English grammar, not Latin, so the irregular
// bits are hand-written tables; every vocab gloss's output was read through once
// (10/11) and the exceptions added here.

import type { GNumber } from './nouns';
import type { Person, Tense } from './verbs';

export const englishSubjects: Record<GNumber, Record<Person, string>> = {
  sg: { 1: 'I', 2: 'you (sg.)', 3: 'he/she/it' },
  pl: { 1: 'we', 2: 'you (pl.)', 3: 'they' },
};

// he/she/it present, where adding -s/-es isn't enough.
const THIRD_SINGULAR: Record<string, string> = { have: 'has', do: 'does', go: 'goes' };

// -ing forms the rules below get wrong.
const ING: Record<string, string> = { lie: 'lying', die: 'dying', see: 'seeing', flee: 'fleeing' };

// One-syllable verbs that double the final consonant (run → running).
const DOUBLES = new Set(['run', 'sit', 'get', 'set', 'put', 'swim', 'stop', 'cut', 'hit', 'begin', 'plan', 'shut', 'win', 'drop', 'grab', 'drag', 'beg', 'rob', 'forget',
  // British spelling, as in Suburani (favour).
  'worship']);

// Verbs that read oddly in the progressive ("I was wanting"), so the imperfect uses
// Suburani's other frame, "used to".
const STATIVE = new Set(['want', 'prefer', 'have', 'owe', 'fear', 'know', 'love', 'like', 'understand', 'believe', 'own', 'possess', 'ought']);

const thirdSingular = (verb: string): string => {
  if (THIRD_SINGULAR[verb]) return THIRD_SINGULAR[verb];
  if (/(s|sh|ch|x|z|o)$/.test(verb)) return `${verb}es`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
  return `${verb}s`;
};

const ing = (verb: string): string => {
  if (ING[verb]) return ING[verb];
  if (DOUBLES.has(verb)) return `${verb}${verb.slice(-1)}ing`;
  if (/ie$/.test(verb)) return `${verb.slice(0, -2)}ying`;
  if (/[^e]e$/.test(verb)) return `${verb.slice(0, -1)}ing`;
  return `${verb}ing`;
};

const am = (n: GNumber, p: Person): string => (n === 'sg' && p === 1 ? 'am' : n === 'sg' && p === 3 ? 'is' : 'are');
const was = (n: GNumber, p: Person): string => (n === 'sg' && p !== 2 ? 'was' : 'were');

// The predicate alone: "were calling", "is silent", "will look at". Present-system
// tenses only — the perfect-system frames arrive with Module 5.
export const englishPredicate = (gloss: string, tense: Tense, n: GNumber, p: Person): string => {
  // "be able", "am silent", "be" — a form of to be plus whatever follows it.
  const be = gloss.match(/^(?:am|be)(?: (.*))?$/);
  if (be) {
    const rest = be[1] ? ` ${be[1]}` : '';
    if (tense === 'pres') return `${am(n, p)}${rest}`;
    if (tense === 'impf') return `${was(n, p)}${rest}`;
    return `will be${rest}`;
  }
  // "don't know" (nesciō).
  const not = gloss.match(/^don't (.*)$/);
  if (not) {
    if (tense === 'pres') return `${n === 'sg' && p === 3 ? "doesn't" : "don't"} ${not[1]}`;
    if (tense === 'impf') return `didn't ${not[1]}`;
    return `won't ${not[1]}`;
  }
  const [head, ...tail] = gloss.split(' ');
  const after = tail.length ? ` ${tail.join(' ')}` : '';
  if (tense === 'pres') return n === 'sg' && p === 3 ? `${thirdSingular(head)}${after}` : gloss;
  if (tense === 'impf') return STATIVE.has(head) ? `used to ${gloss}` : `${was(n, p)} ${ing(head)}${after}`;
  return `will ${gloss}`;
};

export const englishFor = (gloss: string, tense: Tense, n: GNumber, p: Person): string =>
  `${englishSubjects[n][p]} ${englishPredicate(gloss, tense, n, p)}`;

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

// Past tense and past participle where -ed isn't it. A string is both; a pair is
// [past, participle]. British "got" as Suburani would write it.
const PAST: Record<string, string | [string, string]> = {
  begin: ['began', 'begun'], break: ['broke', 'broken'], build: 'built', buy: 'bought', catch: 'caught',
  come: ['came', 'come'], do: ['did', 'done'], drink: ['drank', 'drunk'], drive: ['drove', 'driven'],
  fall: ['fell', 'fallen'], feel: 'felt', fight: 'fought', find: 'found', flee: 'fled', get: 'got',
  give: ['gave', 'given'], go: ['went', 'gone'], have: 'had', hear: 'heard', hide: ['hid', 'hidden'],
  hold: 'held', know: ['knew', 'known'], lead: 'led', leave: 'left', lie: ['lay', 'lain'], lose: 'lost',
  make: 'made', overcome: ['overcame', 'overcome'], prefer: 'preferred', put: 'put', read: 'read',
  run: ['ran', 'run'], say: 'said', see: ['saw', 'seen'], sell: 'sold', send: 'sent', show: ['showed', 'shown'], sing: ['sang', 'sung'],
  sit: 'sat', sleep: 'slept', stand: 'stood', take: ['took', 'taken'], teach: 'taught', tell: 'told',
  think: 'thought', throw: ['threw', 'thrown'], understand: 'understood', undo: ['undid', 'undone'],
  wear: ['wore', 'worn'], write: ['wrote', 'written'],
};

const regularPast = (verb: string): string => {
  if (DOUBLES.has(verb)) return `${verb}${verb.slice(-1)}ed`;
  if (/e$/.test(verb)) return `${verb}d`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
  return `${verb}ed`;
};

const pastOf = (verb: string): string => {
  const p = PAST[verb];
  return p === undefined ? regularPast(verb) : typeof p === 'string' ? p : p[0];
};

const participleOf = (verb: string): string => {
  const p = PAST[verb];
  return p === undefined ? regularPast(verb) : typeof p === 'string' ? p : p[1];
};

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
const has = (n: GNumber, p: Person): string => (n === 'sg' && p === 3 ? 'has' : 'have');

// The predicate alone: "were calling", "is silent", "will look at", "had sent".
// Suburani's frames: the perfect as the simple past ("I called"), the future perfect
// "shall have" (written "will have"), the pluperfect "had". Where the simple past would
// read the same as another tense ("was", "didn't know", "read"), the perfect takes Suburani's
// other frame, "have been", so the two tenses never share an English choice.
export const englishPredicate = (gloss: string, tense: Tense, n: GNumber, p: Person): string => {
  // "be able", "am silent", "be" — a form of to be plus whatever follows it.
  const be = gloss.match(/^(?:am|be)(?: (.*))?$/);
  if (be) {
    const rest = be[1] ? ` ${be[1]}` : '';
    if (tense === 'pres') return `${am(n, p)}${rest}`;
    if (tense === 'impf') return `${was(n, p)}${rest}`;
    if (tense === 'perf') return `${has(n, p)} been${rest}`;
    if (tense === 'futperf') return `will have been${rest}`;
    if (tense === 'plup') return `had been${rest}`;
    return `will be${rest}`;
  }
  // "don't know" (nesciō).
  const not = gloss.match(/^don't (.*)$/);
  if (not) {
    if (tense === 'pres') return `${n === 'sg' && p === 3 ? "doesn't" : "don't"} ${not[1]}`;
    if (tense === 'impf') return `didn't ${not[1]}`;
    if (tense === 'perf') return `${has(n, p)}n't ${participleOf(not[1])}`;
    if (tense === 'futperf') return `won't have ${participleOf(not[1])}`;
    if (tense === 'plup') return `hadn't ${participleOf(not[1])}`;
    return `won't ${not[1]}`;
  }
  const [head, ...tail] = gloss.split(' ');
  const after = tail.length ? ` ${tail.join(' ')}` : '';
  if (tense === 'pres') return n === 'sg' && p === 3 ? `${thirdSingular(head)}${after}` : gloss;
  if (tense === 'impf') return STATIVE.has(head) ? `used to ${gloss}` : `${was(n, p)} ${ing(head)}${after}`;
  // read, put: the simple past is the present, so "have read".
  if (tense === 'perf') return pastOf(head) === head ? `${has(n, p)} ${participleOf(head)}${after}` : `${pastOf(head)}${after}`;
  if (tense === 'futperf') return `will have ${participleOf(head)}${after}`;
  if (tense === 'plup') return `had ${participleOf(head)}${after}`;
  return `will ${gloss}`;
};

export const englishFor = (gloss: string, tense: Tense, n: GNumber, p: Person): string =>
  `${englishSubjects[n][p]} ${englishPredicate(gloss, tense, n, p)}`;

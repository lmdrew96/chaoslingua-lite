// Ending-only decode (processing instruction / structured input, after VanPatten).
// Learners default to "first noun = doer"; these sentences put the nouns in orders
// where that strategy fails, so only the nom/acc endings reveal who does what.
//
// Every word is a verified form: nominatives and accusatives straight from the
// Suburani vocab lists (Book 1 lists nom + acc), verbs from src/data/verbs.ts.
// Neuters are excluded (nom = acc, so the ending can't decide), and both nouns are
// animate so either could plausibly be the subject.

import { ordinal, type Declension } from '../data/nouns';
import { DECODE_VERBS, type DecodeVerb } from '../data/verbs';
import { drillableNouns, type VocabEntry } from '../data/vocab';
import { pick, shuffle } from '../lib/random';
import type { DrillContext, DrillType, McDrill } from './types';

// Accusative singular endings by declension — every eligible noun's listed
// accusative is checked against these before use.
const ACC_ENDING: Record<Declension, string> = { 1: 'am', 2: 'um', 3: 'em', 4: 'um', 5: 'em' };

// Where the verb goes; the two nouns fill the other slots in order.
const LAYOUTS = [
  ['N', 'N', 'V'],
  ['N', 'V', 'N'],
  ['V', 'N', 'N'],
] as const;

const english = (v: VocabEntry): string => v.en.split(',')[0].trim();

const eligible = (ctx: DrillContext): VocabEntry[] =>
  drillableNouns(ctx.chapters, ctx.declensions).filter(
    (v) =>
      v.animate &&
      v.gender !== 'n' &&
      !v.pluralOnly &&
      v.principalCase === 'acc' &&
      v.principal &&
      v.declension &&
      v.principal.endsWith(ACC_ENDING[v.declension]),
  );

// Two nouns with different English, from different declensions whenever the gates
// allow it, so every sentence mixes endings.
const pickPair = (nouns: VocabEntry[]): [VocabEntry, VocabEntry] | null => {
  const pairs: Array<[VocabEntry, VocabEntry]> = [];
  for (const a of nouns) for (const b of nouns) if (a !== b && english(a) !== english(b)) pairs.push([a, b]);
  if (!pairs.length) return null;
  const mixed = pairs.filter(([a, b]) => a.declension !== b.declension);
  return pick(mixed.length ? mixed : pairs);
};

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const build = (
  layout: (typeof LAYOUTS)[number],
  first: VocabEntry,
  second: VocabEntry,
  firstIsSubject: boolean,
  verb: DecodeVerb,
): McDrill => {
  const subject = firstIsSubject ? first : second;
  const object = firstIsSubject ? second : first;
  const nouns = [first, second];
  const words = layout.map((slot) => {
    if (slot === 'V') return verb.la;
    const noun = nouns.shift()!;
    return noun === subject ? noun.la : noun.principal!;
  });

  const answer = `The ${english(subject)} ${verb.en} the ${english(object)}.`;
  const flipped = `The ${english(object)} ${verb.en} the ${english(subject)}.`;
  const accEnding = ACC_ENDING[object.declension!];

  return {
    kind: 'mc',
    type: 'decode',
    label: 'Decode',
    prompt: `<span class="latin">${capitalize(words.join(' '))}.</span><div class="prompt-hint">Who’s doing what? Go by the endings, not the order.</div>`,
    options: shuffle([answer, flipped]),
    answer,
    explanation: `${object.principal} ends in -${accEnding}, the ${ordinal(object.declension!)}-declension accusative, so the ${english(object)} is receiving the action. ${subject.la} is nominative, so the ${english(subject)} is doing it.`,
    meta: { chapter: Math.max(subject.chapter, object.chapter, verb.chapter) },
  };
};

// The minimal-pair partner of the last sentence: same words in the same positions,
// with the endings swapped. Served as the very next decode drill.
let queued: McDrill | null = null;

const makeDecode = (ctx: DrillContext): McDrill | null => {
  const verbs = DECODE_VERBS.filter((v) => ctx.chapters.has(v.chapter));
  const pair = pickPair(eligible(ctx));
  if (!verbs.length || !pair) return null;

  const [first, second] = pair;
  const layout = pick([...LAYOUTS]);
  const verb = pick(verbs);
  // Lead with the object-first version — the one "first noun = doer" gets wrong.
  queued = build(layout, first, second, true, verb);
  return build(layout, first, second, false, verb);
};

const takeQueued = (): McDrill | null => {
  const next = queued;
  queued = null;
  return next;
};

export const decodeDrill: DrillType = { type: 'decode', label: 'Decode', make: makeDecode, takeQueued };

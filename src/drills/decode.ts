// Ending-only decode (processing instruction / structured input, after VanPatten).
// Learners default to "first noun = doer"; these sentences put the nouns in orders
// where that strategy fails, so only the endings reveal who does what.
//
// Three tiers, each served as a minimal pair (same words, same positions, endings
// swapped):
//   - nom/acc: who does it to whom.
//   - dative: who gives the thing to whom.
//   - ablative with a preposition: who does it with / away from whom.
//
// Every word is a verified form. The nom/acc tier uses the nominatives and
// accusatives straight from the Suburani vocab lists (Book 1 lists nom + acc); the
// dative and ablative tiers take their forms from sourced paradigms only (textbook
// model nouns, or reviewed Wiktionary imports — see forms.ts). Verbs come from
// src/data/verbs.ts. Both people in a sentence are animate so either could plausibly
// be the doer.

import { ordinal, type Declension } from '../data/nouns';
import { DATIVE_VERBS, DECODE_VERBS, PREP_VERBS, type DecodeVerb, type PrepVerb } from '../data/verbs';
import { drillableNouns, type VocabEntry } from '../data/vocab';
import { pick, shuffle } from '../lib/random';
import { capitalize, english, giveables, people, type Sourced } from './forms';
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
const pickPair = <T extends VocabEntry>(nouns: T[]): [T, T] | null => {
  const pairs: Array<[T, T]> = [];
  for (const a of nouns) for (const b of nouns) if (a !== b && english(a) !== english(b)) pairs.push([a, b]);
  if (!pairs.length) return null;
  const mixed = pairs.filter(([a, b]) => a.declension !== b.declension);
  return pick(mixed.length ? mixed : pairs);
};

const prompt = (words: string[], hint: string): string =>
  `<span class="latin">${capitalize(words.join(' '))}.</span><div class="prompt-hint">${hint}</div>`;

// --- Tier 1: nominative vs accusative -------------------------------------------

const buildNomAcc = (
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
    prompt: prompt(words, 'Who’s doing what? Go by the endings, not the order.'),
    options: shuffle([answer, flipped]),
    answer,
    explanation: `${object.principal} ends in -${accEnding}, the ${ordinal(object.declension!)}-declension accusative, so the ${english(object)} is receiving the action. ${subject.la} is nominative, so the ${english(subject)} is doing it.`,
    meta: { chapter: Math.max(subject.chapter, object.chapter, verb.chapter), case: 'acc' },
  };
};

const makeNomAcc = (ctx: DrillContext): [McDrill, McDrill] | null => {
  const verbs = DECODE_VERBS.filter((v) => ctx.chapters.has(v.chapter));
  const pair = pickPair(eligible(ctx));
  if (!verbs.length || !pair) return null;

  const [first, second] = pair;
  const layout = pick([...LAYOUTS]);
  const verb = pick(verbs);
  // Lead with the object-first version — the one "first noun = doer" gets wrong.
  return [buildNomAcc(layout, first, second, false, verb), buildNomAcc(layout, first, second, true, verb)];
};

// --- Tier 2: dative -------------------------------------------------------------

// Where each word goes: 1 and 2 are the two people (one nominative, one dative), A the
// thing, V the verb. Each puts person 1 first among the people, and the pair leads
// with person 1 as the recipient, so "first noun = giver" fails. Dative-first is
// Suburani's own example of a sentence opening on the dative.
const DATIVE_LAYOUTS = [
  ['1', '2', 'A', 'V'],
  ['1', 'A', '2', 'V'],
  ['A', '1', '2', 'V'],
  ['1', '2', 'V', 'A'],
] as const;

const buildDative = (
  layout: (typeof DATIVE_LAYOUTS)[number],
  one: Sourced,
  two: Sourced,
  oneIsGiver: boolean,
  thing: Sourced,
  verb: DecodeVerb,
): McDrill => {
  const giver = oneIsGiver ? one : two;
  const recipient = oneIsGiver ? two : one;
  const words = layout.map((slot) => {
    if (slot === 'V') return verb.la;
    if (slot === 'A') return thing.forms.sg.acc;
    const person = slot === '1' ? one : two;
    return person === giver ? person.forms.sg.nom : person.forms.sg.dat;
  });

  const answer = `The ${english(giver)} ${verb.en} the ${english(thing)} to the ${english(recipient)}.`;
  const flipped = `The ${english(recipient)} ${verb.en} the ${english(thing)} to the ${english(giver)}.`;

  return {
    kind: 'mc',
    type: 'decode',
    label: 'Decode',
    prompt: prompt(words, 'Who’s giving to whom? Go by the endings, not the order.'),
    options: shuffle([answer, flipped]),
    answer,
    explanation: `${recipient.forms.sg.dat} is the dative singular of ${recipient.la} — “to/for the ${english(recipient)}” — so the ${english(recipient)} is on the receiving end. ${giver.forms.sg.nom} is nominative, so the ${english(giver)} is doing it. ${thing.forms.sg.acc} is the accusative: the thing being passed along.`,
    meta: { chapter: Math.max(giver.chapter, recipient.chapter, thing.chapter, verb.chapter), case: 'dat' },
  };
};

const makeDative = (ctx: DrillContext): [McDrill, McDrill] | null => {
  const verbs = DATIVE_VERBS.filter((v) => ctx.chapters.has(v.chapter));
  const pair = pickPair(people(ctx, 'dat'));
  const things = giveables(ctx);
  if (!verbs.length || !pair || !things.length) return null;

  const [one, two] = pair;
  const layout = pick([...DATIVE_LAYOUTS]);
  const thing = pick(things);
  const verb = pick(verbs);
  return [buildDative(layout, one, two, false, thing, verb), buildDative(layout, one, two, true, thing, verb)];
};

// --- Tier 3: ablative with a preposition ----------------------------------------

const PREP_CHAPTER: Record<PrepVerb['prep'], number> = { cum: 3, ab: 6 };
const PREP_EN: Record<PrepVerb['prep'], string> = { cum: 'with', ab: 'away from' };

// ā before a consonant, ab before a vowel or h — Suburani lists both (ā, ab + abl.).
const prepWord = (prep: PrepVerb['prep'], abl: string): string => {
  if (prep === 'cum') return 'cum';
  return /^[aeiouh]/i.test(abl.normalize('NFD')) ? 'ab' : 'ā';
};

// The two people keep their positions; the preposition moves to whichever of them is
// ablative. The pair leads with the first person inside the phrase ("cum amīcō
// puella ambulat"), where "first noun = doer" fails.
const ABLATIVE_LAYOUTS = [
  ['1', '2', 'V'],
  ['1', 'V', '2'],
] as const;

const buildAblative = (
  layout: (typeof ABLATIVE_LAYOUTS)[number],
  one: Sourced,
  two: Sourced,
  oneIsDoer: boolean,
  verb: PrepVerb,
): McDrill => {
  const doer = oneIsDoer ? one : two;
  const other = oneIsDoer ? two : one;
  const prep = prepWord(verb.prep, other.forms.sg.abl);
  const words = layout.map((slot) => {
    if (slot === 'V') return verb.la;
    const person = slot === '1' ? one : two;
    return person === doer ? person.forms.sg.nom : `${prep} ${person.forms.sg.abl}`;
  });

  const answer = `The ${english(doer)} ${verb.en} ${PREP_EN[verb.prep]} the ${english(other)}.`;
  const flipped = `The ${english(other)} ${verb.en} ${PREP_EN[verb.prep]} the ${english(doer)}.`;

  return {
    kind: 'mc',
    type: 'decode',
    label: 'Decode',
    prompt: prompt(words, 'Who’s doing it? Go by the endings, not the order.'),
    options: shuffle([answer, flipped]),
    answer,
    explanation: `${prep} takes the ablative, and ${other.forms.sg.abl} is the ablative singular of ${other.la}, so ${prep} ${other.forms.sg.abl} means “${PREP_EN[verb.prep]} the ${english(other)}.” ${doer.forms.sg.nom} is nominative, so the ${english(doer)} is the one doing it.`,
    meta: { chapter: Math.max(doer.chapter, other.chapter, verb.chapter, PREP_CHAPTER[verb.prep]), case: 'abl' },
  };
};

const makeAblative = (ctx: DrillContext): [McDrill, McDrill] | null => {
  const verbs = PREP_VERBS.filter((v) => ctx.chapters.has(v.chapter) && ctx.chapters.has(PREP_CHAPTER[v.prep]));
  const pair = pickPair(people(ctx, 'abl'));
  if (!verbs.length || !pair) return null;

  const [one, two] = pair;
  const layout = pick([...ABLATIVE_LAYOUTS]);
  const verb = pick(verbs);
  return [buildAblative(layout, one, two, false, verb), buildAblative(layout, one, two, true, verb)];
};

// --- Drill type -----------------------------------------------------------------

// The minimal-pair partner of the last sentence, served as the very next decode drill.
let queued: McDrill | null = null;

// A random tier each time, falling through to any other tier the gates allow.
const makeDecode = (ctx: DrillContext): McDrill | null => {
  for (const tier of shuffle([makeNomAcc, makeDative, makeAblative])) {
    const pair = tier(ctx);
    if (!pair) continue;
    queued = pair[1];
    return pair[0];
  }
  return null;
};

const takeQueued = (): McDrill | null => {
  const next = queued;
  queued = null;
  return next;
};

export const decodeDrill: DrillType = { type: 'decode', label: 'Decode', make: makeDecode, takeQueued };

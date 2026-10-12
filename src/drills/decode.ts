// Ending-only decode (processing instruction / structured input, after VanPatten).
// Learners default to "first noun = doer"; these sentences put the nouns in orders
// where that strategy fails, so only the endings reveal who does what.
//
// Four tiers, each served as a minimal pair (same words, same positions, endings
// swapped):
//   - nom/acc: who does it to whom.
//   - dative: who gives the thing to whom.
//   - ablative with a preposition: who does it with / away from whom.
//   - route: where someone goes, out of one place (ē/ex + abl) into another
//     (in + acc). ē/ex always takes the ablative, so here the lesson is reading
//     preposition + case as a unit, in + acc = into, and not assuming the first
//     place named is where the motion starts.
//
// Every word is a verified form. The nom/acc tier uses the nominatives and
// accusatives straight from the Suburani vocab lists (Book 1 lists nom + acc); the
// dative and ablative tiers take their forms from sourced paradigms only (textbook
// model nouns, or reviewed Wiktionary imports — see forms.ts). Verb forms come from
// the verb's sourced table, in any open tense; verbs.ts only lists which verbs fit
// which frame. Both people in a sentence are animate so either could plausibly be
// the doer.
//
// The nom/acc tier also makes plural-subject pairs, where the verb's -t / -nt has to
// agree with the subject. The plural noun must not look like a genitive singular
// (servī, puellae could be "the slave's", "the girl's"), which in practice leaves
// 3rd-declension people — whose nominative and accusative plural are the same, so
// only the verb's number tells you who's doing it.

import { ENGLISH_PLURALS } from '../data/englishPlurals';
import { ordinal, type Declension, type GNumber } from '../data/nouns';
import { DATIVE_VERBS, DECODE_VERBS, PREP_VERBS, ROUTE_VERBS, tenseNames, type PrepVerb } from '../data/verbs';
import { drillableNouns, type VocabEntry } from '../data/vocab';
import { pick, shuffle } from '../lib/random';
import {
  capitalize,
  english,
  giveables,
  people,
  pickVerb,
  places,
  sourcedForms,
  verbEn,
  verbForm,
  type Sourced,
  type VerbChoice,
} from './forms';
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

// One noun in a role, in the number the sentence uses.
interface Actor {
  noun: VocabEntry;
  number: GNumber;
  nom: string;
  acc: string;
  en: string;
}

// Singular, from the vocab list's own nominative + accusative.
const singular = (v: VocabEntry): Actor => ({ noun: v, number: 'sg', nom: v.la, acc: v.principal!, en: english(v) });

const plural = (v: Sourced): Actor => ({ noun: v, number: 'pl', nom: v.forms.pl.nom, acc: v.forms.pl.acc, en: ENGLISH_PLURALS[v.id] });

// People who can be plural without looking like a genitive singular, and who have a
// hand-written English plural.
const pluralPeople = (ctx: DrillContext): Sourced[] =>
  people(ctx, 'acc').filter(
    (v) => ENGLISH_PLURALS[v.id] && v.forms.pl.nom !== v.forms.sg.gen && v.forms.pl.acc !== v.forms.sg.gen,
  );

const numberWord = (n: GNumber): string => (n === 'sg' ? 'singular' : 'plural');

const buildNomAcc = (
  layout: (typeof LAYOUTS)[number],
  first: Actor,
  second: Actor,
  firstIsSubject: boolean,
  verb: VerbChoice,
): McDrill => {
  const subject = firstIsSubject ? first : second;
  const object = firstIsSubject ? second : first;
  const actors = [first, second];
  const words = layout.map((slot) => {
    if (slot === 'V') return verbForm(verb, subject.number);
    const actor = actors.shift()!;
    return actor === subject ? actor.nom : actor.acc;
  });

  const sentence = (doer: Actor, done: Actor) => `The ${doer.en} ${verbEn(verb, doer.number)} the ${done.en}.`;
  const answer = sentence(subject, object);
  const flipped = sentence(object, subject);
  const tense = verb.tense === 'pres' ? '' : ` (${tenseNames[verb.tense]})`;

  const doing = subject.number === 'sg' ? 'is doing it' : 'are doing it';
  const looksAlike =
    subject.number === 'pl' && subject.nom === subject.acc
      ? ` (${subject.nom} could be nominative or accusative plural on its own — the verb’s ending settles it.)`
      : object.number === 'pl' && object.nom === object.acc
        ? ` (${object.acc} could be nominative or accusative plural on its own — but the verb is singular, so it can’t be the subject.)`
        : '';
  const explanation =
    first.number === second.number
      ? `${object.acc} ends in -${ACC_ENDING[object.noun.declension!]}, the ${ordinal(object.noun.declension!)}-declension accusative, so the ${object.en} is receiving the action. ${subject.nom} is nominative, so the ${subject.en} ${doing}.`
      : `${verbForm(verb, subject.number)}${tense} ends in -${subject.number === 'sg' ? 't' : 'nt'}, so its subject is ${numberWord(subject.number)}: ${subject.nom}, the nominative ${numberWord(subject.number)} — the ${subject.en} ${doing}. ${object.acc} is the accusative ${numberWord(object.number)}, receiving the action.${looksAlike}`;

  return {
    kind: 'mc',
    type: 'decode',
    label: 'Decode',
    prompt: prompt(words, 'Who’s doing what? Go by the endings, not the order.'),
    options: shuffle([answer, flipped]),
    answer,
    explanation,
    meta: { chapter: Math.max(subject.noun.chapter, object.noun.chapter, verb.role.chapter), case: 'acc' },
  };
};

const makeNomAcc = (ctx: DrillContext): [McDrill, McDrill] | null => {
  const verb = pickVerb(ctx, DECODE_VERBS);
  if (!verb) return null;
  const layout = pick([...LAYOUTS]);

  // Half the time, if anyone can be plural: one singular noun and one plural one.
  // Each version of the pair has a different subject, so the verb's number flips too.
  const plurals = pluralPeople(ctx);
  if (plurals.length && Math.random() < 0.5) {
    const many = pick(plurals);
    // The singular noun mustn't look like a genitive either: with iuvenis (nom = gen)
    // "frātrēs laudābat iuvenis" could be "he was praising the young man's brothers".
    const ones = eligible(ctx).filter(
      (v) => v.id !== many.id && english(v) !== english(many) && sourcedForms(v)?.sg.gen !== v.la,
    );
    if (ones.length) {
      const pair = shuffle([singular(pick(ones)), plural(many)]) as [Actor, Actor];
      return [buildNomAcc(layout, pair[0], pair[1], false, verb), buildNomAcc(layout, pair[0], pair[1], true, verb)];
    }
  }

  const pair = pickPair(eligible(ctx));
  if (!pair) return null;
  const [first, second] = [singular(pair[0]), singular(pair[1])];
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
  verb: VerbChoice,
): McDrill => {
  const giver = oneIsGiver ? one : two;
  const recipient = oneIsGiver ? two : one;
  const words = layout.map((slot) => {
    if (slot === 'V') return verbForm(verb, 'sg');
    if (slot === 'A') return thing.forms.sg.acc;
    const person = slot === '1' ? one : two;
    return person === giver ? person.forms.sg.nom : person.forms.sg.dat;
  });

  const answer = `The ${english(giver)} ${verbEn(verb, 'sg')} the ${english(thing)} to the ${english(recipient)}.`;
  const flipped = `The ${english(recipient)} ${verbEn(verb, 'sg')} the ${english(thing)} to the ${english(giver)}.`;

  return {
    kind: 'mc',
    type: 'decode',
    label: 'Decode',
    prompt: prompt(words, 'Who’s giving to whom? Go by the endings, not the order.'),
    options: shuffle([answer, flipped]),
    answer,
    explanation: `${recipient.forms.sg.dat} is the dative singular of ${recipient.la} — “to/for the ${english(recipient)}” — so the ${english(recipient)} is on the receiving end. ${giver.forms.sg.nom} is nominative, so the ${english(giver)} is doing it. ${thing.forms.sg.acc} is the accusative: the thing being passed along.`,
    meta: { chapter: Math.max(giver.chapter, recipient.chapter, thing.chapter, verb.role.chapter), case: 'dat' },
  };
};

const makeDative = (ctx: DrillContext): [McDrill, McDrill] | null => {
  const verb = pickVerb(ctx, DATIVE_VERBS);
  const pair = pickPair(people(ctx, 'dat'));
  const things = giveables(ctx);
  if (!verb || !pair || !things.length) return null;

  const [one, two] = pair;
  const layout = pick([...DATIVE_LAYOUTS]);
  const thing = pick(things);
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
  verb: VerbChoice<PrepVerb>,
): McDrill => {
  const doer = oneIsDoer ? one : two;
  const other = oneIsDoer ? two : one;
  const prep = prepWord(verb.role.prep, other.forms.sg.abl);
  const words = layout.map((slot) => {
    if (slot === 'V') return verbForm(verb, 'sg');
    const person = slot === '1' ? one : two;
    return person === doer ? person.forms.sg.nom : `${prep} ${person.forms.sg.abl}`;
  });

  const answer = `The ${english(doer)} ${verbEn(verb, 'sg')} ${PREP_EN[verb.role.prep]} the ${english(other)}.`;
  const flipped = `The ${english(other)} ${verbEn(verb, 'sg')} ${PREP_EN[verb.role.prep]} the ${english(doer)}.`;

  return {
    kind: 'mc',
    type: 'decode',
    label: 'Decode',
    prompt: prompt(words, 'Who’s doing it? Go by the endings, not the order.'),
    options: shuffle([answer, flipped]),
    answer,
    explanation: `${prep} takes the ablative, and ${other.forms.sg.abl} is the ablative singular of ${other.la}, so ${prep} ${other.forms.sg.abl} means “${PREP_EN[verb.role.prep]} the ${english(other)}.” ${doer.forms.sg.nom} is nominative, so the ${english(doer)} is the one doing it.`,
    meta: { chapter: Math.max(doer.chapter, other.chapter, verb.role.chapter, PREP_CHAPTER[verb.role.prep]), case: 'abl' },
  };
};

const makeAblative = (ctx: DrillContext): [McDrill, McDrill] | null => {
  const verb = pickVerb(
    ctx,
    PREP_VERBS.filter((v) => ctx.chapters.has(PREP_CHAPTER[v.prep])),
  );
  const pair = pickPair(people(ctx, 'abl'));
  if (!verb || !pair) return null;

  const [one, two] = pair;
  const layout = pick([...ABLATIVE_LAYOUTS]);
  return [buildAblative(layout, one, two, false, verb), buildAblative(layout, one, two, true, verb)];
};

// --- Tier 4: route (ē/ex + ablative → in + accusative) --------------------------

// Both ē/ex + abl. and in + acc. are ch.6 vocab.
const ROUTE_CHAPTER = 6;

// ex before a vowel or h, ē before a consonant — the same rule as ā/ab.
const exWord = (abl: string): string => (/^[aeiouh]/i.test(abl.normalize('NFD')) ? 'ex' : 'ē');

// 1 and 2 are the two places, M the mover, V the verb. The places keep their positions
// and the prepositions move with the cases. The pair leads with place 1 as the
// destination, so "the first place named is where they start" fails.
const ROUTE_LAYOUTS = [
  ['1', '2', 'M', 'V'],
  ['M', '1', '2', 'V'],
  ['1', 'M', '2', 'V'],
] as const;

const buildRoute = (
  layout: (typeof ROUTE_LAYOUTS)[number],
  one: Sourced,
  two: Sourced,
  oneIsSource: boolean,
  mover: Sourced,
  verb: VerbChoice,
): McDrill => {
  const source = oneIsSource ? one : two;
  const destination = oneIsSource ? two : one;
  const ex = exWord(source.forms.sg.abl);
  const words = layout.map((slot) => {
    if (slot === 'V') return verbForm(verb, 'sg');
    if (slot === 'M') return mover.forms.sg.nom;
    const place = slot === '1' ? one : two;
    return place === source ? `${ex} ${place.forms.sg.abl}` : `in ${place.forms.sg.acc}`;
  });

  const route = (from: Sourced, to: Sourced) =>
    `The ${english(mover)} ${verbEn(verb, 'sg')} out of the ${english(from)} into the ${english(to)}.`;
  const answer = route(source, destination);

  return {
    kind: 'mc',
    type: 'decode',
    label: 'Decode',
    prompt: prompt(words, `Where is the ${english(mover)} going? Go by the endings, not the order.`),
    options: shuffle([answer, route(destination, source)]),
    answer,
    explanation: `${ex} takes the ablative: ${ex} ${source.forms.sg.abl} = “out of the ${english(source)}.” in + accusative means into: in ${destination.forms.sg.acc} = “into the ${english(destination)}” (in ${destination.forms.sg.abl}, ablative, would mean in the ${english(destination)}). Latin doesn’t have to name the starting point first.`,
    meta: { chapter: Math.max(mover.chapter, source.chapter, destination.chapter, verb.role.chapter, ROUTE_CHAPTER), case: 'abl' },
  };
};

const makeRoute = (ctx: DrillContext): [McDrill, McDrill] | null => {
  if (!ctx.chapters.has(ROUTE_CHAPTER)) return null;
  const verb = pickVerb(ctx, ROUTE_VERBS);
  const pair = pickPair(places(ctx));
  const movers = people(ctx, 'acc');
  if (!verb || !pair || !movers.length) return null;

  const [one, two] = pair;
  const layout = pick([...ROUTE_LAYOUTS]);
  const mover = pick(movers);
  return [buildRoute(layout, one, two, false, mover, verb), buildRoute(layout, one, two, true, mover, verb)];
};

// --- Drill type -----------------------------------------------------------------

// The minimal-pair partner of the last sentence, served as the very next decode drill.
let queued: McDrill | null = null;

// A random tier each time, falling through to any other tier the gates allow.
const makeDecode = (ctx: DrillContext): McDrill | null => {
  for (const tier of shuffle([makeNomAcc, makeDative, makeAblative, makeRoute])) {
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

export const decodeDrill: DrillType = {
  type: 'decode', label: 'Decode',
  description: 'Read a short sentence and work out who does what from the endings, not the word order.',
  make: makeDecode,
  takeQueued
};

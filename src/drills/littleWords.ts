// Module 4 drills: prepositions, conjunctions, adverbs, and parts of speech. All four
// stay off until the "Little words" topic opens (2026-10-21, or toggled on early).

import { openAdverbPairs, openPrepositions, type PrepSense, type Preposition } from '../data/littleWords';
import { caseNames } from '../data/nouns';
import { vocab, type PartOfSpeech, type VocabEntry } from '../data/vocab';
import { pick, shuffle } from '../lib/random';
import type { DrillContext, DrillType, McDrill } from './types';

const open = (ctx: DrillContext): boolean => ctx.topics.has('little-words');

// ── Preposition → case + meaning ─────────────────────────────────────────────

const caseLabel = (c: PrepSense['case']): string => (c === 'either' ? 'accusative or ablative' : caseNames[c]);
const flip = (c: PrepSense['case']): PrepSense['case'] => (c === 'acc' ? 'abl' : c === 'abl' ? 'acc' : 'acc');

// "accusative — into, onto · ablative — in, on"
const describe = (senses: PrepSense[]): string => senses.map((s) => `${caseLabel(s.case)} — ${s.en}`).join(' · ');

// The same meanings with the cases swapped: in's two senses crossed over, or a
// one-case preposition with the other case.
const wrongCase = (p: Preposition): string =>
  p.senses.length > 1
    ? describe(p.senses.map((s, i) => ({ ...s, en: p.senses[(i + 1) % p.senses.length].en })))
    : describe([{ ...p.senses[0], case: flip(p.senses[0].case) }]);

let lastPrep: string | null = null;

const makePreposition = (ctx: DrillContext): McDrill | null => {
  if (!open(ctx)) return null;
  const preps = openPrepositions(ctx.chapters);
  if (preps.length < 3) return null;
  const choices = preps.length > 1 ? preps.filter((p) => p.la !== lastPrep) : preps;
  const prep = pick(choices);
  lastPrep = prep.la;
  const answer = describe(prep.senses);
  const others = shuffle(preps.filter((p) => p !== prep)).map((p) => describe(p.senses));
  const options = [...new Set([answer, wrongCase(prep), ...others])].slice(0, 4);
  return {
    kind: 'mc',
    type: 'preposition',
    label: 'Prepositions',
    prompt: `Which case follows <span class="latin">${prep.la}</span>, and what does it mean?`,
    options: shuffle(options),
    answer,
    explanation:
      prep.senses.length > 1
        ? `${prep.la} changes meaning with the case: ${describe(prep.senses)}. Motion into somewhere takes the accusative; position takes the ablative.`
        : `${prep.la} + ${caseLabel(prep.senses[0].case)}: ${prep.senses[0].en}.`,
    meta: { chapter: Math.min(...prep.senses.map((s) => s.chapter)) },
  };
};

export const prepositionDrill: DrillType = { type: 'preposition', label: 'Prepositions', make: makePreposition };

// ── Little-word meanings ─────────────────────────────────────────────────────

const LITTLE: PartOfSpeech[] = ['Conjunction', 'Adverb'];

// Conjunctions and adverbs of open chapters, skipping subjunctive-only senses (not in
// LATN 101) and repeats of the same headword.
const littleWords = (ctx: DrillContext): VocabEntry[] => {
  const seen = new Set<string>();
  return vocab.filter((v) => {
    if (!LITTLE.includes(v.pos) || !ctx.chapters.has(v.chapter) || /subj\./.test(v.la + v.en)) return false;
    const key = v.la.replace(/[?!]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const senses = (en: string): string[] => en.split(/[,;]/).map((s) => s.trim().toLowerCase());

let lastLittle: string | null = null;

const makeLittleWord = (ctx: DrillContext): McDrill | null => {
  if (!open(ctx)) return null;
  const words = littleWords(ctx);
  if (words.length < 4) return null;
  const word = pick(words.length > 1 ? words.filter((w) => w.id !== lastLittle) : words);
  lastLittle = word.id;
  // Same part of speech first, so "and" competes with "but", not with "suddenly".
  const others = [...shuffle(words.filter((w) => w.pos === word.pos)), ...shuffle(words.filter((w) => w.pos !== word.pos))]
    .map((w) => w.en)
    // Drop anything sharing a sense with the answer: nunc "now" vs iam "now, already".
    .filter((en) => !senses(en).some((s) => senses(word.en).includes(s)));
  return {
    kind: 'mc',
    type: 'little-words',
    label: 'Little words',
    prompt: `What does <span class="latin">${word.la}</span> mean?`,
    options: shuffle([word.en, ...[...new Set(others)].slice(0, 3)]),
    answer: word.en,
    explanation: `${word.la} is ${word.pos === 'Adverb' ? 'an adverb' : 'a conjunction'}: ${word.en} (ch.${word.chapter}).`,
    meta: { chapter: word.chapter },
  };
};

export const littleWordDrill: DrillType = { type: 'little-words', label: 'Little words', make: makeLittleWord };

// ── Part of speech ───────────────────────────────────────────────────────────

const POS_ORDER: PartOfSpeech[] = ['Noun', 'Verb', 'Adjective', 'Pronoun', 'Adverb', 'Preposition', 'Conjunction'];
const posLabel = (p: PartOfSpeech): string => p.toLowerCase();

// The headword as a test would show it: "portō, portāre" → portō; "in + acc." → in.
const headword = (v: VocabEntry): string => v.la.split(',')[0].replace(/\s*\+.*$/, '').trim();

// Headwords listed under more than one part of speech (cum: preposition and
// conjunction; adeō: verb and adverb) can't be answered from the word alone.
const ambiguous = (() => {
  const posBy = new Map<string, Set<PartOfSpeech>>();
  for (const v of vocab) posBy.set(headword(v), (posBy.get(headword(v)) ?? new Set()).add(v.pos));
  return new Set([...posBy].filter(([, s]) => s.size > 1).map(([h]) => h));
})();

let lastPos: string | null = null;

const makePartOfSpeech = (ctx: DrillContext): McDrill | null => {
  if (!open(ctx)) return null;
  const words = vocab.filter((v) => ctx.chapters.has(v.chapter) && !ambiguous.has(headword(v)));
  if (!words.length) return null;
  // Part of speech first, so the many nouns don't crowd out the few conjunctions.
  const present = POS_ORDER.filter((p) => words.some((w) => w.pos === p));
  const pos = pick(present);
  const pool = words.filter((w) => w.pos === pos && w.id !== lastPos);
  const word = pick(pool.length ? pool : words.filter((w) => w.pos === pos));
  lastPos = word.id;
  return {
    kind: 'mc',
    type: 'part-of-speech',
    label: 'Part of speech',
    prompt: `What part of speech is <span class="latin">${headword(word)}</span>?`,
    options: POS_ORDER.map(posLabel),
    answer: posLabel(word.pos),
    explanation: `${word.la} — “${word.en}” — is listed as ${/^[AEIOU]/.test(word.pos) ? 'an' : 'a'} ${posLabel(word.pos)} (ch.${word.chapter}).`,
    meta: { chapter: word.chapter },
  };
};

export const partOfSpeechDrill: DrillType = { type: 'part-of-speech', label: 'Part of speech', make: makePartOfSpeech };

// ── Adjective → adverb ───────────────────────────────────────────────────────

let lastAdverb: string | null = null;

const makeAdverb = (ctx: DrillContext): McDrill | null => {
  if (!open(ctx)) return null;
  const pairs = openAdverbPairs(ctx.chapters);
  if (!pairs.length) return null;
  const pair = pick(pairs.length > 1 ? pairs.filter((p) => p.adv !== lastAdverb) : pairs);
  lastAdverb = pair.adv;
  const why =
    pair.pattern === 'exception'
      ? `${pair.adv} doesn't follow the pattern (it would have been ${pair.wrong}), so it has to be learned on its own.`
      : `${pair.adj} is a ${pair.pattern.split(' →')[0]}-declension adjective, so its adverb ends ${pair.pattern.split('→ ')[1]}.`;
  return {
    kind: 'mc',
    type: 'adverb',
    label: 'Adverbs',
    prompt: `<span class="latin">${pair.adj}</span> means “${pair.adjEn}”. Which is the adverb, “${pair.advEn}”?`,
    options: shuffle([pair.adv, pair.wrong, pair.adj]),
    answer: pair.adv,
    explanation: `${why} 1st/2nd-declension adjectives make adverbs in -ē (laetus → laetē), 3rd-declension ones in -iter (celer → celeriter).`,
    meta: pair.chapter ? { chapter: pair.chapter } : {},
  };
};

export const adverbDrill: DrillType = { type: 'adverb', label: 'Adverbs', make: makeAdverb };

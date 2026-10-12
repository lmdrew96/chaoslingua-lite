// Module 5: given a verb's 1st and 2nd principal parts, pick the 3rd (laudō → laudāvī,
// capiō → cēpī). Opens with the perfect tense. The answer is the verb's sourced perfect;
// the distractors are the other perfect patterns built on its present stem, so they
// are deliberately wrong and never shown as real forms.

import { englishFor } from '../data/englishVerbs';
import { drillableVerbs, lemmaOf, type DrillVerb } from '../data/verbs';
import { pick, shuffle } from '../lib/random';
import type { DrillContext, DrillType, McDrill } from './types';

const OPTIONS = 4;
const VOWEL = /[aeiouāēīōū]/;
const LONG: Record<string, string> = { a: 'ā', e: 'ē', i: 'ī', o: 'ō', u: 'ū' };

const strip = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '');

// laudō → laud, teneō → ten, audiō / capiō → aud / cap.
const presentStem = (lemma: string): string => lemma.replace(/[ei]?ō$/, '');

// The perfect patterns class meets: -āvī, -īvī, -uī, -sī (c/g + s → x), reduplicated
// (cecidī), and a lengthened stem vowel (vēnī).
const patterns = (stem: string): string[] => {
  const out = [`${stem}āvī`, `${stem}īvī`, `${stem}uī`];
  if (/(c|g|qu)$/.test(stem)) out.push(`${stem.replace(/(c|g|qu)$/, '')}xī`);
  else if (/[dt]+$/.test(stem)) out.push(`${stem.replace(/[dt]+$/, '')}sī`);
  else out.push(`${stem}sī`);
  if (!VOWEL.test(stem[0])) out.push(`${stem[0]}e${stem}ī`);
  // The root vowel is the last one: vēn-, lēg-, intellēg-.
  const v = stem.search(/[aeiou](?=[^aeiouāēīōū]*$)/);
  if (v >= 0 && !VOWEL.test(stem[v - 1] ?? '')) out.push(`${stem.slice(0, v)}${LONG[stem[v]]}${stem.slice(v + 1)}ī`);
  return out;
};

const pool = (ctx: DrillContext): DrillVerb[] =>
  ctx.tenses.has('perf')
    ? drillableVerbs(ctx.chapters, ctx.conjugations).filter(
        (v) => v.conjugation !== 'irr' && v.forms.perf && /ō$/.test(lemmaOf(v)),
      )
    : [];

let lastLemma: string | null = null;

const makePrincipalParts = (ctx: DrillContext): McDrill | null => {
  const verbs = pool(ctx);
  if (!verbs.length) return null;
  const choices = verbs.length > 1 ? verbs.filter((v) => lemmaOf(v) !== lastLemma) : verbs;
  const verb = pick(choices);
  const lemma = lemmaOf(verb);
  lastLemma = lemma;
  const answer = verb.forms.perf!.sg[1];
  // Skip any pattern that is the answer give or take a macron.
  const distractors = shuffle([...new Set(patterns(presentStem(lemma)))].filter((f) => strip(f) !== strip(answer)));
  if (distractors.length < OPTIONS - 1) return null;
  return {
    kind: 'mc',
    type: 'principal-parts',
    label: 'Principal parts',
    prompt: `<span class="latin">${lemma}, ${verb.infinitive}, ___</span> — which is the 3rd principal part, the perfect (“${englishFor(verb.gloss, 'perf', 'sg', 1)}”)?`,
    options: shuffle([answer, ...distractors.slice(0, OPTIONS - 1)]),
    answer,
    explanation: `${lemma}, ${verb.infinitive}, ${answer} — perfect stem ${answer.slice(0, -1)}-. The other choices follow the patterns of other verbs.`,
    meta: { ...(verb.chapter ? { chapter: verb.chapter } : {}), tense: 'perf', conjugation: String(verb.conjugation) },
  };
};

export const principalPartsDrill: DrillType = { type: 'principal-parts', label: 'Principal parts', make: makePrincipalParts };

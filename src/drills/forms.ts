// Sourced full paradigms for vocab nouns — the only place sentence drills get a
// dative, ablative, or genitive from. Endings are never applied by rule.

import { englishPredicate } from '../data/englishVerbs';
import { MODEL_NOUNS, type Case, type GNumber } from '../data/nouns';
import { IMPORTED_PARADIGMS } from '../data/paradigms.generated';
import { TENSES, drillableVerbs, lemmaOf, type DecodeVerb, type DrillVerb, type Tense } from '../data/verbs';
import { drillableNouns, type VocabEntry } from '../data/vocab';
import { pick } from '../lib/random';
import type { DrillContext } from './types';

export type Forms = Record<GNumber, Record<Case, string>>;

// The textbook table when the noun is a model noun (puella, amīcus, cīvis, …), else
// its Wiktionary import if that passed review. Null when neither exists.
export const sourcedForms = (v: VocabEntry): Forms | null => {
  const model = MODEL_NOUNS.find((n) => n.forms.sg.nom === v.la);
  if (model) return model.forms;
  const imported = IMPORTED_PARADIGMS[v.id];
  return imported && !imported.review ? imported.forms : null;
};

// The first listed English sense: "slave, enslaved person (male)" → "slave",
// "chief; emperor" → "chief".
export const english = (v: VocabEntry): string => v.en.split(/[,;]/)[0].trim();

export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// A vocab noun with its sourced paradigm attached.
export type Sourced = VocabEntry & { forms: Forms };

// Animate, singular-capable nouns with a sourced paradigm, where the case in question
// is spelled differently from the nominative (otherwise the ending can't decide).
// Datives must also differ from the genitive: puellae / diēī could just as well be
// "the girl's" / "the day's" hanging off the next noun (servus puellae = the girl's
// slave), so 1st- and 5th-declension people sit the dative out. Genitives likewise
// must differ from the nominative (cīvis) and the dative.
export const people = (ctx: DrillContext, c: 'acc' | 'dat' | 'abl' | 'gen'): Sourced[] =>
  drillableNouns(ctx.chapters, ctx.declensions).flatMap((v) => {
    if (!v.animate || v.pluralOnly) return [];
    const forms = sourcedForms(v);
    if (!forms || forms.sg.nom === forms.sg[c]) return [];
    if ((c === 'dat' || c === 'gen') && forms.sg.dat === forms.sg.gen) return [];
    return [{ ...v, forms }];
  });

// Things it makes sense to give, hand over, offer, or show. Keyed by vocab id.
const GIVEABLE = ['ch2-cibus', 'ch2-pecūnia', 'ch2-vīnum', 'ch3-gladius', 'ch4-dōnum', 'ch5-aqua', 'ch7-epistula', 'ch13-praemium'];

export const giveables = (ctx: DrillContext): Sourced[] =>
  drillableNouns(ctx.chapters, ctx.declensions).flatMap((v) => {
    const forms = GIVEABLE.includes(v.id) ? sourcedForms(v) : null;
    return forms ? [{ ...v, forms }] : [];
  });

// Places you can go out of and into. Keyed by vocab id; ch.1 īnsula rather than ch.7,
// whose first gloss is "island".
const PLACES = ['ch1-īnsula', 'ch2-forum', 'ch3-urbs', 'ch4-templum', 'ch7-silva', 'ch12-taberna', 'ch15-hortus', 'ch15-vīlla'];

export const places = (ctx: DrillContext): Sourced[] =>
  drillableNouns(ctx.chapters, ctx.declensions).flatMap((v) => {
    const forms = PLACES.includes(v.id) ? sourcedForms(v) : null;
    return forms && forms.sg.abl !== forms.sg.acc ? [{ ...v, forms }] : [];
  });

// Verbs for sentence drills: a verb from a role list (verbs.ts) with its sourced
// table, in a random open tense.
export interface VerbChoice<R extends DecodeVerb = DecodeVerb> {
  role: R;
  verb: DrillVerb;
  tense: Tense;
}

const openTenses = (ctx: DrillContext, verb: DrillVerb): Tense[] =>
  TENSES.filter((t) => ctx.tenses.has(t) && verb.forms[t]);

// A verb from the role list whose sourced table is in the pool, in a random open
// tense. Null when none qualifies (e.g. dō while its import awaits review).
export const pickVerb = <R extends DecodeVerb>(ctx: DrillContext, roles: R[]): VerbChoice<R> | null => {
  const pool = drillableVerbs(ctx.chapters, ctx.conjugations, ctx.perfectGates);
  const usable = roles.flatMap((role) => {
    if (!ctx.chapters.has(role.chapter)) return [];
    const verb = pool.find((v) => lemmaOf(v) === role.lemma);
    return verb && openTenses(ctx, verb).length ? [{ role, verb }] : [];
  });
  if (!usable.length) return null;
  const { role, verb } = pick(usable);
  return { role, verb, tense: pick(openTenses(ctx, verb)) };
};

// 3rd person, since every subject here is a noun.
export const verbForm = (v: VerbChoice, n: GNumber): string => v.verb.forms[v.tense]![n][3];
export const verbEn = (v: VerbChoice, n: GNumber): string => englishPredicate(v.role.en, v.tense, n, 3);

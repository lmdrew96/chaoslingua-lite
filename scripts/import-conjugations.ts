// Imports verb paradigms (present and perfect systems, active indicative) for the
// Suburani vocab from Wiktionary, via kaikki.org's per-word JSONL extracts,
// into src/data/conjugations.generated.ts. The sibling of import-paradigms.ts.
//
//   pnpm import-conjugations
//
// Rules (see ChaosPatch 76d527b2):
//   - Match on lemma (macron-insensitive), then the listed infinitive when the vocab
//     gives one, then the headword spelled exactly as Suburani spells it.
//   - Present system: first form listed per tense/person/number slot wins.
//   - Perfect system: the first form listed that is built on the perfect stem — the
//     3rd principal part minus -ī, from Suburani where it gives one (textbook tables,
//     ch.7+ vocab), else Wiktionary's first-listed perfect. That skips syncopated
//     alternatives (vocāstī) and picks eō's iistī over īstī, as Book 2 does.
//   - All 5 Suburani model verbs and 7 irregulars are round-tripped first. Any
//     mismatch with the textbook tables fails the run. The irregulars' perfect
//     tables come from here (Book 2 gives only two cells per tense), into
//     IRREGULAR_PERFECTS.
//   - A vocab verb's perfect system with no Suburani 3rd principal part to check it
//     against (ch.1–6), or one that disagrees with it, is imported but kept out of
//     drills until approved in paradigmReview.ts VERB_PERFECT_APPROVED.
//   - Nothing is dropped silently. Unmatched verbs are reported; irregulars, ch.1–4
//     verbs (listed without an infinitive, so the conjugation comes from Wiktionary
//     alone), and disagreements with the Suburani list are imported but kept out of
//     drills until approved in paradigmReview.ts VERB_APPROVED_FOR_DRILLS.
//   - Deponents and impersonals are left out: LATN 101 is active-indicative only.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NUMBERS, type GNumber } from '../src/data/nouns.ts';
import { VERB_APPROVED_FOR_DRILLS, VERB_FORM_OVERRIDES, VERB_PERFECT_APPROVED, VERB_SKIPS } from '../src/data/paradigmReview.ts';
import { vocab } from '../src/data/vocab.ts';
import {
  IRREGULAR_PERFECT_CELLS,
  IRREGULAR_VERBS,
  MODEL_VERBS,
  PERFECT_SYSTEM,
  PERSONS,
  conjugationLabel,
  lemmaOf,
  type Conjugation,
  type Person,
  type Tense,
  type TenseTable,
} from '../src/data/verbs.ts';

const PRESENT_SYSTEM = ['pres', 'impf', 'fut'] as const;
type PresentTense = (typeof PRESENT_SYSTEM)[number];
type Forms = Record<PresentTense, TenseTable>;
type PerfectForms = Partial<Record<Tense, TenseTable>>;
// Every form listed per slot, in Wiktionary's order.
type Candidates = Partial<Record<Tense, Partial<Record<GNumber, Partial<Record<Person, string[]>>>>>>;

interface KaikkiForm {
  form: string;
  tags?: string[];
}

interface KaikkiEntry {
  word: string;
  pos: string;
  forms?: KaikkiForm[];
  head_templates?: Array<{ expansion?: string }>;
}

const CONJ_WORDS: Record<string, Conjugation> = { first: 1, second: 2, third: 3, fourth: 4 };
const PERSON_TAGS: Record<string, Person> = { 'first-person': 1, 'second-person': 2, 'third-person': 3 };
const NUMBER_TAGS: Record<string, GNumber> = { singular: 'sg', plural: 'pl' };

const strip = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const urlFor = (lemma: string): string => {
  const w = lemma.normalize('NFD').replace(/\p{M}/gu, '');
  return `https://kaikki.org/dictionary/Latin/meaning/${encodeURIComponent(w[0])}/${encodeURIComponent(w.slice(0, 2))}/${encodeURIComponent(w)}.jsonl`;
};

const cache = new Map<string, Promise<KaikkiEntry[]>>();
const fetchEntries = (lemma: string): Promise<KaikkiEntry[]> => {
  const url = urlFor(lemma);
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then(async (res) => {
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
        return (await res.text())
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => JSON.parse(line) as KaikkiEntry);
      }),
    );
  }
  return cache.get(url)!;
};

// "vocō (present infinitive vocāre, perfect active vocāvī, supine vocātum); first conjugation"
const describe = (e: KaikkiEntry) => {
  const expansion = e.head_templates?.[0]?.expansion ?? '';
  // "third (-iō variant) conjugation" is Suburani's 3rd/4th. Suburani files ferō with
  // the irregulars; Wiktionary calls it "third conjugation, suppletive", as it does its
  // compounds (offerō, auferō) — while faciō is "third (-iō variant), suppletive".
  const m = expansion.match(/\b(first|second|third|fourth) (\(-iō variant\) )?conjugation/);
  const suppletive = /suppletive/.test(expansion);
  const conjugation: Conjugation | undefined =
    /irregular conjugation/.test(expansion) || (suppletive && m?.[1] === 'third' && !m[2])
      ? 'irr'
      : m
        ? m[2]
          ? '3io'
          : CONJ_WORDS[m[1]]
        : undefined;
  return {
    expansion,
    conjugation,
    // Anything irregular or suppletive, except an irregular short imperative (dīc,
    // dūc), which doesn't touch the indicative.
    irregular: suppletive || /irregular(?! short imperative)/.test(expansion),
    deponent: /(?<!semi-)deponent/.test(expansion),
    headword: expansion.split(/\s/)[0],
  };
};

const tenseOf = (tags: string[]): Tense | undefined => {
  if (tags.includes('pluperfect')) return 'plup';
  if (tags.includes('perfect')) return tags.includes('future') ? 'futperf' : 'perf';
  if (tags.includes('present')) return 'pres';
  if (tags.includes('imperfect')) return 'impf';
  if (tags.includes('future')) return 'fut';
  return undefined;
};

const extract = (e: KaikkiEntry): { forms: Partial<Record<PresentTense, Partial<Record<GNumber, Partial<Record<Person, string>>>>>>; candidates: Candidates; infinitive?: string; missing: string[] } => {
  const forms: Partial<Record<PresentTense, Partial<Record<GNumber, Partial<Record<Person, string>>>>>> = {};
  const candidates: Candidates = {};
  let infinitive: string | undefined;
  for (const f of e.forms ?? []) {
    const tags = f.tags ?? [];
    if (tags.includes('table-tags') || tags.includes('inflection-template')) continue;
    if (tags.includes('infinitive') && tags.includes('present') && !tags.includes('passive')) {
      infinitive ??= f.form;
      continue;
    }
    if (!tags.includes('active') || !tags.includes('indicative')) continue;
    const t = tenseOf(tags);
    const p = tags.map((x) => PERSON_TAGS[x]).find(Boolean);
    const n = tags.map((x) => NUMBER_TAGS[x]).find(Boolean);
    if (!t || !p || !n) continue;
    if (PERFECT_SYSTEM.includes(t)) {
      candidates[t] ??= {};
      candidates[t][n] ??= {};
      (candidates[t][n][p] ??= []).push(f.form);
      continue;
    }
    const pt = t as PresentTense;
    forms[pt] ??= {};
    forms[pt][n] ??= {};
    forms[pt][n][p] ??= f.form; // first listed wins
  }
  const missing = PRESENT_SYSTEM.flatMap((t) =>
    NUMBERS.flatMap((n) => PERSONS.filter((p) => !forms[t]?.[n]?.[p]).map((p) => `${t}.${p}${n}`)),
  );
  return { forms, candidates, infinitive, missing };
};

// The perfect system built on `stem`: per slot, the first listed form that starts with
// it. Null when Wiktionary lists no such form for some slot.
const perfectOn = (candidates: Candidates, stem: string): { forms: PerfectForms } | { missing: string[] } => {
  const missing = PERFECT_SYSTEM.flatMap((t) =>
    NUMBERS.flatMap((n) =>
      PERSONS.filter((p) => !candidates[t]?.[n]?.[p]?.some((f) => f.startsWith(stem))).map((p) => `${t}.${p}${n}`),
    ),
  );
  if (missing.length) return { missing };
  const forms = Object.fromEntries(
    PERFECT_SYSTEM.map((t) => [
      t,
      Object.fromEntries(
        NUMBERS.map((n) => [n, Object.fromEntries(PERSONS.map((p) => [p, candidates[t]![n]![p]!.find((f) => f.startsWith(stem))!]))]),
      ),
    ]),
  ) as PerfectForms;
  return { forms };
};

type Resolved =
  | {
      ok: true;
      forms: Forms;
      candidates: Candidates;
      infinitive: string;
      conjugation: Conjugation;
      irregular: boolean;
      url: string;
      expansion: string;
    }
  | { ok: false; reason: string };

const resolveVerb = async (lemma: string, infinitive: string | null): Promise<Resolved> => {
  const url = urlFor(lemma);
  const entries = (await fetchEntries(lemma)).filter((e) => e.pos === 'verb' && strip(e.word) === strip(lemma));
  if (!entries.length) return { ok: false, reason: `no Latin verb entry at ${url}` };

  let matches = entries.filter((e) => describe(e).conjugation !== undefined && !describe(e).deponent);
  // The listed infinitive settles homographs (legō, legere "read" vs lēgō, lēgāre).
  // Macron-insensitive: Suburani writes nārrō, Wiktionary narrō.
  if (infinitive) matches = matches.filter((e) => strip(extract(e).infinitive ?? '') === strip(infinitive));
  // Otherwise the headword spelled exactly as Suburani spells it.
  const spelled = matches.filter((e) => describe(e).headword.normalize('NFC') === lemma.normalize('NFC'));
  if (matches.length > 1 && spelled.length) matches = spelled;
  // Homographs that conjugate identically give the same tables whichever is taken.
  if (matches.length > 1 && new Set(matches.map((e) => JSON.stringify(extract(e).forms))).size === 1)
    matches = [matches[0]];
  if (matches.length !== 1) {
    const seen = entries.map((e) => `"${describe(e).expansion}"`).join('; ');
    return {
      ok: false,
      reason: `${matches.length ? 'several' : 'no'} entries match${infinitive ? ` infinitive ${infinitive}` : ''} (found: ${seen})`,
    };
  }
  const entry = matches[0];
  const x = extract(entry);
  if (x.missing.length) return { ok: false, reason: `paradigm is missing ${x.missing.join(', ')}` };
  if (!x.infinitive) return { ok: false, reason: 'no present infinitive listed' };
  const d = describe(entry);
  const o = VERB_FORM_OVERRIDES[lemma];
  const fix = (f: string) => (o?.replace ?? []).reduce((acc, [from, to]) => acc.split(from).join(to), f);
  const forms = Object.fromEntries(
    PRESENT_SYSTEM.map((t) => [
      t,
      Object.fromEntries(NUMBERS.map((n) => [n, Object.fromEntries(PERSONS.map((p) => [p, fix(x.forms[t]![n]![p]!)]))])),
    ]),
  ) as Forms;
  const candidates: Candidates = Object.fromEntries(
    Object.entries(x.candidates).map(([t, byN]) => [
      t,
      Object.fromEntries(
        Object.entries(byN).map(([n, byP]) => [n, Object.fromEntries(Object.entries(byP).map(([p, fs]) => [p, fs.map(fix)]))]),
      ),
    ]),
  );
  return {
    ok: true,
    forms,
    candidates,
    infinitive: fix(x.infinitive),
    conjugation: d.conjugation!,
    irregular: d.irregular,
    url,
    expansion: d.expansion,
  };
};

// 1. Round-trip the textbook model verbs and irregulars, and build the irregulars'
// perfect tables from the cells Book 2 gives.
const failures: string[] = [];
const irregularPerfects: Record<string, PerfectForms> = {};
for (const v of [...MODEL_VERBS, ...IRREGULAR_VERBS]) {
  const lemma = lemmaOf(v);
  const r = await resolveVerb(lemma, v.infinitive);
  if (!r.ok) {
    failures.push(`${lemma}: ${r.reason}`);
    continue;
  }
  if (r.conjugation !== v.conjugation)
    failures.push(`${lemma}: Wiktionary conjugation ${r.conjugation} ≠ Suburani ${v.conjugation} ("${r.expansion}")`);
  for (const t of PRESENT_SYSTEM)
    for (const n of NUMBERS)
      for (const p of PERSONS)
        if (r.forms[t][n][p] !== v.forms[t]![n][p])
          failures.push(`${lemma} ${t}.${p}${n}: Wiktionary "${r.forms[t][n][p]}" ≠ Suburani "${v.forms[t]![n][p]}"`);

  // The perfect system: model verbs check every cell, irregulars the ones Book 2 gives.
  const cells = v.conjugation === 'irr' ? IRREGULAR_PERFECT_CELLS[v.id] : undefined;
  const first = cells ? cells.perf?.[0] : v.forms.perf?.sg[1];
  if (!first) {
    failures.push(`${lemma}: no textbook perfect to check against`);
    continue;
  }
  const perf = perfectOn(r.candidates, first.slice(0, -1));
  if ('missing' in perf) {
    failures.push(`${lemma}: no perfect-system form on stem "${first.slice(0, -1)}" for ${perf.missing.join(', ')}`);
    continue;
  }
  for (const t of PERFECT_SYSTEM) {
    const expected = cells
      ? (cells[t] ?? []).map((f, i) => [i === 0 ? 'sg.1' : 'sg.2', f] as const)
      : NUMBERS.flatMap((n) => PERSONS.map((p) => [`${n}.${p}`, v.forms[t]![n][p]] as const));
    for (const [slot, f] of expected) {
      const [n, p] = slot.split('.') as [GNumber, string];
      const got = perf.forms[t]![n][Number(p) as Person];
      if (got !== f) failures.push(`${lemma} ${t}.${p}${n}: Wiktionary "${got}" ≠ Suburani "${f}"`);
    }
  }
  if (cells) irregularPerfects[v.id] = perf.forms;
}
if (failures.length) {
  console.error('✗ Model-verb round-trip failed — fix the rule before importing:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `✓ All ${MODEL_VERBS.length} model verbs and ${IRREGULAR_VERBS.length} irregulars round-trip exactly, perfect system included.`,
);

// 2. Import the vocab verbs.
interface Imported {
  conjugation: Conjugation;
  infinitive: string;
  forms: Forms & PerfectForms;
  source: string;
  review?: string;
  perfectReview?: string;
}

// Vocab verbs that are also textbook verbs (vocō, teneō, sum) — the round-trip above
// already checked them, and drills use the textbook table.
const textbook = new Set([...MODEL_VERBS, ...IRREGULAR_VERBS].map(lemmaOf));

const imported: Record<string, Imported> = {};
const unmatched: string[] = [];
const skipped: string[] = [];
const flagged: string[] = [];
const perfectFlagged: string[] = [];
const noPerfect: string[] = [];

for (const v of vocab.filter((e) => e.pos === 'Verb')) {
  // "resistō, resistere, restitī + dat." → resistō, resistere
  const parts = v.la.replace(/\s*\+\s*\w+\.$/, '').split(',').map((s) => s.trim());
  const [lemma, infinitive = null, third = null] = parts;
  const skip =
    VERB_SKIPS[v.id] ??
    (/or$/.test(lemma) ? 'deponent (passive forms, active meaning)' : undefined) ??
    (/\s/.test(lemma) ? 'a phrase, not a single verb' : undefined) ??
    (/^(licet|decet)$/.test(lemma) ? 'impersonal (3rd person singular only)' : undefined);
  if (skip) {
    skipped.push(`${v.la} (${v.id}): ${skip}`);
    continue;
  }

  const r = await resolveVerb(lemma, infinitive);
  if (!r.ok) {
    unmatched.push(`${v.la} (${v.id}): ${r.reason}`);
    continue;
  }

  const reasons: string[] = [];
  if (!textbook.has(lemma)) {
    if (r.irregular) reasons.push(`Wiktionary marks it irregular ("${r.expansion}")`);
    if (!infinitive) reasons.push(`listed without an infinitive; Wiktionary has ${r.infinitive}, ${conjugationLabel(r.conjugation)} conjugation`);
    if (r.forms.pres.sg[1] !== lemma) reasons.push(`1st sg "${r.forms.pres.sg[1]}" ≠ Suburani "${lemma}"`);
    if (infinitive && r.infinitive !== infinitive) reasons.push(`infinitive "${r.infinitive}" ≠ Suburani "${infinitive}"`);
  }

  const review = reasons.length && !VERB_APPROVED_FOR_DRILLS.includes(v.id) ? reasons.join('; ') : undefined;
  if (review) flagged.push(`${v.la} (${v.id}): ${review}`);

  // The perfect system, on Suburani's perfect stem where the vocab lists one.
  const wiktFirst = r.candidates.perf?.sg?.[1]?.[0];
  const listed = third?.endsWith('ī') ? third : null;
  let perfect: PerfectForms = {};
  let perfectReview: string | undefined;
  // A 3rd principal part like "ausus sum" is semi-deponent: its perfect is passive in
  // form, so there's no active perfect system to import.
  if (third && !listed) noPerfect.push(`${v.la} (${v.id}): semi-deponent (perfect ${third})`);
  else if (!textbook.has(lemma) && wiktFirst) {
    const onListed = listed ? perfectOn(r.candidates, listed.slice(0, -1)) : null;
    const chosen = onListed && 'forms' in onListed ? onListed : perfectOn(r.candidates, wiktFirst.slice(0, -1));
    if ('forms' in chosen) {
      perfect = chosen.forms;
      const reason = !listed
        ? `perfect ${wiktFirst} is from Wiktionary only (the vocab lists no 3rd principal part)`
        : onListed && 'forms' in onListed
          ? undefined
          : `Wiktionary's perfect ${wiktFirst} ≠ Suburani's 3rd principal part ${listed}`;
      perfectReview = reason && !VERB_PERFECT_APPROVED.includes(v.id) ? reason : undefined;
      if (perfectReview) perfectFlagged.push(`${v.la} (${v.id}): ${perfectReview}`);
    } else noPerfect.push(`${v.la} (${v.id}): missing ${chosen.missing.join(', ')}`);
  } else if (!textbook.has(lemma)) noPerfect.push(`${v.la} (${v.id}): Wiktionary lists no active perfect`);

  imported[v.id] = {
    conjugation: r.conjugation,
    infinitive: r.infinitive,
    forms: { ...r.forms, ...perfect },
    source: r.url,
    ...(review ? { review } : {}),
    ...(perfectReview ? { perfectReview } : {}),
  };
}

// 3. Write the data file.
const out = `// AUTO-GENERATED by scripts/import-conjugations.ts — do not hand-edit. Rerun
// \`pnpm import-conjugations\` after vocab changes; put decisions in paradigmReview.ts.
//
// Active-indicative paradigms from Wiktionary (https://en.wiktionary.org), extracted by
// kaikki.org. Wiktionary content is licensed CC BY-SA 4.0.

import type { Conjugation, Tense, TenseTable } from './verbs';

export const CONJUGATION_ATTRIBUTION =
  'Vocabulary-verb paradigms from Wiktionary via kaikki.org, CC BY-SA 4.0.';

export interface ImportedConjugation {
  conjugation: Conjugation;
  infinitive: string;
  forms: Partial<Record<Tense, TenseTable>>;
  source: string;
  // Set when the import found something for Nae to confirm; kept out of drills.
  review?: string;
  // Set when the perfect system needs confirming; drills use the present system only.
  perfectReview?: string;
}

export const IMPORTED_CONJUGATIONS: Record<string, ImportedConjugation> = ${JSON.stringify(imported, null, 2)};

// The irregulars' perfect systems, checked against the cells Book 2 gives (verbs.ts
// IRREGULAR_PERFECT_CELLS). Keyed by textbook verb id.
export const IRREGULAR_PERFECTS: Record<string, Partial<Record<Tense, TenseTable>>> = ${JSON.stringify(irregularPerfects, null, 2)};
`;
writeFileSync(resolve('src/data/conjugations.generated.ts'), out);

const ready = Object.values(imported).filter((p) => !p.review).length;
console.log(`✓ Imported ${Object.keys(imported).length} vocab verbs (${ready} ready for drills).`);
if (flagged.length) {
  console.log(`\n⚠ ${flagged.length} need review (kept out of drills until approved in VERB_APPROVED_FOR_DRILLS):`);
  for (const f of flagged) console.log(`  - ${f}`);
}
if (perfectFlagged.length) {
  console.log(`\n⚠ ${perfectFlagged.length} perfect systems need review (drills use the present system until approved in VERB_PERFECT_APPROVED):`);
  for (const f of perfectFlagged) console.log(`  - ${f}`);
}
if (noPerfect.length) {
  console.log(`\n· ${noPerfect.length} imported without a perfect system:`);
  for (const f of noPerfect) console.log(`  - ${f}`);
}
if (unmatched.length) {
  console.log(`\n⚠ ${unmatched.length} not imported:`);
  for (const u of unmatched) console.log(`  - ${u}`);
}
if (skipped.length) {
  console.log(`\n· ${skipped.length} skipped on purpose:`);
  for (const s of skipped) console.log(`  - ${s}`);
}

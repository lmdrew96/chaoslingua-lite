// Imports full noun paradigms for the Suburani vocab from Wiktionary, via kaikki.org's
// per-word JSONL extracts, into src/data/paradigms.generated.ts.
//
//   pnpm import-paradigms
//
// Rerun whenever vocab.ts gains chapters. Rules (see ChaosPatch 3a189448):
//   - Match on lemma (macron-insensitive) + gender + declension.
//   - First form listed per case/number slot wins; exceptions live in
//     src/data/paradigmReview.ts FORM_OVERRIDES.
//   - All 12 Suburani model nouns are round-tripped first. Any mismatch with the
//     textbook tables fails the run — that's the check that the rule is sound.
//   - Nothing is dropped silently: unmatched lemmas, irregulars, and forms that
//     disagree with the Suburani list are reported and kept out of drills until
//     approved in paradigmReview.ts APPROVED_FOR_DRILLS.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CASES, MODEL_NOUNS, NUMBERS, type Case, type Declension, type GNumber } from '../src/data/nouns.ts';
import { APPROVED_FOR_DRILLS, FORM_OVERRIDES } from '../src/data/paradigmReview.ts';
import { vocab, type VocabGender } from '../src/data/vocab.ts';

type Forms = Record<GNumber, Record<Case, string>>;

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

interface Target {
  key: string;
  lemma: string;
  gender: VocabGender | null;
  declension: Declension;
}

const DECLENSION_WORDS: Record<string, Declension> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
const CASE_TAGS: Record<string, Case> = {
  nominative: 'nom',
  genitive: 'gen',
  dative: 'dat',
  accusative: 'acc',
  ablative: 'abl',
};
const NUMBER_TAGS: Record<string, GNumber> = { singular: 'sg', plural: 'pl' };

const strip = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// Kaikki paths are macron-stripped but keep a proper noun's capital (R/Ro/Roma).
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

// "urbs f (genitive urbis); third declension" → gender f, 3rd declension.
const describe = (e: KaikkiEntry) => {
  const expansion = e.head_templates?.[0]?.expansion ?? '';
  // The headword token can carry extra marks (cornū̆), so skip it as a whole token.
  const genders = new Set((expansion.match(/^\S+\s+([mfn](?: or [mfn])?)\b/)?.[1] ?? '').split(' or ').filter(Boolean));
  const declWord = expansion.match(/\b(first|second|third|fourth|fifth) declension/)?.[1];
  return {
    expansion,
    genders,
    declension: declWord ? DECLENSION_WORDS[declWord] : undefined,
    irregular: /irregular/i.test(expansion),
  };
};

const genderMatches = (want: VocabGender | null, have: Set<string>): boolean => {
  if (!want) return true;
  if (want === 'mf') return have.has('m') && have.has('f');
  return have.has(want);
};

const extractForms = (e: KaikkiEntry): { forms: Partial<Record<GNumber, Partial<Record<Case, string>>>>; missing: string[] } => {
  const forms: Partial<Record<GNumber, Partial<Record<Case, string>>>> = {};
  for (const f of e.forms ?? []) {
    const tags = f.tags ?? [];
    if (tags.includes('table-tags') || tags.includes('inflection-template')) continue;
    const c = tags.map((t) => CASE_TAGS[t]).find(Boolean);
    const n = tags.map((t) => NUMBER_TAGS[t]).find(Boolean);
    if (!c || !n) continue;
    forms[n] ??= {};
    forms[n][c] ??= f.form; // first listed wins
  }
  const missing = NUMBERS.flatMap((n) => CASES.filter((c) => !forms[n]?.[c]).map((c) => `${c}.${n}`));
  return { forms, missing };
};

const withOverrides = (lemma: string, forms: Forms): Forms => {
  const o = FORM_OVERRIDES[lemma];
  if (!o) return forms;
  const fix = (f: string) => (o.replace ?? []).reduce((acc, [from, to]) => acc.split(from).join(to), f);
  const row = (n: GNumber) =>
    Object.fromEntries(CASES.map((c) => [c, o[n]?.[c] ?? fix(forms[n][c])])) as Record<Case, string>;
  return { sg: row('sg'), pl: row('pl') };
};

type Resolved =
  | { ok: true; forms: Forms; url: string; irregular: boolean; expansion: string; genderMismatch: boolean }
  | { ok: false; reason: string };

const resolveTarget = async (t: Target): Promise<Resolved> => {
  const url = urlFor(t.lemma);
  const entries = (await fetchEntries(t.lemma)).filter(
    (e) => (e.pos === 'noun' || e.pos === 'name') && strip(e.word) === strip(t.lemma),
  );
  if (!entries.length) return { ok: false, reason: `no Latin noun entry at ${url}` };

  // Declension must match. Gender breaks ties between homographs; if no entry agrees
  // on gender, a lone declension match is still used and the disagreement reported.
  const byDecl = entries.filter((e) => describe(e).declension === t.declension);
  const byGender = byDecl.filter((e) => genderMatches(t.gender, describe(e).genders));
  // Among homographs, an exact gender match (caelum "n") beats a looser one ("n or m").
  const wanted = t.gender === 'mf' ? ['m', 'f'] : t.gender ? [t.gender] : [];
  const exact = byGender.filter((e) => {
    const g = describe(e).genders;
    return g.size === wanted.length && wanted.every((w) => g.has(w));
  });
  const matches = exact.length === 1 ? exact : byGender.length ? byGender : byDecl;
  const genderMismatch = !byGender.length;
  if (matches.length !== 1) {
    const seen = entries.map((e) => `"${describe(e).expansion}"`).join('; ');
    return {
      ok: false,
      reason: `${matches.length ? 'several' : 'no'} entries match gender ${t.gender ?? '?'} + declension ${t.declension} (found: ${seen})`,
    };
  }

  const entry = matches[0];
  const { forms, missing } = extractForms(entry);
  if (missing.length) return { ok: false, reason: `paradigm is missing ${missing.join(', ')}` };
  const d = describe(entry);
  return {
    ok: true,
    forms: withOverrides(t.lemma, forms as Forms),
    url,
    irregular: d.irregular,
    expansion: d.expansion,
    genderMismatch,
  };
};

// 1. Round-trip the textbook model nouns.
const failures: string[] = [];
const genderNotes: string[] = [];
for (const noun of MODEL_NOUNS) {
  const r = await resolveTarget({
    key: noun.id,
    lemma: noun.forms.sg.nom,
    gender: noun.gender,
    declension: noun.declension,
  });
  if (!r.ok) {
    failures.push(`${noun.forms.sg.nom}: ${r.reason}`);
    continue;
  }
  if (r.genderMismatch) genderNotes.push(`${noun.forms.sg.nom}: Suburani table says ${noun.gender}, Wiktionary says "${r.expansion}"`);
  for (const n of NUMBERS)
    for (const c of CASES)
      if (r.forms[n][c] !== noun.forms[n][c])
        failures.push(`${noun.forms.sg.nom} ${c}.${n}: Wiktionary "${r.forms[n][c]}" ≠ Suburani "${noun.forms[n][c]}"`);
}
if (failures.length) {
  console.error('✗ Model-noun round-trip failed — fix the rule or add FORM_OVERRIDES before importing:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ All ${MODEL_NOUNS.length} Suburani model nouns round-trip exactly.`);
for (const g of genderNotes) console.log(`  ⚠ gender: ${g}`);

// 2. Import the vocab nouns.
interface Imported {
  forms: Forms;
  source: string;
  review?: string;
}

const imported: Record<string, Imported> = {};
const unmatched: string[] = [];
const flagged: string[] = [];

for (const v of vocab.filter((e) => e.pos === 'Noun' && e.declension && !e.unconfirmed)) {
  if (v.pluralOnly) {
    unmatched.push(`${v.la} (${v.id}): plural-only nouns aren't imported yet`);
    continue;
  }
  const r = await resolveTarget({ key: v.id, lemma: v.la, gender: v.gender ?? null, declension: v.declension! });
  if (!r.ok) {
    unmatched.push(`${v.la} (${v.id}): ${r.reason}`);
    continue;
  }

  const reasons: string[] = [];
  if (r.genderMismatch) reasons.push(`gender: Suburani lists ${v.gender}, Wiktionary "${r.expansion}"`);
  if (v.irregular) reasons.push('marked irregular in the vocab data');
  if (r.irregular) reasons.push(`Wiktionary marks it irregular ("${r.expansion}")`);
  if (r.forms.sg.nom !== v.la) reasons.push(`nom sg "${r.forms.sg.nom}" ≠ Suburani "${v.la}"`);
  if (v.principal && v.principalCase && r.forms.sg[v.principalCase] !== v.principal)
    reasons.push(`${v.principalCase} sg "${r.forms.sg[v.principalCase]}" ≠ listed "${v.principal}"`);

  const review = reasons.length && !APPROVED_FOR_DRILLS.includes(v.id) ? reasons.join('; ') : undefined;
  if (review) flagged.push(`${v.la} (${v.id}): ${review}`);
  imported[v.id] = { forms: r.forms, source: r.url, ...(review ? { review } : {}) };
}

// 3. Write the data file.
const out = `// AUTO-GENERATED by scripts/import-paradigms.ts — do not hand-edit. Rerun
// \`pnpm import-paradigms\` after vocab changes; put exceptions in paradigmReview.ts.
//
// Paradigms from Wiktionary (https://en.wiktionary.org), extracted by kaikki.org.
// Wiktionary content is licensed CC BY-SA 4.0.

import type { Case, GNumber } from './nouns';

export const PARADIGM_ATTRIBUTION =
  'Vocabulary-noun paradigms from Wiktionary via kaikki.org, CC BY-SA 4.0.';

export interface ImportedParadigm {
  forms: Record<GNumber, Record<Case, string>>;
  source: string;
  // Set when the import found something for Nae to confirm; kept out of drills.
  review?: string;
}

export const IMPORTED_PARADIGMS: Record<string, ImportedParadigm> = ${JSON.stringify(imported, null, 2)};
`;
writeFileSync(resolve('src/data/paradigms.generated.ts'), out);

const ready = Object.values(imported).filter((p) => !p.review).length;
console.log(`✓ Imported ${Object.keys(imported).length} vocab nouns (${ready} ready for drills).`);
if (flagged.length) {
  console.log(`\n⚠ ${flagged.length} need review (imported, kept out of drills until approved in APPROVED_FOR_DRILLS):`);
  for (const f of flagged) console.log(`  - ${f}`);
}
if (unmatched.length) {
  console.log(`\n⚠ ${unmatched.length} not imported:`);
  for (const u of unmatched) console.log(`  - ${u}`);
}

// Wheelock Ch.4 — 2nd declension neuter nouns; sum (irregular); predicate nominative.
//
// Neuter endings verified against Wheelock (donum/bellum paradigm):
// sg nom -um, gen -ī, dat -ō, acc -um (=nom), abl -ō
// pl nom -a, gen -ōrum, dat -īs, acc -a (=nom), abl -īs
// Neuter nom/acc are ALWAYS identical — not a coincidence to route around like Ch.2/3's
// ambiguous endings, but the chapter's core rule. Case-identification drills below use
// merged nom/acc labels instead of treating them as separately guessable.
//
// sum, esse (irregular — no vocab entry for it; hand-verified against Wheelock, same
// as Ch.1's amāre/monēre): sum, es, est, sumus, estis, sunt.
//
// Predicate nouns/adjectives with sum take the NOMINATIVE case (agreeing with the
// subject), not the accusative — every verb drilled so far has taken an accusative
// direct object, so this is the chapter's main point of confusion. The predicate drill
// specifically baits the accusative as a wrong option.

import { vocab } from '../vocab';
import { persons, personLabels, type Person } from './ch1';
import { cases, numbers, caseNames, numberWord, firstDeclensionEndings, type Case, type GNumber } from './ch2';
import { adjectives as priorAdjectives, agreementNouns, secondDeclensionEndings, type Adjective } from './ch3';

export type Gender = 'm' | 'f' | 'n';

// Exported so Ch.5's -er adjectives (which also need masc/fem/neut forms) can reuse
// this instead of re-typing it.
export const neuterEndings: Record<GNumber, Record<Case, string>> = {
  sg: { ...secondDeclensionEndings.sg, nom: 'um', acc: 'um' },
  pl: { ...secondDeclensionEndings.pl, nom: 'a', acc: 'a' },
};

export interface NeuterNoun {
  id: string;
  stem: string;
  gloss: string;
}

// 2nd declension neuter nouns — all regular -um/-ium type (no -er-style irregularity
// among Ch.4's neuter vocab), derived the same way as Ch.2/3: stem = genitive minus "-i".
export const neuterNouns: NeuterNoun[] = vocab
  .filter((v) => v.chapter === 4 && v.pos === 'Noun' && v.gender === 'n')
  .map((v) => {
    const genitive = v.la.split(', ')[1];
    return { id: v.id, stem: genitive.replace(/i$/, ''), gloss: v.en };
  });

export const declinedForm = (noun: NeuterNoun, c: Case, n: GNumber): string =>
  noun.stem + neuterEndings[n][c];

// Every distinct neuter form-group, per number. Unlike Ch.2/3's "unambiguous slots"
// (which exclude the colliding cases), neuter collisions are merged into one labeled
// answer choice each, since nom=acc is the rule being taught, not noise to avoid.
export type NeuterCaseGroup = 'nomAcc' | 'gen' | 'datAbl';

export const neuterCaseGroups: NeuterCaseGroup[] = ['nomAcc', 'gen', 'datAbl'];

const neuterGroupCase: Record<NeuterCaseGroup, Case> = { nomAcc: 'nom', gen: 'gen', datAbl: 'dat' };

export const neuterGroupLabel: Record<NeuterCaseGroup, string> = {
  nomAcc: 'nominative/accusative',
  gen: 'genitive',
  datAbl: 'dative/ablative',
};

export const neuterGroupForm = (noun: NeuterNoun, group: NeuterCaseGroup, n: GNumber): string =>
  declinedForm(noun, neuterGroupCase[group], n);

export const neuterIdentifySlots: Array<{ group: NeuterCaseGroup; n: GNumber }> = neuterCaseGroups.flatMap(
  (group) => numbers.map((n) => ({ group, n })),
);

// sum, esse — irregular, present indicative.
export const sumForms: Record<Person, string> = {
  '1sg': 'sum', '2sg': 'es', '3sg': 'est',
  '1pl': 'sumus', '2pl': 'estis', '3pl': 'sunt',
};

export const sumEnglish: Record<Person, string> = {
  '1sg': 'I am', '2sg': 'you are', '3sg': 'he/she/it is',
  '1pl': 'we are', '2pl': 'you (all) are', '3pl': 'they are',
};

// Adjectives introduced through Ch.4 (extends Ch.3's chapter<=3 pool with Ch.4's new
// regular -us/-a/-um words: bonus, humanus, malus, parvus, stultus, verus).
const ch4AdjectiveEntries: Adjective[] = vocab
  .filter((v) => v.chapter === 4 && v.pos === 'Adjective')
  .map((v) => ({ id: v.id, stem: v.la.split(', ')[0].replace(/us$/, ''), gloss: v.en }));

export const adjectives: Adjective[] = [...priorAdjectives, ...ch4AdjectiveEntries];

// Adjective agreement across all three genders — extends Ch.3's 2-gender adjectiveForm
// (which only needed m/f) by adding neuter, built by overriding nom/acc on the
// masculine table above rather than re-typing the shared gen/dat/abl endings.
export const adjectiveForm = (adj: Adjective, gender: Gender, c: Case, n: GNumber): string => {
  const endings = gender === 'f' ? firstDeclensionEndings : gender === 'n' ? neuterEndings : secondDeclensionEndings;
  return adj.stem + endings[n][c];
};

export interface PredicateNoun {
  id: string;
  gloss: string;
  gender: Gender;
  declinedForm: (c: Case, n: GNumber) => string;
}

// Every noun introduced so far (Ch.2 1st decl. + Ch.3 2nd decl. masc. + Ch.4 neuter),
// tagged by gender, as subjects for the predicate-nominative drill.
export const predicateNouns: PredicateNoun[] = [
  ...agreementNouns.map((noun) => ({
    id: noun.id,
    gloss: noun.gloss,
    gender: noun.gender as Gender,
    declinedForm: noun.declinedForm,
  })),
  ...neuterNouns.map((noun) => ({
    id: noun.id,
    gloss: noun.gloss,
    gender: 'n' as Gender,
    declinedForm: (c: Case, n: GNumber) => declinedForm(noun, c, n),
  })),
];

export { cases, numbers, caseNames, numberWord, persons, personLabels };
export type { Case, GNumber, Person };

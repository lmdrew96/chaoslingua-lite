import { pick, shuffle } from '../lib/random';
import {
  adjectiveForm,
  adjectives,
  caseNames,
  cases,
  declinedForm,
  neuterCaseGroups,
  neuterGroupForm,
  neuterGroupLabel,
  neuterIdentifySlots,
  neuterNouns,
  numberWord,
  numbers,
  personLabels,
  persons,
  predicateNouns,
  sumForms,
  type Case,
  type Gender,
  type GNumber,
} from '../data/grammar/ch4';
import type { DrillGenerator } from './types';

const declineMc: DrillGenerator = () => {
  const noun = pick(neuterNouns);
  const targetCase = pick(cases);
  const targetNumber = pick(numbers);
  const correctForm = declinedForm(noun, targetCase, targetNumber);

  const allSlots: Array<{ c: Case; n: GNumber }> = cases.flatMap((c) =>
    numbers.map((n) => ({ c, n })),
  );
  const wrongForms: string[] = [];
  for (const slot of shuffle(allSlots)) {
    const form = declinedForm(noun, slot.c, slot.n);
    if (form !== correctForm && !wrongForms.includes(form)) wrongForms.push(form);
    if (wrongForms.length === 3) break;
  }

  const options = shuffle([correctForm, ...wrongForms]);
  return {
    type: 'decline_mc_ch4',
    label: 'Decline',
    prompt: `Give the ${caseNames[targetCase]} ${numberWord(targetNumber)} — ${noun.gloss} (neut., 2nd decl.)`,
    options,
    answer: correctForm,
  };
};

// Neuter nom/acc are always identical, so "identify the case" uses merged nom/acc
// labels instead of the 5-way case split Ch.2/3 use — this teaches the rule directly
// rather than routing around an ambiguity.
const identifyCaseMc: DrillGenerator = () => {
  const noun = pick(neuterNouns);
  const slot = pick(neuterIdentifySlots);
  const form = neuterGroupForm(noun, slot.group, slot.n);
  const label = (group: (typeof neuterCaseGroups)[number], n: GNumber) =>
    `${neuterGroupLabel[group]} ${numberWord(n)}`;
  const correctLabel = label(slot.group, slot.n);
  const wrongSlots = shuffle(neuterIdentifySlots.filter((s) => s !== slot)).slice(0, 3);
  const options = shuffle([correctLabel, ...wrongSlots.map((s) => label(s.group, s.n))]);
  return {
    type: 'identify_case_mc_ch4',
    label: 'Identify the case',
    prompt: `What case/number is <span class="latin">${form}</span>? (${noun.gloss}, neuter)`,
    options,
    answer: correctLabel,
  };
};

const sumConjugateMc: DrillGenerator = () => {
  const person = pick(persons);
  const correctForm = sumForms[person];
  const wrongPersons = shuffle(persons.filter((p) => p !== person)).slice(0, 3);
  const options = shuffle([correctForm, ...wrongPersons.map((p) => sumForms[p])]);
  return {
    type: 'sum_conjugate_mc',
    label: 'Conjugate (sum)',
    prompt: `Give the Latin form for <span class="latin">${personLabels[person]}</span> — to be (irregular)`,
    options,
    answer: correctForm,
  };
};

// Predicate nouns/adjectives with sum agree with the subject in the NOMINATIVE, not
// the accusative — every verb drilled so far took an accusative object, so that's the
// classic mistake this drill baits as a wrong option (except for neuter subjects,
// where nom=acc means there's nothing to bait — the distractor pool below already
// accounts for that and still finds enough wrong options from gender/number instead).
const predicateNomMc: DrillGenerator = () => {
  const adjective = pick(adjectives);
  const noun = pick(predicateNouns);
  const number = pick(numbers);

  const subjectForm = noun.declinedForm('nom', number);
  const sumForm = number === 'sg' ? sumForms['3sg'] : sumForms['3pl'];
  const correctForm = adjectiveForm(adjective, noun.gender, 'nom', number);

  const genders: Gender[] = ['m', 'f', 'n'];
  const candidates: Array<{ g: Gender; c: Case; n: GNumber }> = genders.flatMap((g) =>
    (['nom', 'acc'] as Case[]).flatMap((c) => numbers.map((n) => ({ g, c, n }))),
  );
  const wrongForms: string[] = [];
  for (const cand of shuffle(candidates)) {
    const form = adjectiveForm(adjective, cand.g, cand.c, cand.n);
    if (form !== correctForm && !wrongForms.includes(form)) wrongForms.push(form);
    if (wrongForms.length === 3) break;
  }

  const options = shuffle([correctForm, ...wrongForms]);
  const beVerb = sumForm === 'est' ? 'is' : 'are';
  return {
    type: 'predicate_nom_mc',
    label: 'Predicate Nominative',
    prompt: `<span class="latin">${subjectForm} ${sumForm}</span> ___ — which form of ${adjective.stem}us/-a/-um completes "${noun.gloss} ${beVerb} ${adjective.gloss}"? (predicate adjectives take the nominative, not the accusative)`,
    options,
    answer: correctForm,
  };
};

export const ch4Generators: DrillGenerator[] = [declineMc, identifyCaseMc, sumConjugateMc, predicateNomMc];

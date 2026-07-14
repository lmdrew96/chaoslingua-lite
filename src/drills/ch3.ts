import { pick, shuffle } from '../lib/random';
import {
  adjectiveForm,
  adjectives,
  agreementNouns,
  caseNames,
  cases,
  declinedForm,
  nouns,
  numberWord,
  numbers,
  unambiguousSlots,
  type Case,
  type Gender,
  type GNumber,
} from '../data/grammar/ch3';
import type { DrillGenerator } from './types';

const declineMc: DrillGenerator = () => {
  const noun = pick(nouns);
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
    type: 'decline_mc_ch3',
    label: 'Decline',
    prompt: `Give the ${caseNames[targetCase]} ${numberWord(targetNumber)} — ${noun.gloss} (masc., 2nd decl.)`,
    options,
    answer: correctForm,
  };
};

const identifyCaseMc: DrillGenerator = () => {
  const noun = pick(nouns);
  const slot = pick(unambiguousSlots);
  const form = declinedForm(noun, slot.c, slot.n);
  const label = (c: Case, n: GNumber) => `${caseNames[c]} ${numberWord(n)}`;
  const correctLabel = label(slot.c, slot.n);
  const wrongSlots = shuffle(unambiguousSlots.filter((s) => s !== slot)).slice(0, 3);
  const options = shuffle([correctLabel, ...wrongSlots.map((s) => label(s.c, s.n))]);
  return {
    type: 'identify_case_mc_ch3',
    label: 'Identify the case',
    prompt: `What case/number is <span class="latin">${form}</span>? (${noun.gloss})`,
    options,
    answer: correctLabel,
  };
};

const agreementMc: DrillGenerator = () => {
  const adjective = pick(adjectives);
  const noun = pick(agreementNouns);
  const targetCase = pick(cases);
  const targetNumber = pick(numbers);

  const nounForm = noun.declinedForm(targetCase, targetNumber);
  const correctForm = adjectiveForm(adjective, noun.gender, targetCase, targetNumber);

  const genders: Gender[] = ['m', 'f'];
  const allCombos: Array<{ g: Gender; c: Case; n: GNumber }> = genders.flatMap((g) =>
    cases.flatMap((c) => numbers.map((n) => ({ g, c, n }))),
  );
  const wrongForms: string[] = [];
  for (const combo of shuffle(allCombos)) {
    const form = adjectiveForm(adjective, combo.g, combo.c, combo.n);
    if (form !== correctForm && !wrongForms.includes(form)) wrongForms.push(form);
    if (wrongForms.length === 3) break;
  }

  const options = shuffle([correctForm, ...wrongForms]);
  return {
    type: 'agreement_mc',
    label: 'Agreement',
    prompt: `Which form of ${adjective.stem}us/-a agrees with <span class="latin">${nounForm}</span>? (${caseNames[targetCase]} ${numberWord(targetNumber)}, "${noun.gloss}")`,
    options,
    answer: correctForm,
  };
};

export const ch3Generators: DrillGenerator[] = [declineMc, identifyCaseMc, agreementMc];

import { pick, shuffle } from '../lib/random';
import {
  caseFunctions,
  caseNames,
  cases,
  declinedForm,
  nouns,
  numberWord,
  numbers,
  unambiguousSlots,
  type Case,
  type GNumber,
} from '../data/grammar/ch2';
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
  const genderLabel = noun.gender === 'm' ? 'masc.' : 'fem.';
  return {
    type: 'decline_mc',
    label: 'Decline',
    prompt: `Give the ${caseNames[targetCase]} ${numberWord(targetNumber)} — ${noun.gloss} (${genderLabel}, 1st decl.)`,
    options,
    answer: correctForm,
  };
};

const identifyCaseMc: DrillGenerator = () => {
  const noun = pick(nouns);
  const slot = pick(unambiguousSlots);
  const form = declinedForm(noun, slot.c, slot.n);
  const label = (c: Case, n: GNumber) => `${caseFunctions[c]} — ${caseNames[c]} ${numberWord(n)}`;
  const correctLabel = label(slot.c, slot.n);
  const wrongSlots = shuffle(unambiguousSlots.filter((s) => s !== slot)).slice(0, 3);
  const options = shuffle([correctLabel, ...wrongSlots.map((s) => label(s.c, s.n))]);
  return {
    type: 'identify_case_mc',
    label: 'Identify the case',
    prompt: `What case/number is <span class="latin">${form}</span>? (${noun.gloss})`,
    options,
    answer: correctLabel,
  };
};

export const ch2Generators: DrillGenerator[] = [declineMc, identifyCaseMc];

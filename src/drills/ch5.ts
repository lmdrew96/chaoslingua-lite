import { pick, shuffle } from '../lib/random';
import {
  caseNames,
  cases,
  erAdjectiveForm,
  erAdjectives,
  numberWord,
  numbers,
  predicateNouns,
  wordOrderQuestions,
  type Case,
  type Gender,
  type GNumber,
} from '../data/grammar/ch5';
import type { DrillGenerator } from './types';

const GENDERS: Gender[] = ['m', 'f', 'n'];
const GENDER_LABEL: Record<Gender, string> = { m: 'masc.', f: 'fem.', n: 'neut.' };

const erDeclineMc: DrillGenerator = () => {
  const adj = pick(erAdjectives);
  const targetGender = pick(GENDERS);
  const targetCase = pick(cases);
  const targetNumber = pick(numbers);
  const correctForm = erAdjectiveForm(adj, targetGender, targetCase, targetNumber);

  const allSlots: Array<{ g: Gender; c: Case; n: GNumber }> = GENDERS.flatMap((g) =>
    cases.flatMap((c) => numbers.map((n) => ({ g, c, n }))),
  );
  const wrongForms: string[] = [];
  for (const slot of shuffle(allSlots)) {
    const form = erAdjectiveForm(adj, slot.g, slot.c, slot.n);
    if (form !== correctForm && !wrongForms.includes(form)) wrongForms.push(form);
    if (wrongForms.length === 3) break;
  }

  const options = shuffle([correctForm, ...wrongForms]);
  return {
    type: 'er_decline_mc',
    label: 'Decline (-er adjective)',
    prompt: `Give the ${GENDER_LABEL[targetGender]} ${caseNames[targetCase]} ${numberWord(targetNumber)} of ${adj.nomSgM}, ${adj.stem}${targetGender === 'n' ? 'um' : 'a'} ("${adj.gloss}")`,
    options,
    answer: correctForm,
  };
};

const erAgreementMc: DrillGenerator = () => {
  const adj = pick(erAdjectives);
  const noun = pick(predicateNouns);
  const targetCase = pick(cases);
  const targetNumber = pick(numbers);

  const nounForm = noun.declinedForm(targetCase, targetNumber);
  const correctForm = erAdjectiveForm(adj, noun.gender, targetCase, targetNumber);

  const allSlots: Array<{ g: Gender; c: Case; n: GNumber }> = GENDERS.flatMap((g) =>
    cases.flatMap((c) => numbers.map((n) => ({ g, c, n }))),
  );
  const wrongForms: string[] = [];
  for (const slot of shuffle(allSlots)) {
    const form = erAdjectiveForm(adj, slot.g, slot.c, slot.n);
    if (form !== correctForm && !wrongForms.includes(form)) wrongForms.push(form);
    if (wrongForms.length === 3) break;
  }

  const options = shuffle([correctForm, ...wrongForms]);
  return {
    type: 'er_agreement_mc',
    label: 'Agreement (-er adjective)',
    prompt: `Which form of ${adj.nomSgM}, ${adj.stem}a ("${adj.gloss}") agrees with <span class="latin">${nounForm}</span>? (${caseNames[targetCase]} ${numberWord(targetNumber)}, "${noun.gloss}")`,
    options,
    answer: correctForm,
  };
};

// An appositive noun matches the case (and, in this drill, the number) of the noun it
// renames — regardless of its own gender or declension. Pairing nouns from different
// declensions/genders makes that point concrete rather than coincidental.
const appositionMc: DrillGenerator = () => {
  const headNoun = pick(predicateNouns);
  const appositiveNoun = pick(predicateNouns.filter((n) => n.id !== headNoun.id));
  const targetCase = pick(cases);
  const targetNumber = pick(numbers);

  const headForm = headNoun.declinedForm(targetCase, targetNumber);
  const correctForm = appositiveNoun.declinedForm(targetCase, targetNumber);

  const allSlots: Array<{ c: Case; n: GNumber }> = cases.flatMap((c) => numbers.map((n) => ({ c, n })));
  const wrongForms: string[] = [];
  for (const slot of shuffle(allSlots)) {
    const form = appositiveNoun.declinedForm(slot.c, slot.n);
    if (form !== correctForm && !wrongForms.includes(form)) wrongForms.push(form);
    if (wrongForms.length === 3) break;
  }

  const options = shuffle([correctForm, ...wrongForms]);
  return {
    type: 'apposition_mc',
    label: 'Apposition',
    prompt: `<span class="latin">${headForm}</span>, ___ — "${headNoun.gloss}" is ${caseNames[targetCase]} ${numberWord(targetNumber)}. An appositive naming/describing it must match that case. Which form of "${appositiveNoun.gloss}" is correct?`,
    options,
    answer: correctForm,
  };
};

const wordOrderMc: DrillGenerator = () => {
  const q = pick(wordOrderQuestions);
  const options = shuffle([q.correct, ...q.wrong]);
  return {
    type: 'word_order_mc',
    label: 'Word Order',
    prompt: q.prompt,
    options,
    answer: q.correct,
  };
};

export const ch5Generators: DrillGenerator[] = [erDeclineMc, erAgreementMc, appositionMc, wordOrderMc];

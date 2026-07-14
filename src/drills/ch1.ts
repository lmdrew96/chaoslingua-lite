import { pick, shuffle } from '../lib/random';
import {
  conjLabel,
  conjugations,
  englishFor,
  personLabels,
  persons,
  verbKeys,
  type VerbKey,
} from '../data/grammar/ch1';
import type { Drill, DrillGenerator } from './types';

const conjugateMc: DrillGenerator = () => {
  const verbKey = pick(verbKeys);
  const person = pick(persons);
  const verb = conjugations[verbKey];
  const correctForm = verb.forms[person];
  const wrongPersons = shuffle(persons.filter((p) => p !== person)).slice(0, 3);
  const options = shuffle([correctForm, ...wrongPersons.map((p) => verb.forms[p])]);
  return {
    type: 'conjugate_mc',
    label: 'Conjugate',
    prompt: `Give the Latin form for <span class="latin">${personLabels[person]}</span> — ${verb.gloss.split(',')[0]} (${conjLabel(verbKey)} conj.)`,
    options,
    answer: correctForm,
  };
};

const translateLatinMc: DrillGenerator = () => {
  const verbKey = pick(verbKeys);
  const person = pick(persons);
  const verb = conjugations[verbKey];
  const correctForm = verb.forms[person];
  const otherVerb: VerbKey = verbKey === 'amare' ? 'monere' : 'amare';
  const wrongEnglish = shuffle([
    englishFor(verbKey, pick(persons.filter((p) => p !== person))),
    englishFor(otherVerb, person),
    englishFor(otherVerb, pick(persons.filter((p) => p !== person))),
  ]);
  const options = shuffle([englishFor(verbKey, person), ...wrongEnglish]);
  return {
    type: 'translate_latin_mc',
    label: 'Translate to English',
    prompt: `<span class="latin">${correctForm}</span>`,
    options,
    answer: englishFor(verbKey, person),
  };
};

const translateEnglishType: DrillGenerator = () => {
  const verbKey = pick(verbKeys);
  const person = pick(persons);
  const verb = conjugations[verbKey];
  const correctForm = verb.forms[person];
  return {
    type: 'translate_english_type',
    label: 'Translate to Latin (type it)',
    prompt: `"${englishFor(verbKey, person)}" — ${verb.gloss.split(',')[0]} (${conjLabel(verbKey)} conj.)`,
    answer: correctForm,
    accept: [correctForm, correctForm.replace(/ā/g, 'a').replace(/ē/g, 'e')],
  };
};

const identifyPersonMc: DrillGenerator = () => {
  const verbKey = pick(verbKeys);
  const person = pick(persons);
  const verb = conjugations[verbKey];
  const correctForm = verb.forms[person];
  const wrongPersons = shuffle(persons.filter((p) => p !== person)).slice(0, 3);
  const options = shuffle([person, ...wrongPersons]).map((p) => personLabels[p]);
  return {
    type: 'identify_person_mc',
    label: 'Identify the person',
    prompt: `Who does <span class="latin">${correctForm}</span> refer to?`,
    options,
    answer: personLabels[person],
  };
};

// Ch.1 gap patch: imperatives (drop -re for sg, add -te for pl) weren't drilled
// even though the data already carried imperativeSg/imperativePl per verb.
const imperativeMc: DrillGenerator = () => {
  const verbKey = pick(verbKeys);
  const verb = conjugations[verbKey];
  const number = pick(['sg', 'pl'] as const);
  const correctForm = number === 'sg' ? verb.imperativeSg : verb.imperativePl;
  const allForms = verbKeys.flatMap((vk) => [conjugations[vk].imperativeSg, conjugations[vk].imperativePl]);
  const options = shuffle(allForms);
  const numberLabel = number === 'sg' ? 'singular (you)' : 'plural (you all)';
  return {
    type: 'imperative_mc',
    label: 'Imperative',
    prompt: `Give the ${numberLabel} imperative — ${verb.gloss.split(',')[0]} (${conjLabel(verbKey)} conj.)`,
    options,
    answer: correctForm,
  } satisfies Drill;
};

export const ch1Generators: DrillGenerator[] = [
  conjugateMc,
  translateLatinMc,
  translateEnglishType,
  identifyPersonMc,
  imperativeMc,
];

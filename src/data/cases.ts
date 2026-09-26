// Uses of the cases, as framed in the Suburani Reference Grammar ("Uses of the cases").
// Examples and translations are the textbook's own.

import type { Case } from './nouns';

export interface CaseUse {
  use: string;
  example: string;
  translation: string;
}

export type ExtendedCase = Case | 'voc' | 'loc';

export const extendedCaseNames: Record<ExtendedCase, string> = {
  nom: 'nominative',
  gen: 'genitive',
  dat: 'dative',
  acc: 'accusative',
  abl: 'ablative',
  voc: 'vocative',
  loc: 'locative',
};

// The one-line "job" each case does, used to tie a parsed form back to its meaning.
export const caseJobs: Record<Case, string> = {
  nom: 'doer of the action',
  gen: "possession — of, 's",
  dat: 'to / for',
  acc: 'receiver of the action',
  abl: 'in, on, by, with, from, at',
};

export const caseUses: Record<ExtendedCase, CaseUse[]> = {
  nom: [
    { use: 'The noun carrying out the action.', example: 'amīcus labōrat.', translation: 'The friend is working.' },
  ],
  gen: [
    { use: "Possession: of, 's.", example: 'nōmen amīcī', translation: "the friend's name" },
    { use: 'Quantity.', example: 'satis aurī; plūs cibī', translation: 'enough gold; more food' },
    {
      use: 'Quality.',
      example: 'vir magnae auctōritātis',
      translation: 'a man of great authority; a very authoritative man',
    },
  ],
  dat: [
    { use: 'to', example: 'puella amīcō dōnum dat.', translation: 'The girl gives a present to her friend.' },
    { use: 'for', example: 'necesse est amīcō labōrāre.', translation: 'It is necessary for the friend to work.' },
    {
      use: 'Some verbs are used with a noun in the dative case.',
      example: 'puella semper amīcō crēdit.',
      translation: 'The girl always trusts her friend.',
    },
  ],
  acc: [
    { use: 'The noun receiving the action.', example: 'puella amīcum laudat.', translation: 'The girl praises her friend.' },
    {
      use: 'With some prepositions, e.g. ad, per, trāns, in.',
      example: 'puella ad amīcum ambulat.',
      translation: 'The girl walks towards her friend.',
    },
    {
      use: 'How long something lasts for.',
      example: 'puella multās hōrās dormiēbat.',
      translation: 'The girl was sleeping for many hours.',
    },
    {
      use: 'Noun carrying out the action in an indirect statement.',
      example: 'Lūcriō dīxit Rūfīnam labōrāre.',
      translation: 'Lucrio said Rufina was working.',
    },
  ],
  abl: [
    {
      use: 'in, on, by, with, from, at — often with a preposition, e.g. cum, ā/ab, ē/ex, in.',
      example: 'puella cum amīcō in forō ambulat.',
      translation: 'The girl is walking with her friend in the forum.',
    },
    {
      use: 'The time when something happens.',
      example: 'mediā nocte canis lātrāvit.',
      translation: 'In the middle of the night the dog barked.',
    },
    { use: 'Agent of a passive verb.', example: 'Sabīna ab Alexandrō salūtātur.', translation: 'Sabina is greeted by Alexander.' },
    { use: 'Instrument of a passive verb.', example: 'senex venēnō necātus est.', translation: 'The old man was killed by poison.' },
    { use: 'In comparisons.', example: 'Sōrānos altior amīcō est.', translation: 'Soranos is taller than his friend.' },
    { use: 'The price of something.', example: 'vīnum magnō pretiō vēndit.', translation: 'He sells the wine at a high price.' },
    { use: 'Ablative absolute.', example: 'pecūniā trāditā', translation: 'after the money was handed over' },
  ],
  voc: [{ use: 'Speaking to someone.', example: 'salvē, Fauste!', translation: 'Hello, Faustus.' }],
  loc: [
    {
      use: 'Indicating location.',
      example: 'Rōmae manēbāmus. Athēnīs habitābam.',
      translation: 'We remained in/at Rome. I was living in Athens.',
    },
  ],
};

export const vocativeNote =
  'The vocative has exactly the same form as the nominative, except in the singular of the 2nd declension, where -us becomes -e and -ius becomes -ī.';

export const locativeNote =
  '1st declension -ae / -īs; 2nd declension -ī / -īs; 3rd declension -ī or -e / -ibus. In the 4th declension, domus has the locative domī.';

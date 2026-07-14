export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const glossary: GlossaryTerm[] = [
  {
    term: 'Conjugation',
    definition:
      "The pattern of endings a Latin verb follows to show person, number, and tense. Wheelock groups verbs into four conjugations by their infinitive ending (amāre = 1st, monēre = 2nd).",
  },
  {
    term: 'Declension',
    definition:
      'The pattern of case endings a Latin noun follows. Nouns fall into five declensions; porta/portae (1st declension) is the pattern covered so far.',
  },
  {
    term: 'Case',
    definition:
      "A noun's grammatical role in a sentence — who's doing the action, who it's done to, who it belongs to, and so on. Latin marks this with endings instead of word order.",
  },
  {
    term: 'Person',
    definition: 'Who is performing a verb\'s action: 1st (I/we), 2nd (you/you all), or 3rd (he-she-it/they).',
  },
  {
    term: 'Number',
    definition: 'Whether a word is singular (one) or plural (more than one).',
  },
  {
    term: 'Gender',
    definition:
      'A grammatical property every Latin noun has — masculine, feminine, or neuter. It doesn\'t always match real-world sex: nauta ("sailor") is masculine but still 1st declension.',
  },
  {
    term: 'Principal parts',
    definition:
      'The short list of forms (e.g. amō, amāre, amāvī, amātum) that lets you derive every other form of a verb. Dictionaries list these instead of a single "base" form.',
  },
  {
    term: 'Indicative mood',
    definition:
      'The mood used for statements of fact ("she loves") as opposed to commands (imperative) or hypotheticals (subjunctive).',
  },
  {
    term: 'Imperative',
    definition: 'The command form of a verb ("Love!", "Warn!") — formed differently from the indicative.',
  },
  {
    term: 'Agreement',
    definition:
      "An adjective's endings must match the noun it describes in case, number, and gender — but not necessarily in declension. A masculine noun that declines like a 1st declension noun (e.g. nauta, \"sailor\") still takes masculine (2nd declension) adjective endings, because agreement follows gender, not the noun's own pattern.",
  },
];

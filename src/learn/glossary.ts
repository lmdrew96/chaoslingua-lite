export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const glossary: GlossaryTerm[] = [
  {
    term: 'Case',
    definition:
      "A noun's job in the sentence — doing the action, receiving it, owning something, and so on. Latin marks the job with the ending, not with word order, so puellam amīcus videt and amīcus puellam videt mean the same thing.",
  },
  {
    term: 'Declension',
    definition:
      'A family of nouns that share one set of case endings. Latin has five; you can tell which one a noun belongs to from its listed forms (puella, puellam → 1st; urbs, urbem → 3rd; diēs, diem → 5th).',
  },
  {
    term: 'Number',
    definition: 'Whether a word is singular (one) or plural (more than one).',
  },
  {
    term: 'Gender',
    definition:
      "Every Latin noun is masculine, feminine, or neuter. It doesn't always match real-world sex, and it doesn't pick the declension: most 1st-declension nouns are feminine, but agricola (farmer) is masculine.",
  },
  {
    term: 'Neuter nom = acc',
    definition:
      'In every declension, a neuter noun has the same form in the nominative and accusative (dōnum / dōnum, capita / capita). The ending alone can\'t tell you whether it\'s doing or receiving the action.',
  },
  {
    term: 'Same form, different jobs',
    definition:
      'Many forms fit more than one case: puellae can be genitive singular, dative singular, or nominative plural; -īs and -ibus are both dative and ablative plural. When a form is ambiguous on its own, the rest of the sentence decides.',
  },
];

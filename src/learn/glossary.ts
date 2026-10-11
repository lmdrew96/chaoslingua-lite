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
    definition:
      'Whether a word is singular (one) or plural (more than one). Verbs have number too: vocat (he calls) is singular, vocant (they call) is plural.',
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
  {
    term: 'Person',
    definition:
      'Who is doing the action: 1st person is the speaker (I, we), 2nd is the person spoken to (you), 3rd is anyone else (he, she, it, they). A Latin verb shows it in its ending, so vocō alone means "I call".',
  },
  {
    term: 'Personal ending',
    definition:
      'The last letters of a verb, which give its person and number: -ō or -m (I), -s (you), -t (he, she, it), -mus (we), -tis (you, pl.), -nt (they).',
  },
  {
    term: 'Tense',
    definition:
      'When the action happens and how it is seen: present (I call), imperfect (I was calling, used to call), future (I shall call). The perfect tenses come in Module 5.',
  },
  {
    term: 'Conjugation',
    definition:
      'A family of verbs that share one pattern of endings — the verb version of a declension. Suburani uses five: 1st (vocō), 2nd (teneō), 3rd (mittō), 4th (audiō), and 3rd/4th (capiō). A few, like sum, are irregular.',
  },
  {
    term: 'Principal parts',
    definition:
      'The forms a verb is listed by, from which all the others are built: nārrō, nārrāre, nārrāvī — I tell, to tell, I told.',
  },
  {
    term: 'Stem',
    definition:
      'The part of a word that carries its meaning, before the endings: vocā- in vocābat, mitt- in mittunt. The stem stays put while the endings change.',
  },
  {
    term: 'Tense sign',
    definition:
      'Letters between the stem and the personal ending that mark the tense: -ba- for the imperfect (vocābat), -bi- or -ē- for the future (vocābit, mittēs).',
  },
  {
    term: 'Infinitive',
    definition: 'The "to …" form of a verb: vocāre, to call. It is the second principal part, and its ending tells you the conjugation.',
  },
  {
    term: 'Imperative',
    definition: 'A command: vocā! (call!, to one person), vocāte! (call!, to more than one).',
  },
];

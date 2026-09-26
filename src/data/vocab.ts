// Suburani "Vocabulary for learning" lists (Reference Grammar, Book 1), ch.1–6.
// Every Latin form and gloss is copied from the textbook; nothing here is glossed from
// memory.
//
// Book 1 lists nouns as nom + acc (cibus, cibum, m.), so `principal` is the accusative.
// Declension is derived from those two forms, never guessed:
//   -a / -am                  → 1st
//   -um / -um (n.), -er/-erum → 2nd
//   any / -em                 → 3rd (5th-declension nominatives end in -ēs)
//   -ēs / -em, stem kept      → 5th (diēs, diem — also listed as 5th in the grammar)
//   -us / -um                 → 2nd OR 4th — not decidable from the forms alone, so
//                               these are confirmed against Prof. Hartman's LATN 101
//                               2nd-declension list, or flagged `unconfirmed`.
// Ch.1 lists bare nominatives (frāter, hōra, …). Where the LATN 101 declension lists
// give the genitive, that's used as the principal form instead; the rest are flagged.

import type { Declension } from './nouns';

export type PartOfSpeech =
  | 'Noun'
  | 'Verb'
  | 'Adjective'
  | 'Pronoun'
  | 'Adverb'
  | 'Preposition'
  | 'Conjunction';

// m.f. = either gender depending on who's meant (custōs, iuvenis).
export type VocabGender = 'm' | 'f' | 'n' | 'mf';

export interface VocabEntry {
  id: string;
  chapter: number;
  pos: PartOfSpeech;
  // Nouns: the nominative. Everything else: the headword line exactly as listed.
  la: string;
  en: string;
  // Nouns only.
  principal?: string | null;
  principalCase?: 'acc' | 'gen';
  gender?: VocabGender | null;
  declension?: Declension;
  pluralOnly?: boolean;
  // Set when the sources don't settle the declension or forms — kept out of drills
  // until Nae confirms.
  unconfirmed?: string;
}

const word = (chapter: number, pos: PartOfSpeech, la: string, en: string): VocabEntry => ({
  id: `ch${chapter}-${la}`,
  chapter,
  pos,
  la,
  en,
});

const noun = (
  chapter: number,
  la: string,
  principal: string | null,
  gender: VocabGender | null,
  declension: Declension,
  en: string,
  extra: Partial<VocabEntry> = {},
): VocabEntry => ({
  id: `ch${chapter}-${la}`,
  chapter,
  pos: 'Noun',
  la,
  en,
  principal,
  principalCase: 'acc',
  gender,
  declension,
  ...extra,
});

// Ch.1 nouns have no second form in Suburani; these genitives come from the LATN 101
// "Nouns: 1st/2nd Declension" lists, which Prof. Hartman builds from Suburani.
const fromClassList = (gen: string): Partial<VocabEntry> => ({ principal: gen, principalCase: 'gen' });

const NO_FORMS = 'Suburani ch.1 lists only the nominative, and it isn’t on the LATN 101 1st/2nd declension lists.';

export const vocab: VocabEntry[] = [
  // Chapter 1
  word(1, 'Verb', 'dormiō', 'I sleep'),
  word(1, 'Pronoun', 'ego', 'I'),
  noun(1, 'frāter', null, 'm', 3, 'brother', { unconfirmed: NO_FORMS }),
  noun(1, 'hōra', null, 'f', 1, 'hour', fromClassList('hōrae')),
  word(1, 'Preposition', 'in', 'in, on'),
  noun(1, 'īnsula', null, 'f', 1, 'apartment building', fromClassList('īnsulae')),
  word(1, 'Verb', 'labōrō', 'I work'),
  word(1, 'Verb', 'legō', 'I read'),
  word(1, 'Adjective', 'meus', 'my'),
  word(1, 'Adverb', 'nōn', 'not'),
  noun(1, 'pater', null, 'm', 3, 'father', { unconfirmed: NO_FORMS }),
  word(1, 'Verb', 'rīdeō', 'I laugh, smile'),
  noun(1, 'servus', null, 'm', 2, 'slave, enslaved person (male)', fromClassList('servī')),
  word(1, 'Pronoun', 'tū', 'you (singular)'),
  noun(1, 'turba', null, 'f', 1, 'crowd', fromClassList('turbae')),
  word(1, 'Adverb', 'ubi?', 'where?'),
  noun(1, 'via', null, 'f', 1, 'street, road, way', fromClassList('viae')),
  word(1, 'Verb', 'sum', 'I am'),
  word(1, 'Verb', 'es', 'you (singular) are'),
  word(1, 'Verb', 'est', '(he/she/it) is'),

  // Chapter 2
  word(2, 'Verb', 'cadō', 'I fall'),
  noun(2, 'cibus', 'cibum', 'm', 2, 'food'),
  word(2, 'Verb', 'dūcō', 'I lead, take'),
  word(2, 'Conjunction', 'et', 'and'),
  noun(2, 'fīlia', 'fīliam', 'f', 1, 'daughter'),
  noun(2, 'fīlius', 'fīlium', 'm', 2, 'son', {
    unconfirmed: '-us / -um fits both 2nd and 4th declension, and fīlius isn’t on the LATN 101 2nd-declension list.',
  }),
  noun(2, 'forum', 'forum', 'n', 2, 'forum, marketplace'),
  word(2, 'Verb', 'habeō', 'I have, hold'),
  word(2, 'Verb', 'habitō', 'I live'),
  word(2, 'Verb', 'intrō', 'I enter'),
  word(2, 'Adjective', 'magnus', 'big, large, great'),
  noun(2, 'pecūnia', 'pecūniam', 'f', 1, 'money, sum of money'),
  word(2, 'Verb', 'quaerō', 'I search for, look for, ask'),
  word(2, 'Adverb', 'quoque', 'also, too'),
  word(2, 'Verb', 'salūtō', 'I greet'),
  word(2, 'Conjunction', 'sed', 'but'),
  word(2, 'Verb', 'spectō', 'I look at, watch'),
  word(2, 'Verb', 'videō', 'I see'),
  noun(2, 'vīnum', 'vīnum', 'n', 2, 'wine'),
  word(2, 'Verb', 'vocō', 'I call'),

  // Chapter 3
  word(3, 'Verb', 'ambulō', 'I walk'),
  noun(3, 'amīcus', 'amīcum', 'm', 2, 'friend'),
  noun(3, 'ancilla', 'ancillam', 'f', 1, 'slave, enslaved person (female)'),
  word(3, 'Verb', 'clāmō', 'I shout'),
  noun(3, 'clāmor', 'clāmōrem', 'm', 3, 'shout, shouting, noise'),
  word(3, 'Preposition', 'cum', 'with'),
  word(3, 'Verb', 'currō', 'I run'),
  word(3, 'Verb', 'dīcō', 'I say, speak, tell'),
  noun(3, 'equus', 'equum', 'm', 2, 'horse'),
  word(3, 'Verb', 'festīnō', 'I hurry'),
  noun(3, 'gladius', 'gladium', 'm', 2, 'sword'),
  word(3, 'Adjective', 'īnfēlīx', 'unlucky, unhappy'),
  word(3, 'Adjective', 'laetus', 'happy'),
  word(3, 'Adjective', 'multus', 'much, many'),
  word(3, 'Adjective', 'omnis', 'all, every'),
  word(3, 'Preposition', 'per', 'through, along'),
  word(3, 'Adjective', 'prīmus', 'first'),
  noun(3, 'senātor', 'senātōrem', 'm', 3, 'senator'),
  noun(3, 'urbs', 'urbem', 'f', 3, 'city'),
  word(3, 'Verb', 'vincō', 'I conquer, win, am victorious'),

  // Chapter 4
  word(4, 'Preposition', 'ad', 'to, towards; at'),
  word(4, 'Verb', 'adsum', 'I am here, I am present'),
  noun(4, 'deus', 'deum', 'm', 2, 'god'),
  noun(4, 'dominus', 'dominum', 'm', 2, 'master'),
  noun(4, 'dōnum', 'dōnum', 'n', 2, 'gift, present'),
  word(4, 'Verb', 'laudō', 'I praise'),
  word(4, 'Pronoun', 'nōs', 'we, us'),
  word(4, 'Adjective', 'parvus', 'small'),
  noun(4, 'perīculum', 'perīculum', 'n', 2, 'danger'),
  word(4, 'Adjective', 'perterritus', 'terrified'),
  noun(4, 'puella', 'puellam', 'f', 1, 'girl'),
  word(4, 'Conjunction', 'quod', 'because'),
  noun(4, 'rēx', 'rēgem', 'm', 3, 'king'),
  word(4, 'Adjective', 'Rōmānus', 'Roman'),
  word(4, 'Adverb', 'subitō', 'suddenly'),
  noun(4, 'templum', 'templum', 'n', 2, 'temple'),
  word(4, 'Verb', 'teneō', 'I hold, keep, possess'),
  word(4, 'Verb', 'tollō', 'I raise, lift up, hold up'),
  word(4, 'Verb', 'veniō', 'I come'),
  word(4, 'Pronoun', 'vōs', 'you (plural)'),

  // Chapter 5
  noun(5, 'aqua', 'aquam', 'f', 1, 'water'),
  word(5, 'Verb', 'audiō, audīre', 'hear, listen to'),
  word(5, 'Verb', 'cupiō, cupere', 'want, desire'),
  noun(5, 'custōs', 'custōdem', 'mf', 3, 'guard'),
  word(5, 'Verb', 'dēbeō, dēbēre', 'owe'),
  word(5, 'Verb', 'dō, dare', 'give'),
  word(5, 'Verb', 'effugiō, effugere', 'escape'),
  noun(5, 'iuvenis', 'iuvenem', 'mf', 3, 'young person'),
  word(5, 'Verb', 'maneō, manēre', 'remain, stay'),
  word(5, 'Pronoun', 'nēmō, nēminem', 'no one, nobody'),
  word(5, 'Verb', 'nōlō, nōlle', "don't want, refuse"),
  noun(5, 'nox', 'noctem', 'f', 3, 'night'),
  word(5, 'Verb', 'portō, portāre', 'carry, bear, take'),
  word(5, 'Verb', 'possum, posse', 'can, am able'),
  word(5, 'Adjective', 'pulcher', 'beautiful, handsome'),
  word(5, 'Verb', 'respondeō, respondēre', 'reply'),
  word(5, 'Verb', 'taceō, tacēre', 'am silent, am quiet'),
  word(5, 'Verb', 'timeō, timēre', 'fear, am afraid'),
  word(5, 'Verb', 'vēndō, vēndere', 'sell'),
  word(5, 'Verb', 'volō, velle', 'want, wish, am willing'),

  // Chapter 6
  word(6, 'Preposition', 'ā, ab + abl.', 'from, away from'),
  word(6, 'Verb', 'capiō, capere', 'take, catch, capture, adopt (a plan)'),
  noun(6, 'diēs', 'diem', 'm', 5, 'day'),
  word(6, 'Verb', 'discēdō, discēdere', 'depart, leave'),
  word(6, 'Preposition', 'ē, ex + abl.', 'from, out of'),
  word(6, 'Verb', 'exspectō, exspectāre', 'wait for, expect'),
  word(6, 'Verb', 'faciō, facere', 'make, do'),
  word(6, 'Adverb', 'iam', 'now, already'),
  word(6, 'Preposition', 'in + acc.', 'into, onto'),
  word(6, 'Verb', 'inquit', 'says'),
  noun(6, 'marītus', 'marītum', 'm', 2, 'husband'),
  noun(6, 'māter', 'mātrem', 'f', 3, 'mother'),
  word(6, 'Preposition', 'prope + acc.', 'near'),
  word(6, 'Verb', 'rogō, rogāre', 'ask, ask for'),
  word(6, 'Verb', 'sedeō, sedēre', 'sit'),
  word(6, 'Verb', 'stō, stāre', 'stand'),
  word(6, 'Adjective', 'tōtus', 'whole'),
  word(6, 'Adjective', 'trīstis', 'sad'),
  word(6, 'Adjective', 'tuus', 'your (singular), yours'),
  noun(6, 'uxor', 'uxōrem', 'f', 3, 'wife'),
];

export const VOCAB_CHAPTERS: number[] = [...new Set(vocab.map((v) => v.chapter))];

export const vocabByChapter = (chapter: number): VocabEntry[] => vocab.filter((v) => v.chapter === chapter);

// Nouns a drill may use: in an enabled chapter, in an enabled declension, and not
// waiting on confirmation.
export const drillableNouns = (chapters: Set<number>, declensions: Set<Declension>): VocabEntry[] =>
  vocab.filter(
    (v) =>
      v.pos === 'Noun' &&
      !v.unconfirmed &&
      v.declension !== undefined &&
      chapters.has(v.chapter) &&
      declensions.has(v.declension),
  );

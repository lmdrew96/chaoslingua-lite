// Suburani "Vocabulary for learning" lists (Reference Grammar, Book 1), ch.1–16.
// Every Latin form and gloss is copied from the textbook; nothing here is glossed from
// memory.
//
// Book 1 lists nouns as nom + acc (cibus, cibum, m.) through ch.10, and nom + gen
// (dux, ducis, m.) from ch.11; `principalCase` records which.
// Declension is derived from those two forms, never guessed:
//   -a / -am                  → 1st
//   -um / -um (n.), -er/-erum → 2nd
//   any / -em                 → 3rd (5th-declension nominatives end in -ēs)
//   -ēs / -em, stem kept      → 5th (diēs, diem — also listed as 5th in the grammar)
//   -us / -um                 → 2nd OR 4th — not decidable from the forms alone, so
//                               these are confirmed against Prof. Hartman's LATN 101
//                               2nd-declension list or by Nae, else flagged
//                               `unconfirmed`.
// Ch.1 lists bare nominatives (frāter, hōra, …). Where the LATN 101 declension lists
// give the genitive, that's used as the principal form instead; the rest have none.

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
  // A person or animal — either could plausibly do the action, which the decode drill
  // needs so word-world knowledge can't give away who's the subject.
  animate?: boolean;
  // Irregular forms somewhere in the paradigm (domus).
  irregular?: boolean;
  // Set when the sources don't settle the declension or forms — kept out of drills
  // until Nae confirms.
  unconfirmed?: string;
}

const US_UM = '-us / -um fits both 2nd and 4th declension, and it isn’t on the LATN 101 2nd-declension list.';

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

export const vocab: VocabEntry[] = [
  // Chapter 1
  word(1, 'Verb', 'dormiō', 'I sleep'),
  word(1, 'Pronoun', 'ego', 'I'),
  // frāter, pater: no second form in any source; 3rd declension confirmed by Nae (9/25).
  // With no listed accusative, the decode drill skips them.
  noun(1, 'frāter', null, 'm', 3, 'brother'),
  noun(1, 'hōra', null, 'f', 1, 'hour', fromClassList('hōrae')),
  word(1, 'Preposition', 'in', 'in, on'),
  noun(1, 'īnsula', null, 'f', 1, 'apartment building', fromClassList('īnsulae')),
  word(1, 'Verb', 'labōrō', 'I work'),
  word(1, 'Verb', 'legō', 'I read'),
  word(1, 'Adjective', 'meus', 'my'),
  word(1, 'Adverb', 'nōn', 'not'),
  noun(1, 'pater', null, 'm', 3, 'father'),
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
  noun(2, 'fīlia', 'fīliam', 'f', 1, 'daughter', { animate: true }),
  // -us / -um fits 2nd or 4th; 2nd confirmed by Nae (9/25) — not on the LATN 101 list.
  noun(2, 'fīlius', 'fīlium', 'm', 2, 'son', { animate: true }),
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
  noun(3, 'amīcus', 'amīcum', 'm', 2, 'friend', { animate: true }),
  noun(3, 'ancilla', 'ancillam', 'f', 1, 'slave, enslaved person (female)', { animate: true }),
  word(3, 'Verb', 'clāmō', 'I shout'),
  noun(3, 'clāmor', 'clāmōrem', 'm', 3, 'shout, shouting, noise'),
  word(3, 'Preposition', 'cum', 'with'),
  word(3, 'Verb', 'currō', 'I run'),
  word(3, 'Verb', 'dīcō', 'I say, speak, tell'),
  noun(3, 'equus', 'equum', 'm', 2, 'horse', { animate: true }),
  word(3, 'Verb', 'festīnō', 'I hurry'),
  noun(3, 'gladius', 'gladium', 'm', 2, 'sword'),
  word(3, 'Adjective', 'īnfēlīx', 'unlucky, unhappy'),
  word(3, 'Adjective', 'laetus', 'happy'),
  word(3, 'Adjective', 'multus', 'much, many'),
  word(3, 'Adjective', 'omnis', 'all, every'),
  word(3, 'Preposition', 'per', 'through, along'),
  word(3, 'Adjective', 'prīmus', 'first'),
  noun(3, 'senātor', 'senātōrem', 'm', 3, 'senator', { animate: true }),
  noun(3, 'urbs', 'urbem', 'f', 3, 'city'),
  word(3, 'Verb', 'vincō', 'I conquer, win, am victorious'),

  // Chapter 4
  word(4, 'Preposition', 'ad', 'to, towards; at'),
  word(4, 'Verb', 'adsum', 'I am here, I am present'),
  noun(4, 'deus', 'deum', 'm', 2, 'god', { animate: true }),
  noun(4, 'dominus', 'dominum', 'm', 2, 'master', { animate: true }),
  noun(4, 'dōnum', 'dōnum', 'n', 2, 'gift, present'),
  word(4, 'Verb', 'laudō', 'I praise'),
  word(4, 'Pronoun', 'nōs', 'we, us'),
  word(4, 'Adjective', 'parvus', 'small'),
  noun(4, 'perīculum', 'perīculum', 'n', 2, 'danger'),
  word(4, 'Adjective', 'perterritus', 'terrified'),
  noun(4, 'puella', 'puellam', 'f', 1, 'girl', { animate: true }),
  word(4, 'Conjunction', 'quod', 'because'),
  noun(4, 'rēx', 'rēgem', 'm', 3, 'king', { animate: true }),
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
  noun(5, 'custōs', 'custōdem', 'mf', 3, 'guard', { animate: true }),
  word(5, 'Verb', 'dēbeō, dēbēre', 'owe'),
  word(5, 'Verb', 'dō, dare', 'give'),
  word(5, 'Verb', 'effugiō, effugere', 'escape'),
  noun(5, 'iuvenis', 'iuvenem', 'mf', 3, 'young person', { animate: true }),
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
  noun(6, 'marītus', 'marītum', 'm', 2, 'husband', { animate: true }),
  noun(6, 'māter', 'mātrem', 'f', 3, 'mother', { animate: true }),
  word(6, 'Preposition', 'prope + acc.', 'near'),
  word(6, 'Verb', 'rogō, rogāre', 'ask, ask for'),
  word(6, 'Verb', 'sedeō, sedēre', 'sit'),
  word(6, 'Verb', 'stō, stāre', 'stand'),
  word(6, 'Adjective', 'tōtus', 'whole'),
  word(6, 'Adjective', 'trīstis', 'sad'),
  word(6, 'Adjective', 'tuus', 'your (singular), yours'),
  noun(6, 'uxor', 'uxōrem', 'f', 3, 'wife', { animate: true }),

  // Chapter 7
  word(7, 'Verb', 'appropinquō, appropinquāre, appropinquāvī', 'approach, come near to'),
  word(7, 'Adverb', 'cūr?', 'why?'),
  noun(7, 'epistula', 'epistulam', 'f', 1, 'letter'),
  noun(7, 'homō', 'hominem', 'm', 3, 'man, person', { animate: true }),
  word(7, 'Adjective', 'ingēns', 'huge'),
  noun(7, 'īnsula', 'īnsulam', 'f', 1, 'island; apartment building'),
  noun(7, 'mīles', 'mīlitem', 'm', 3, 'soldier', { animate: true }),
  word(7, 'Adverb', 'minimē', 'no'),
  word(7, 'Verb', 'nārrō, nārrāre, nārrāvī', 'tell, relate'),
  noun(7, 'nauta', 'nautam', 'm', 1, 'sailor', { animate: true }),
  word(7, 'Adverb', 'nunc', 'now'),
  word(7, 'Adverb', 'ōlim', 'once, some time ago'),
  noun(7, 'pars', 'partem', 'f', 3, 'part'),
  noun(7, 'puer', 'puerum', 'm', 2, 'boy', { animate: true }),
  word(7, 'Verb', 'pugnō, pugnāre, pugnāvī', 'fight'),
  noun(7, 'rēs', 'rem', 'f', 5, 'thing, story'),
  word(7, 'Adverb', 'saepe', 'often'),
  noun(7, 'silva', 'silvam', 'f', 1, 'wood, forest'),
  word(7, 'Adverb', 'tum', 'then'),
  word(7, 'Adverb', 'vehementer', 'loudly, violently, strongly'),

  // Chapter 8
  word(8, 'Verb', 'agō, agere, ēgī', 'do'),
  word(8, 'Verb', 'bibō, bibere, bibī', 'drink'),
  word(8, 'Verb', 'cōnspiciō, cōnspicere, cōnspexī', 'catch sight of, notice'),
  word(8, 'Preposition', 'dē + abl.', 'from, down from; about'),
  noun(8, 'domus', 'domum', 'f', 4, 'house, home', { irregular: true }),
  word(8, 'Pronoun', 'eam', 'her; it'),
  word(8, 'Pronoun', 'eum', 'him; it'),
  word(8, 'Verb', 'gerō, gerere, gessī', 'wear'),
  word(8, 'Verb', 'iaceō, iacēre, iacuī', 'lie down'),
  word(8, 'Verb', 'incendō, incendere, incendī', 'burn, set on fire'),
  word(8, 'Adverb', 'mox', 'soon'),
  word(8, 'Pronoun', 'nihil', 'nothing'),
  word(8, 'Adjective', 'noster', 'our'),
  noun(8, 'porta', 'portam', 'f', 1, 'gate'),
  word(8, 'Conjunction', 'postquam', 'after'),
  word(8, 'Verb', 'prōcēdō, prōcēdere, prōcessī', 'go along, proceed'),
  noun(8, 'senex', 'senem', 'mf', 3, 'old person', { animate: true }),
  word(8, 'Verb', 'surgō, surgere, surrēxī', 'get up'),
  word(8, 'Adverb', 'tandem', 'at last, finally'),
  word(8, 'Preposition', 'trāns + acc.', 'across'),

  // Chapter 9
  word(9, 'Verb', 'adveniō, advenīre, advēnī', 'arrive'),
  noun(9, 'cīvis', 'cīvem', 'mf', 3, 'citizen', { animate: true }),
  word(9, 'Adjective', 'difficilis', 'difficult'),
  noun(9, 'domina', 'dominam', 'f', 1, 'mistress, lady', { animate: true }),
  word(9, 'Adjective', 'gravis', 'heavy; serious'),
  noun(9, 'hostis', 'hostem', 'm', 3, 'enemy', { animate: true }),
  noun(9, 'imperātor', 'imperātōrem', 'm', 3, 'emperor, general', { animate: true }),
  word(9, 'Adjective', 'īrātus', 'angry'),
  noun(9, 'iter', 'iter', 'n', 3, 'journey, route, way'),
  word(9, 'Verb', 'lacrimō, lacrimāre, lacrimāvī', 'cry, weep'),
  // līberī is plural-only: the listed second form is the accusative plural.
  noun(9, 'līberī', 'līberōs', 'm', 2, 'children', { pluralOnly: true, animate: true }),
  word(9, 'Adjective', 'medius', 'middle, middle of'),
  noun(9, 'nūntius', 'nūntium', 'm', 2, 'messenger; message, news', { unconfirmed: US_UM, animate: true }),
  word(9, 'Adjective', 'paucī, pl.', 'few, a few'),
  word(9, 'Verb', 'petō, petere, petīvī', 'attack; seek, beg, ask for'),
  noun(9, 'sanguis', 'sanguinem', 'm', 3, 'blood'),
  word(9, 'Adverb', 'statim', 'immediately, at once'),
  word(9, 'Verb', 'trādō, trādere, trādidī', 'hand over, hand down'),
  noun(9, 'vir', 'virum', 'm', 2, 'man', { animate: true }),
  noun(9, 'vīta', 'vītam', 'f', 1, 'life'),

  // Chapter 10
  word(10, 'Verb', 'accipiō, accipere, accēpī', 'accept, take in, receive'),
  word(10, 'Adjective', 'alius, alia, aliud', 'another, other'),
  noun(10, 'annus', 'annum', 'm', 2, 'year'),
  word(10, 'Adjective', 'bonus, bona, bonum', 'good'),
  word(10, 'Preposition', 'contrā + acc.', 'against'),
  noun(10, 'dea', 'deam', 'f', 1, 'goddess', { animate: true }),
  word(10, 'Adverb', 'deinde', 'then'),
  word(10, 'Verb', 'ferō, ferre, tulī', 'bring, carry, bear'),
  word(10, 'Adjective', 'fidēlis, fidēlis, fidēle', 'loyal, faithful, trustworthy'),
  word(10, 'Verb', 'iaciō, iacere, iēcī', 'throw'),
  noun(10, 'locus', 'locum', 'm', 2, 'place'),
  word(10, 'Adjective', 'miser, misera, miserum', 'poor, unfortunate'),
  word(10, 'Adjective', 'novus, nova, novum', 'new'),
  word(10, 'Adjective', 'nūllus, nūlla, nūllum', 'no, not any'),
  word(10, 'Verb', 'occīdō, occīdere, occīdī', 'kill'),
  noun(10, 'pāx', 'pācem', 'f', 3, 'peace'),
  word(10, 'Verb', 'pereō, perīre, periī', 'die, perish'),
  word(10, 'Adverb', 'quam … !', 'how … !'),
  word(10, 'Adjective', 'sacer, sacra, sacrum', 'sacred, holy'),
  word(10, 'Preposition', 'sub + acc. or abl.', 'under, below, beneath'),

  // Chapter 11 — from here the lists give nom + gen instead of nom + acc.
  word(11, 'Verb', 'absum, abesse, āfuī', 'am out, absent, away'),
  word(11, 'Verb', 'accidō, accidere, accidī', 'happen'),
  word(11, 'Adjective', 'altus, alta, altum', 'high, deep'),
  word(11, 'Adverb', 'bene', 'well'),
  noun(11, 'dux', 'ducis', 'm', 3, 'leader', { principalCase: 'gen', animate: true }),
  noun(11, 'flūmen', 'flūminis', 'n', 3, 'river', { principalCase: 'gen' }),
  word(11, 'Adjective', 'fortis, fortis, forte', 'brave'),
  word(11, 'Adverb', 'frūstrā', 'in vain, without success'),
  word(11, 'Verb', 'fugiō, fugere, fūgī', 'run away, flee'),
  word(11, 'Adverb', 'hodiē', 'today'),
  word(11, 'Adverb', 'ibi', 'there'),
  word(11, 'Verb', 'inveniō, invenīre, invēnī', 'find'),
  word(11, 'Conjunction', 'itaque', 'and so, therefore'),
  noun(11, 'mare', 'maris', 'n', 3, 'sea', { principalCase: 'gen' }),
  word(11, 'Verb', 'nāvigō, nāvigāre, nāvigāvī', 'sail'),
  noun(11, 'nāvis', 'nāvis', 'f', 3, 'ship', { principalCase: 'gen' }),
  word(11, 'Preposition', 'prō + abl.', 'in front of; for'),
  word(11, 'Adjective', 'saevus, saeva, saevum', 'savage, cruel'),
  word(11, 'Adjective', 'sōlus, sōla, sōlum', 'alone, lonely, only, on one’s own'),
  word(11, 'Adverb', 'ubi', 'where? where, when'),

  // Chapter 12
  noun(12, 'caelum', 'caelī', 'n', 2, 'sky, heaven', { principalCase: 'gen' }),
  noun(12, 'caput', 'capitis', 'n', 3, 'head', { principalCase: 'gen' }),
  noun(12, 'corpus', 'corporis', 'n', 3, 'body', { principalCase: 'gen' }),
  word(12, 'Adjective', 'crūdēlis, crūdēlis, crūdēle', 'cruel'),
  word(12, 'Verb', 'dēleō, dēlēre, dēlēvī', 'destroy'),
  word(12, 'Adverb', 'diū', 'for a long time'),
  noun(12, 'iānua', 'iānuae', 'f', 1, 'door, doorway', { principalCase: 'gen' }),
  word(12, 'Adverb', 'iterum', 'again'),
  word(12, 'Verb', 'mittō, mittere, mīsī', 'send'),
  word(12, 'Verb', 'offerō, offerre, obtulī', 'offer'),
  word(12, 'Pronoun', 'quis? quid?', 'who? what?'),
  word(12, 'Verb', 'redeō, redīre, rediī', 'go back, come back, return'),
  noun(12, 'Rōma', 'Rōmae', 'f', 1, 'Rome', { principalCase: 'gen' }),
  word(12, 'Verb', 'servō, servāre, servāvī', 'save, protect, keep, look after'),
  word(12, 'Adjective', 'stultus, stulta, stultum', 'stupid, foolish'),
  word(12, 'Verb', 'superō, superāre, superāvī', 'overcome, overpower'),
  noun(12, 'taberna', 'tabernae', 'f', 1, 'shop, inn', { principalCase: 'gen' }),
  noun(12, 'terra', 'terrae', 'f', 1, 'ground', { principalCase: 'gen' }),
  word(12, 'Verb', 'trahō, trahere, trāxī', 'drag, draw, pull'),
  noun(12, 'vōx', 'vōcis', 'f', 3, 'voice, shout', { principalCase: 'gen' }),

  // Chapter 13
  word(13, 'Verb', 'coepī', 'began'),
  word(13, 'Verb', 'cōnsūmō, cōnsūmere, cōnsūmpsī', 'consume, eat'),
  word(13, 'Verb', 'intellegō, intellegere, intellēxī', 'understand, realize'),
  word(13, 'Preposition', 'inter + acc.', 'among, between'),
  word(13, 'Adverb', 'ita vērō', 'yes, absolutely'),
  noun(13, 'labor', 'labōris', 'm', 3, 'work', { principalCase: 'gen' }),
  word(13, 'Adjective', 'longus, longa, longum', 'long'),
  noun(13, 'mūrus', 'mūrī', 'm', 2, 'wall', { principalCase: 'gen' }),
  noun(13, 'nōmen', 'nōminis', 'n', 3, 'name', { principalCase: 'gen' }),
  word(13, 'Verb', 'parō, parāre, parāvī', 'prepare'),
  word(13, 'Preposition', 'post + acc.', 'after, behind'),
  noun(13, 'praemium', 'praemiī', 'n', 2, 'prize, reward, profit', { principalCase: 'gen' }),
  word(13, 'Conjunction', 'quamquam', 'although'),
  word(13, 'Pronoun', 'quī, quae, quod', 'who, which'),
  word(13, 'Adverb', 'quōmodo?', 'how? in what way?'),
  word(13, 'Adverb', 'semper', 'always'),
  word(13, 'Adjective', 'summus, summa, summum', 'highest, greatest, top (of)'),
  word(13, 'Adjective', 'suus, sua, suum', 'her, his, its, their (own)'),
  word(13, 'Adverb', 'tamen', 'however'),
  word(13, 'Verb', 'vīvō, vīvere, vīxī', 'live, am alive'),

  // Chapter 14
  word(14, 'Verb', 'amō, amāre, amāvī', 'love, like'),
  noun(14, 'amor', 'amōris', 'm', 3, 'love', { principalCase: 'gen' }),
  word(14, 'Verb', 'cōgitō, cōgitāre, cōgitāvī', 'think, consider'),
  word(14, 'Verb', 'cōnficiō, cōnficere, cōnfēcī', 'finish'),
  noun(14, 'cōnsilium', 'cōnsiliī', 'n', 2, 'plan, idea, advice', { principalCase: 'gen' }),
  word(14, 'Verb', 'cōnstituō, cōnstituere, cōnstituī', 'decide'),
  word(14, 'Adjective', 'dīrus, dīra, dīrum', 'dreadful'),
  word(14, 'Pronoun', 'eōs', 'them'),
  noun(14, 'fēmina', 'fēminae', 'f', 1, 'woman', { principalCase: 'gen', animate: true }),
  noun(14, 'mōns', 'montis', 'm', 3, 'mountain', { principalCase: 'gen' }),
  noun(14, 'mors', 'mortis', 'f', 3, 'death', { principalCase: 'gen' }),
  word(14, 'Conjunction', 'nec', 'and not, nor, neither'),
  word(14, 'Conjunction', 'nec … nec …', 'neither … nor …'),
  word(14, 'Verb', 'necō, necāre, necāvī', 'kill'),
  word(14, 'Verb', 'nesciō, nescīre, nescīvī', "don't know"),
  word(14, 'Adverb', 'numquam', 'never'),
  word(14, 'Verb', 'ostendō, ostendere, ostendī', 'show'),
  noun(14, 'tempus', 'temporis', 'n', 3, 'time', { principalCase: 'gen' }),
  word(14, 'Verb', 'terreō, terrēre, terruī', 'frighten'),
  noun(14, 'verbum', 'verbī', 'n', 2, 'word', { principalCase: 'gen' }),

  // Chapter 15
  word(15, 'Adverb', 'anteā', 'before'),
  noun(15, 'bellum', 'bellī', 'n', 2, 'war', { principalCase: 'gen' }),
  noun(15, 'cēna', 'cēnae', 'f', 1, 'dinner, meal', { principalCase: 'gen' }),
  word(15, 'Adjective', 'cēterī, cēterae, cētera, pl.', 'the rest, the others'),
  word(15, 'Verb', 'cognōscō, cognōscere, cognōvī', 'get to know, find out, learn'),
  noun(15, 'comes', 'comitis', 'mf', 3, 'comrade, companion', { principalCase: 'gen', animate: true }),
  word(15, 'Verb', 'eō, īre, iī', 'go'),
  word(15, 'Adverb', 'etiam', 'even, also'),
  word(15, 'Adjective', 'ferōx, ferōx, ferōcis', 'fierce, ferocious'),
  noun(15, 'hortus', 'hortī', 'm', 2, 'garden', { principalCase: 'gen' }),
  word(15, 'Adverb', 'intereā', 'meanwhile'),
  word(15, 'Verb', 'iubeō, iubēre, iussī', 'order'),
  noun(15, 'lībertus', 'lībertī', 'm', 2, 'freedman, former slave', { principalCase: 'gen', animate: true }),
  word(15, 'Adverb', 'multum', 'much'),
  word(15, 'Adverb', 'nōnne?', 'surely?'),
  word(15, 'Verb', 'nūntiō, nūntiāre, nūntiāvī', 'announce, report'),
  word(15, 'Verb', 'putō, putāre, putāvī', 'think'),
  word(15, 'Pronoun', 'sē', 'himself, herself, itself, themselves'),
  word(15, 'Conjunction', 'simulatque', 'as soon as'),
  noun(15, 'vīlla', 'vīllae', 'f', 1, 'country house, house', { principalCase: 'gen' }),

  // Chapter 16
  word(16, 'Conjunction', 'ac', 'and'),
  word(16, 'Verb', 'auferō, auferre, abstulī', 'steal, carry off'),
  word(16, 'Adjective', 'brevis, brevis, breve', 'short, brief'),
  word(16, 'Verb', 'cēlō, cēlāre, cēlāvī', 'hide'),
  word(16, 'Pronoun', 'hic, haec, hoc', 'this, he, she, it'),
  word(16, 'Pronoun', 'ille, illa, illud', 'that, he, she, it'),
  noun(16, 'imperium', 'imperiī', 'n', 2, 'empire; power', { principalCase: 'gen' }),
  word(16, 'Verb', 'legō, legere, lēgī', 'read; choose'),
  noun(16, 'lūx', 'lūcis', 'f', 3, 'light, daylight', { principalCase: 'gen' }),
  word(16, 'Verb', 'ōrō, ōrāre, ōrāvī', 'beg, beg for'),
  noun(16, 'prīnceps', 'prīncipis', 'm', 3, 'chief; emperor', { principalCase: 'gen', animate: true }),
  word(16, 'Adverb', 'quō?', 'where to?'),
  word(16, 'Verb', 'rapiō, rapere, rapuī', 'seize, grab'),
  noun(16, 'rēgīna', 'rēgīnae', 'f', 1, 'queen', { principalCase: 'gen', animate: true }),
  word(16, 'Verb', 'resistō, resistere, restitī + dat.', 'resist'),
  word(16, 'Verb', 'reveniō, revenīre, revēnī', 'come back, return'),
  word(16, 'Verb', 'sciō, scīre, scīvī', 'know'),
  word(16, 'Verb', 'sentiō, sentīre, sēnsī', 'feel, notice'),
  word(16, 'Conjunction', 'sī', 'if'),
  word(16, 'Preposition', 'sine + abl.', 'without'),
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

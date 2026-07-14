// Ported from Flashdeck (~/Desktop/Flashdeck/codex.json), filtered to Wheelock Ch.1-5.
// Source pipeline: build_codex.py — Latin vocab hand-entered from wheelockslatin.com,
// English/Romanian glosses cross-referenced via Wiktionary. 83 entries, chapters 1-5.

export type PartOfSpeech = 'Noun' | 'Verb' | 'Adjective' | 'Determiner' | 'Adverb' | 'Preposition' | 'Conjunction' | 'Pronoun';

export interface VocabEntry {
  id: string;
  chapter: number;
  pos: PartOfSpeech;
  la: string;
  en: string;
  enAlt: string[];
  ro: string;
  gender: 'm' | 'f' | 'n' | null;
}

export const vocab: VocabEntry[] = [
  { id: "ch1-amo", chapter: 1, pos: "Verb", la: "amo, amare, amavi, amatum", en: "love", enAlt: [], ro: "iubi", gender: null },
  { id: "ch1-cogito", chapter: 1, pos: "Verb", la: "cogito, cogitare, cogitavi, cogitatum", en: "think", enAlt: [], ro: "gândi", gender: null },
  { id: "ch1-debeo", chapter: 1, pos: "Verb", la: "debeo, debere, debui, debitum", en: "owe", enAlt: ["ought"], ro: "datora", gender: null },
  { id: "ch1-do", chapter: 1, pos: "Verb", la: "do, dare, dedi, datum", en: "give", enAlt: [], ro: "da", gender: null },
  { id: "ch1-erro", chapter: 1, pos: "Verb", la: "erro, errare, erravi, erratum", en: "wander", enAlt: ["err"], ro: "umbla", gender: null },
  { id: "ch1-laudo", chapter: 1, pos: "Verb", la: "laudo, laudare, laudavi, laudatum", en: "praise", enAlt: [], ro: "lăuda", gender: null },
  { id: "ch1-moneo", chapter: 1, pos: "Verb", la: "moneo, monere, monui, monitum", en: "warn", enAlt: ["advise"], ro: "avertiza", gender: null },
  { id: "ch1-servo", chapter: 1, pos: "Verb", la: "servo, servare, servavi, servatum", en: "preserve", enAlt: ["save"], ro: "proteja", gender: null },
  { id: "ch1-terreo", chapter: 1, pos: "Verb", la: "terreo, terrere, terrui, territum", en: "frighten", enAlt: ["terrify"], ro: "speria", gender: null },
  { id: "ch1-video", chapter: 1, pos: "Verb", la: "video, videre, vidi, visum", en: "see", enAlt: [], ro: "vedea", gender: null },
  { id: "ch1-voco", chapter: 1, pos: "Verb", la: "voco, vocare, vocavi, vocatum", en: "call", enAlt: ["summon"], ro: "chema", gender: null },
  { id: "ch2-fama", chapter: 2, pos: "Noun", la: "fama, famae", en: "fame", enAlt: ["rumor"], ro: "faimă", gender: "f" },
  { id: "ch2-forma", chapter: 2, pos: "Noun", la: "forma, formae", en: "form", enAlt: ["shape"], ro: "formă", gender: "f" },
  { id: "ch2-fortuna", chapter: 2, pos: "Noun", la: "fortuna, fortunae", en: "fortune", enAlt: ["luck"], ro: "soartă", gender: "f" },
  { id: "ch2-ira", chapter: 2, pos: "Noun", la: "ira, irae", en: "anger", enAlt: ["ire"], ro: "furie", gender: "f" },
  { id: "ch2-nauta", chapter: 2, pos: "Noun", la: "nauta, nautae", en: "sailor", enAlt: [], ro: "marinar", gender: "m" },
  { id: "ch2-patria", chapter: 2, pos: "Noun", la: "patria, patriae", en: "homeland", enAlt: ["fatherland", "country"], ro: "patrie", gender: "f" },
  { id: "ch2-pecunia", chapter: 2, pos: "Noun", la: "pecunia, pecuniae", en: "money", enAlt: [], ro: "ban", gender: "f" },
  { id: "ch2-philosophia", chapter: 2, pos: "Noun", la: "philosophia, philosophiae", en: "philosophy", enAlt: [], ro: "filozofie", gender: "f" },
  { id: "ch2-poena", chapter: 2, pos: "Noun", la: "poena, poenae", en: "punishment", enAlt: ["penalty"], ro: "penalizare", gender: "f" },
  { id: "ch2-poeta", chapter: 2, pos: "Noun", la: "poeta, poetae", en: "poet", enAlt: [], ro: "poet", gender: "m" },
  { id: "ch2-porta", chapter: 2, pos: "Noun", la: "porta, portae", en: "gate", enAlt: ["entrance"], ro: "poartă", gender: "f" },
  { id: "ch2-puella", chapter: 2, pos: "Noun", la: "puella, puellae", en: "girl", enAlt: [], ro: "fată", gender: "f" },
  { id: "ch2-rosa", chapter: 2, pos: "Noun", la: "rosa, rosae", en: "rose", enAlt: [], ro: "roză", gender: "f" },
  { id: "ch2-sententia", chapter: 2, pos: "Noun", la: "sententia, sententiae", en: "opinion", enAlt: ["thought", "sentence"], ro: "părere", gender: "f" },
  { id: "ch2-vita", chapter: 2, pos: "Noun", la: "vita, vitae", en: "life", enAlt: [], ro: "viață", gender: "f" },
  { id: "ch2-antiquus", chapter: 2, pos: "Adjective", la: "antiquus, antiqua, antiquum", en: "ancient", enAlt: ["old"], ro: "antic", gender: null },
  { id: "ch2-magnus", chapter: 2, pos: "Adjective", la: "magnus, magna, magnum", en: "large", enAlt: ["great", "big"], ro: "mare", gender: null },
  { id: "ch2-multus", chapter: 2, pos: "Determiner", la: "multus, multa, multum", en: "much", enAlt: [], ro: "mult", gender: null },
  { id: "ch3-ager", chapter: 3, pos: "Noun", la: "ager, agri", en: "field", enAlt: ["farm"], ro: "câmp", gender: "m" },
  { id: "ch3-agricola", chapter: 3, pos: "Noun", la: "agricola, agricolae", en: "farmer", enAlt: [], ro: "fermier", gender: "m" },
  { id: "ch3-amica", chapter: 3, pos: "Noun", la: "amica, amicae", en: "friend", enAlt: [], ro: "amică", gender: "f" },
  { id: "ch3-amicus", chapter: 3, pos: "Noun", la: "amicus, amici", en: "friend", enAlt: [], ro: "amic", gender: "m" },
  { id: "ch3-femina", chapter: 3, pos: "Noun", la: "femina, feminae", en: "woman", enAlt: [], ro: "femeie", gender: "f" },
  { id: "ch3-filia", chapter: 3, pos: "Noun", la: "filia, filiae", en: "daughter", enAlt: [], ro: "fiică", gender: "f" },
  { id: "ch3-filius", chapter: 3, pos: "Noun", la: "filius, filii", en: "son", enAlt: [], ro: "fiu", gender: "m" },
  { id: "ch3-numerus", chapter: 3, pos: "Noun", la: "numerus, numeri", en: "number", enAlt: [], ro: "număr", gender: "m" },
  { id: "ch3-populus", chapter: 3, pos: "Noun", la: "populus, populi", en: "people", enAlt: ["nation"], ro: "oameni", gender: "m" },
  { id: "ch3-puer", chapter: 3, pos: "Noun", la: "puer, pueri", en: "boy", enAlt: [], ro: "băiat", gender: "m" },
  { id: "ch3-sapientia", chapter: 3, pos: "Noun", la: "sapientia, sapientiae", en: "wisdom", enAlt: [], ro: "înțelepciune", gender: "f" },
  { id: "ch3-vir", chapter: 3, pos: "Noun", la: "vir, viri", en: "man", enAlt: ["hero"], ro: "bărbat", gender: "m" },
  { id: "ch3-avarus", chapter: 3, pos: "Adjective", la: "avarus, avara, avarum", en: "greedy", enAlt: ["avaricious"], ro: "lacom", gender: null },
  { id: "ch3-paucus", chapter: 3, pos: "Determiner", la: "paucus, pauca, paucum", en: "few", enAlt: [], ro: "câțiva", gender: null },
  { id: "ch3-hodie", chapter: 3, pos: "Adverb", la: "hodie", en: "today", enAlt: [], ro: "astăzi", gender: null },
  { id: "ch3-semper", chapter: 3, pos: "Adverb", la: "semper", en: "always", enAlt: [], ro: "totdeauna", gender: null },
  { id: "ch3-habeo", chapter: 3, pos: "Verb", la: "habeo, habere, habui, habitum", en: "have", enAlt: ["hold", "possess"], ro: "avea", gender: null },
  { id: "ch4-basium", chapter: 4, pos: "Noun", la: "basium, basii", en: "kiss", enAlt: [], ro: "sărut", gender: "n" },
  { id: "ch4-bellum", chapter: 4, pos: "Noun", la: "bellum, belli", en: "war", enAlt: [], ro: "război", gender: "n" },
  { id: "ch4-consilium", chapter: 4, pos: "Noun", la: "consilium, consilii", en: "plan", enAlt: ["counsel", "advice"], ro: "plan", gender: "n" },
  { id: "ch4-cura", chapter: 4, pos: "Noun", la: "cura, curae", en: "care", enAlt: ["anxiety"], ro: "grijă", gender: "f" },
  { id: "ch4-donum", chapter: 4, pos: "Noun", la: "donum, doni", en: "gift", enAlt: ["present"], ro: "cadou", gender: "n" },
  { id: "ch4-exitium", chapter: 4, pos: "Noun", la: "exitium, exitii", en: "destruction", enAlt: ["ruin"], ro: "distrugere", gender: "n" },
  { id: "ch4-magister", chapter: 4, pos: "Noun", la: "magister, magistri", en: "teacher", enAlt: ["schoolmaster"], ro: "profesor", gender: "m" },
  { id: "ch4-magistra", chapter: 4, pos: "Noun", la: "magistra, magistrae", en: "teacher", enAlt: ["schoolmistress"], ro: "profesoară", gender: "f" },
  { id: "ch4-mora", chapter: 4, pos: "Noun", la: "mora, morae", en: "delay", enAlt: [], ro: "întârziere", gender: "f" },
  { id: "ch4-oculus", chapter: 4, pos: "Noun", la: "oculus, oculi", en: "eye", enAlt: [], ro: "ochi", gender: "m" },
  { id: "ch4-officium", chapter: 4, pos: "Noun", la: "officium, officii", en: "duty", enAlt: ["service"], ro: "datorie", gender: "n" },
  { id: "ch4-otium", chapter: 4, pos: "Noun", la: "otium, otii", en: "leisure", enAlt: ["peace"], ro: "răgaz", gender: "n" },
  { id: "ch4-periculum", chapter: 4, pos: "Noun", la: "periculum, periculi", en: "danger", enAlt: ["risk"], ro: "pericol", gender: "n" },
  { id: "ch4-remedium", chapter: 4, pos: "Noun", la: "remedium, remedii", en: "remedy", enAlt: ["cure"], ro: "remediu", gender: "n" },
  { id: "ch4-bonus", chapter: 4, pos: "Adjective", la: "bonus, bona, bonum", en: "good", enAlt: ["kind"], ro: "bun", gender: null },
  { id: "ch4-humanus", chapter: 4, pos: "Adjective", la: "humanus, humana, humanum", en: "human", enAlt: [], ro: "omenesc", gender: null },
  { id: "ch4-malus", chapter: 4, pos: "Adjective", la: "malus, mala, malum", en: "bad", enAlt: ["evil", "wicked"], ro: "rău", gender: null },
  { id: "ch4-parvus", chapter: 4, pos: "Adjective", la: "parvus, parva, parvum", en: "small", enAlt: ["little"], ro: "mic", gender: null },
  { id: "ch4-stultus", chapter: 4, pos: "Adjective", la: "stultus, stulta, stultum", en: "foolish", enAlt: [], ro: "prost", gender: null },
  { id: "ch4-verus", chapter: 4, pos: "Adjective", la: "verus, vera, verum", en: "true", enAlt: ["real"], ro: "adevărat", gender: null },
  { id: "ch4-iuvo", chapter: 4, pos: "Verb", la: "iuvo, iuvare, iuvi, iutum", en: "help", enAlt: ["aid", "assist"], ro: "ajuta", gender: null },
  { id: "ch5-adulescentia", chapter: 5, pos: "Noun", la: "adulescentia, adulescentiae", en: "youth", enAlt: [], ro: "tinerețe", gender: "f" },
  { id: "ch5-animus", chapter: 5, pos: "Noun", la: "animus, animi", en: "mind", enAlt: ["spirit", "soul"], ro: "minte", gender: "m" },
  { id: "ch5-caelum", chapter: 5, pos: "Noun", la: "caelum, caeli", en: "sky", enAlt: ["heaven"], ro: "cer", gender: "n" },
  { id: "ch5-culpa", chapter: 5, pos: "Noun", la: "culpa, culpae", en: "fault", enAlt: ["blame"], ro: "hibă", gender: "f" },
  { id: "ch5-gloria", chapter: 5, pos: "Noun", la: "gloria, gloriae", en: "glory", enAlt: ["fame"], ro: "glorie", gender: "f" },
  { id: "ch5-verbum", chapter: 5, pos: "Noun", la: "verbum, verbi", en: "word", enAlt: [], ro: "cuvânt", gender: "n" },
  { id: "ch5-liber", chapter: 5, pos: "Adjective", la: "liber, libera, liberum", en: "free", enAlt: [], ro: "liber", gender: null },
  { id: "ch5-pulcher", chapter: 5, pos: "Adjective", la: "pulcher, pulchra, pulchrum", en: "beautiful", enAlt: ["handsome"], ro: "frumos", gender: null },
  { id: "ch5-sanus", chapter: 5, pos: "Adjective", la: "sanus, sana, sanum", en: "healthy", enAlt: ["sound", "sane"], ro: "sănătos", gender: null },
  { id: "ch5-cras", chapter: 5, pos: "Adverb", la: "cras", en: "tomorrow", enAlt: [], ro: "mâine", gender: null },
  { id: "ch5-heri", chapter: 5, pos: "Adverb", la: "heri", en: "yesterday", enAlt: [], ro: "ieri", gender: null },
  { id: "ch5-satis", chapter: 5, pos: "Adverb", la: "satis", en: "enough", enAlt: [], ro: "destul", gender: null },
  { id: "ch5-ceno", chapter: 5, pos: "Verb", la: "ceno, cenare, cenavi, cenatum", en: "dine", enAlt: [], ro: "cina", gender: null },
  { id: "ch5-culpo", chapter: 5, pos: "Verb", la: "culpo, culpare, culpavi, culpatum", en: "blame", enAlt: [], ro: "inculpa", gender: null },
  { id: "ch5-maneo", chapter: 5, pos: "Verb", la: "maneo, manere, mansi, mansum", en: "remain", enAlt: ["stay"], ro: "rămâne", gender: null },
  { id: "ch5-supero", chapter: 5, pos: "Verb", la: "supero, superare, superavi, superatum", en: "overcome", enAlt: ["conquer", "surpass"], ro: "învinge", gender: null },
];

export const vocabByChapter = (chapter: number): VocabEntry[] =>
  vocab.filter((entry) => entry.chapter === chapter);


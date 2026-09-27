// Typical word order, from Suburani's "Order of information in Latin sentences":
// nominative → dative → accusative → verb, with a genitive following its noun.
//
// Taught as a reading expectation, not a rule. Every option uses the same words with
// the same endings, so all of them mean the same thing; the question is only which
// one a reader should expect. Moving the genitive would let it attach to a different
// noun, so it always stays next to its own noun, and only goes first where no other
// noun sits right before it.
//
// Forms come from sourced paradigms only (forms.ts); verbs from src/data/verbs.ts.

import { DATIVE_VERBS, DECODE_VERBS } from '../data/verbs';
import { pick, shuffle } from '../lib/random';
import { capitalize, english, giveables, people, type Sourced } from './forms';
import type { DrillContext, DrillType, McDrill } from './types';

type Role = 'nom' | 'dat' | 'acc' | 'verb';

// One slot of the sentence. The accusative slot can carry a genitive with it.
interface Block {
  role: Role;
  words: string[];
}

const ROLE_NAMES: Record<Role, string> = { nom: 'nominative', dat: 'dative', acc: 'accusative', verb: 'verb' };
const TYPICAL: Role[] = ['nom', 'dat', 'acc', 'verb'];

const permutations = <T,>(items: T[]): T[][] =>
  items.length <= 1 ? [items] : items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => [x, ...p]));

const render = (blocks: Block[]): string => `${capitalize(blocks.flatMap((b) => b.words).join(' '))}.`;

// Distinct people, so no one is doing something to themselves.
const pickDistinct = (pools: Sourced[][]): Sourced[] | null => {
  const chosen: Sourced[] = [];
  for (const pool of pools) {
    const left = pool.filter((p) => chosen.every((c) => c.id !== p.id && english(c) !== english(p)));
    if (!left.length) return null;
    chosen.push(pick(left));
  }
  return chosen;
};

// "The X gives the (Y's) thing to the Z" with a dative verb, else "The X greets the
// (Y's) Z". Null when the gates leave too few people or verbs for that shape.
const build = (ctx: DrillContext, useDative: boolean, withGen: boolean): McDrill | null => {
  const verbs = (useDative ? DATIVE_VERBS : DECODE_VERBS).filter((v) => ctx.chapters.has(v.chapter));
  const things = giveables(ctx);
  if (!verbs.length || (useDative && !things.length)) return null;
  const cast = pickDistinct([people(ctx, 'acc'), people(ctx, useDative ? 'dat' : 'acc'), ...(withGen ? [people(ctx, 'gen')] : [])]);
  if (!cast) return null;

  const verb = pick(verbs);
  const [subject, second, owner] = cast;
  const object = useDative ? pick(things) : second;
  const recipient = useDative ? second : null;

  const blocks: Block[] = [
    { role: 'nom', words: [subject.forms.sg.nom] },
    ...(recipient ? [{ role: 'dat' as const, words: [recipient.forms.sg.dat] }] : []),
    { role: 'acc', words: owner ? [object.forms.sg.acc, owner.forms.sg.gen] : [object.forms.sg.acc] },
    { role: 'verb', words: [verb.la] },
  ];

  const typical = [...blocks].sort((a, b) => TYPICAL.indexOf(a.role) - TYPICAL.indexOf(b.role));
  const answer = render(typical);

  // Every other arrangement of the blocks, plus a genitive-first variant where it can't
  // be misread: right after another noun, the genitive would describe that noun
  // instead (frāter puerī = the boy's brother), so it only leads when it opens the
  // sentence or follows the verb.
  const flipGen = (bs: Block[]): Block[] => bs.map((b) => (b.role === 'acc' ? { ...b, words: [...b.words].reverse() } : b));
  const genFirstSafe = (bs: Block[]): boolean => {
    const i = bs.findIndex((b) => b.role === 'acc');
    return i === 0 || bs[i - 1].role === 'verb';
  };
  const arrangements = permutations(blocks).flatMap((p) => (owner && genFirstSafe(p) ? [p, flipGen(p)] : [p]));
  const others = [...new Set(arrangements.map(render))].filter((s) => s !== answer);
  const distractors = shuffle(others).slice(0, 2);
  if (distractors.length < 2) return null;

  const objectEn = owner ? `the ${english(owner)}’s ${english(object)}` : `the ${english(object)}`;
  const sentence = recipient
    ? `The ${english(subject)} ${verb.en} ${objectEn} to the ${english(recipient)}.`
    : `The ${english(subject)} ${verb.en} ${objectEn}.`;

  const breakdown = typical
    .map((b) =>
      b.role === 'acc' && owner
        ? `${b.words[0]} (accusative) ${b.words[1]} (genitive, after its noun)`
        : `${b.words[0]} (${ROLE_NAMES[b.role]})`,
    )
    .join(' → ');

  return {
    kind: 'mc',
    type: 'word-order',
    label: 'Word order',
    prompt: `${sentence}<div class="prompt-hint">All three say this, since the endings settle who does what. Which order would you most expect to read?</div>`,
    options: shuffle([answer, ...distractors]),
    answer,
    explanation: `Latin tends to run nominative → dative → accusative → verb, with a genitive right after its noun: ${breakdown}. That’s what to expect, not a rule. The endings decide the meaning, and authors move words for emphasis: amīcam Rūfīna videt, “It’s her friend that Rufina sees.”`,
    meta: { chapter: Math.max(...cast.map((c) => c.chapter), object.chapter, verb.chapter) },
  };
};

// A random shape first, then the others, so narrow gates still get a drill.
const makeWordOrder = (ctx: DrillContext): McDrill | null => {
  const dative = Math.random() < 0.6;
  const gen = Math.random() < 0.5;
  return build(ctx, dative, gen) ?? build(ctx, !dative, gen) ?? build(ctx, dative, !gen) ?? build(ctx, !dative, !gen);
};

export const wordOrderDrill: DrillType = { type: 'word-order', label: 'Word order', make: makeWordOrder };

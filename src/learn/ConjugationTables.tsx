import { NUMBERS } from '../data/nouns';
import {
  CONJUGATIONS,
  IRREGULAR_VERBS,
  MODEL_VERBS,
  PERSONS,
  TENSES,
  conjugationLabel,
  personLabels,
  tenseFrames,
  tenseNames,
  type Conjugation,
  type ModelVerb,
  type Tense,
} from '../data/verbs';

// Column headings for the irregulars, as in Suburani's table.
const IRREGULAR_HEADINGS: Record<string, string> = {
  sum: 'I am',
  possum: 'I am able',
  eo: 'I go',
  volo: 'I want',
  nolo: 'I don’t want',
  malo: 'I prefer',
  fero: 'I carry, bear',
};

const heading = (v: ModelVerb): { main: string; sub: string } =>
  v.conjugation === 'irr'
    ? { main: IRREGULAR_HEADINGS[v.id] ?? v.gloss, sub: v.forms.pres!.sg[1] }
    : { main: v.gloss, sub: `${conjugationLabel(v.conjugation)} conj.` };

function TenseTable({ verbs, tense }: { verbs: ModelVerb[]; tense: Tense }) {
  return (
    <div className="table-scroll">
      <table className="learn-table">
        <caption>
          <strong>{tenseNames[tense].toUpperCase()}</strong> ({tenseFrames[tense]}, etc.)
        </caption>
        <thead>
          <tr>
            <th aria-label="Person" />
            {verbs.map((v) => (
              <th key={v.id}>
                {heading(v).main}
                <span className="th-sub">{heading(v).sub}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {NUMBERS.flatMap((n) =>
            PERSONS.map((p) => (
              <tr key={`${n}${p}`}>
                <td>{personLabels[n][p]}</td>
                {verbs.map((v) => (
                  <td key={v.id} className="latin-form">
                    {v.forms[tense]?.[n][p] ?? '—'}
                  </td>
                ))}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

function OtherParts({ verbs }: { verbs: ModelVerb[] }) {
  const rows: Array<[label: string, get: (v: ModelVerb) => string | undefined]> = [
    ['infinitive (to …)', (v) => v.infinitive],
    ['command, singular', (v) => v.imperative?.sg],
    ['command, plural', (v) => v.imperative?.pl],
  ];
  return (
    <div className="table-scroll">
      <table className="learn-table">
        <caption>
          <strong>INFINITIVE AND IMPERATIVE</strong> (to call · call!)
        </caption>
        <thead>
          <tr>
            <th aria-label="Form" />
            {verbs.map((v) => (
              <th key={v.id}>{heading(v).main}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get]) => (
            <tr key={label}>
              <td>{label}</td>
              {verbs.map((v) => (
                <td key={v.id} className="latin-form">
                  {get(v) ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// A form split into its parts: stem · tense sign · personal ending. Each one joins
// back to a form in the model tables above.
function Parts({ parts }: { parts: string[] }) {
  return (
    <span className="latin verb-parts">
      {parts.map((part, i) => (
        <span key={i} className={i === 0 ? 'vp-stem' : i === parts.length - 1 && parts.length > 2 ? 'vp-ending' : 'vp-sign'}>
          {part}
        </span>
      ))}
    </span>
  );
}

const ENDINGS: Array<[label: string, ending: string]> = [
  ['I', '-ō / -m'],
  ['you (sing.)', '-s'],
  ['he, she, it', '-t'],
  ['we', '-mus'],
  ['you (pl.)', '-tis'],
  ['they', '-nt'],
];

const CONJ_FROM_INFINITIVE: Array<[ending: string, conj: string, example: string]> = [
  ['-āre', '1st', 'vocō, vocāre'],
  ['-ēre', '2nd', 'teneō, tenēre'],
  ['-ere', '3rd — or 3rd/4th if the first part ends in -iō', 'mittō, mittere · capiō, capere'],
  ['-īre', '4th', 'audiō, audīre'],
];

interface ConjugationTablesProps {
  openTenses: Set<Tense>;
  openConjugations: Set<Conjugation>;
}

// Unlike the declension tables, only open tenses and conjugations show: these are the
// charts Nae studies from for open-chart quizzes, so they match what class has covered.
export function ConjugationTables({ openTenses, openConjugations }: ConjugationTablesProps) {
  const tenses = TENSES.filter((t) => openTenses.has(t));
  const models = MODEL_VERBS.filter((v) => openConjugations.has(v.conjugation));
  const showIrregulars = openConjugations.has('irr');
  const closedConjugations = CONJUGATIONS.filter((c) => !openConjugations.has(c));

  return (
    <>
      <details className="learn-section">
        <summary>Verb endings and tense signs</summary>
        <div className="table-scroll">
          <table className="learn-table">
            <caption>
              <strong>PERSONAL ENDINGS</strong> — who is doing it. The same in every conjugation and tense on this page.
            </caption>
            <tbody>
              {ENDINGS.map(([label, ending]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="latin-form">{ending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="case-use-list verb-callouts">
          {openTenses.has('impf') && (
            <li>
              <strong>Imperfect: -ba-</strong> before the ending, in every conjugation:{' '}
              <Parts parts={['vocā', 'ba', 'm']} />, <Parts parts={['tenē', 'bā', 's']} />,{' '}
              <Parts parts={['mittē', 'ba', 't']} />, <Parts parts={['audiē', 'bā', 'mus']} />,{' '}
              <Parts parts={['capiē', 'ba', 'nt']} />.
            </li>
          )}
          {openTenses.has('fut') && (
            <>
              <li>
                <strong>Future, 1st and 2nd conjugations: -bō, -bi-, -bu-</strong> — <Parts parts={['vocā', 'bō']} />,{' '}
                <Parts parts={['vocā', 'bi', 't']} />, <Parts parts={['tenē', 'bi', 'mus']} />,{' '}
                <Parts parts={['tenē', 'bu', 'nt']} />.
              </li>
              <li>
                <strong>Future, 3rd, 4th and 3rd/4th: -a- for “I”, -ē- after that</strong> (short -e- before -t and
                -nt) — <Parts parts={['mitt', 'a', 'm']} />, <Parts parts={['mitt', 'ē', 's']} />,{' '}
                <Parts parts={['audi', 'e', 't']} />, <Parts parts={['capi', 'ē', 'mus']} />,{' '}
                <Parts parts={['audi', 'e', 'nt']} />.
              </li>
              <li>
                <strong>So the conjugation decides the tense.</strong> <span className="latin">tenet</span> (2nd) is
                present, “holds”, but <span className="latin">mittet</span> (3rd) is future, “will send”. In the 3rd
                conjugation only a vowel separates the two: <span className="latin">mittit</span> /{' '}
                <span className="latin">mittet</span>, <span className="latin">mittis</span> /{' '}
                <span className="latin">mittēs</span>.
              </li>
            </>
          )}
        </ul>

        <h3 className="case-use-heading">Principal parts</h3>
        <p className="learn-note">
          A verb is listed by its principal parts, the forms you need to build everything else. From ch.7 the vocab
          lists give three: <span className="latin">nārrō, nārrāre, nārrāvī</span> — “I tell, to tell, I told”.
          Ch.5–6 give the first two; Book 2 adds a fourth (<span className="latin">līberātus</span>, “freed”). The
          first two give the tenses on this page; the third gives the perfect, which class reaches in Module 5.
        </p>

        <div className="table-scroll">
          <table className="learn-table">
            <caption>
              <strong>FINDING THE CONJUGATION</strong> from the infinitive (the second principal part)
            </caption>
            <thead>
              <tr>
                <th>Infinitive ends</th>
                <th>Conjugation</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {CONJ_FROM_INFINITIVE.map(([ending, conj, example]) => (
                <tr key={ending}>
                  <td className="latin-form">{ending}</td>
                  <td>{conj}</td>
                  <td className="latin-form">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="learn-note">
          -ēre and -ere differ only by the macron. The first part breaks the tie: an -eō verb (teneō) is 2nd
          conjugation; mittō is 3rd.
        </p>
      </details>

      <details className="learn-section">
        <summary>
          Conjugation tables
          {closedConjugations.length > 0 && (
            <span className="locked-tag">
              🔒 hidden until class: {closedConjugations.map(conjugationLabel).join(', ')}
            </span>
          )}
        </summary>
        {models.length > 0 && tenses.map((t) => <TenseTable key={t} verbs={models} tense={t} />)}
        {models.length > 0 && <OtherParts verbs={models} />}
        {!tenses.length && <p className="learn-note">No tenses are open yet.</p>}
      </details>

      {showIrregulars && (
        <details className="learn-section">
          <summary>Irregular verbs</summary>
          {tenses.map((t) => (
            <TenseTable key={t} verbs={IRREGULAR_VERBS} tense={t} />
          ))}
          <OtherParts verbs={IRREGULAR_VERBS} />
          <p className="learn-note">
            Compounds follow the same pattern: <span className="latin">absum</span> like sum,{' '}
            <span className="latin">redeō</span> like eō, <span className="latin">offerō</span> like ferō.
          </p>
        </details>
      )}
    </>
  );
}

import { NUMBERS } from '../data/nouns';
import {
  CONJUGATION_FROM_INFINITIVE,
  CONJUGATIONS,
  FUTURE_LOOKALIKE_NOTE,
  INFINITIVE_TIEBREAK_NOTE,
  PERSONAL_ENDINGS,
  PRINCIPAL_PARTS_NOTE,
  TENSE_SIGNS,
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
import { VerbParts } from '../components/VerbParts';

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

// Renders a note's *Latin* in the serif Latin style and its **emphasis** in bold.
function Note({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) =>
        part.startsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : part.startsWith('*') ? (
          <span key={i} className="latin">
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

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
              {PERSONAL_ENDINGS.map(({ label, ending }) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="latin-form">{ending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="case-use-list verb-callouts">
          {TENSE_SIGNS.filter((t) => openTenses.has(t.tense)).map((t) => (
            <li key={t.heading}>
              <strong>{t.heading}</strong>
              {t.note && ` (${t.note})`} —{' '}
              {t.examples.map((e, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  <VerbParts {...e} />
                </span>
              ))}
              .
            </li>
          ))}
          {openTenses.has('fut') && (
            <li>
              <Note text={FUTURE_LOOKALIKE_NOTE} />
            </li>
          )}
        </ul>

        <h3 className="case-use-heading">Principal parts</h3>
        <p className="learn-note">
          <Note text={PRINCIPAL_PARTS_NOTE} />
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
              {CONJUGATION_FROM_INFINITIVE.map(({ ending, conjugation, example }) => (
                <tr key={ending}>
                  <td className="latin-form">{ending}</td>
                  <td>{conjugation}</td>
                  <td className="latin-form">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="learn-note">
          <Note text={INFINITIVE_TIEBREAK_NOTE} />
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

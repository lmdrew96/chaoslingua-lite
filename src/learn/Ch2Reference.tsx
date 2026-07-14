import { cases, caseNames, caseFunctions, declinedForm, nouns } from '../data/grammar/ch2';

export function Ch2Reference() {
  const paradigm = nouns.find((n) => n.id === 'ch2-porta') ?? nouns[0];
  const genderLabel = paradigm.gender === 'm' ? 'masc.' : 'fem.';

  return (
    <details className="learn-section" open>
      <summary>Ch. 2 — 1st Declension Nouns</summary>
      <table className="learn-table">
        <caption>
          {paradigm.gloss} (1st declension, {genderLabel})
        </caption>
        <thead>
          <tr>
            <th>Case</th>
            <th>Function</th>
            <th>Singular</th>
            <th>Plural</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c}>
              <td style={{ textTransform: 'capitalize' }}>{caseNames[c]}</td>
              <td>{caseFunctions[c]}</td>
              <td className="latin-form">{declinedForm(paradigm, c, 'sg')}</td>
              <td className="latin-form">{declinedForm(paradigm, c, 'pl')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

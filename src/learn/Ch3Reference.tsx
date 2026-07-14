import { cases, caseNames, declinedForm, nouns, adjectives, adjectiveForm } from '../data/grammar/ch3';

export function Ch3Reference() {
  const regular = nouns.find((n) => n.id === 'ch3-amicus') ?? nouns[0];
  const irregular = nouns.find((n) => n.id === 'ch3-ager');
  const magnus = adjectives.find((a) => a.id === 'ch2-magnus') ?? adjectives[0];

  return (
    <details className="learn-section" open>
      <summary>Ch. 3 — 2nd Declension Masc. Nouns &amp; Adjective Agreement</summary>

      <div className="table-scroll">
        <table className="learn-table">
          <caption>{regular.gloss} (2nd declension, masc., regular -us type)</caption>
          <thead>
            <tr>
              <th>Case</th>
              <th>Singular</th>
              <th>Plural</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c}>
                <td style={{ textTransform: 'capitalize' }}>{caseNames[c]}</td>
                <td className="latin-form">{declinedForm(regular, c, 'sg')}</td>
                <td className="latin-form">{declinedForm(regular, c, 'pl')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {irregular && (
        <div className="table-scroll">
          <table className="learn-table">
            <caption>
              {irregular.gloss} (2nd declension, masc., -er type — stem drops the "e": {irregular.nomSg}/{irregular.stem}-)
            </caption>
            <thead>
              <tr>
                <th>Case</th>
                <th>Singular</th>
                <th>Plural</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c}>
                  <td style={{ textTransform: 'capitalize' }}>{caseNames[c]}</td>
                  <td className="latin-form">{declinedForm(irregular, c, 'sg')}</td>
                  <td className="latin-form">{declinedForm(irregular, c, 'pl')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-scroll">
        <table className="learn-table">
          <caption>
            {magnus.stem}us, -a, -um ("{adjectives.find((a) => a.id === 'ch2-magnus')?.gloss}") — masculine agrees
            like amicus, feminine agrees like porta
          </caption>
          <thead>
            <tr>
              <th>Case</th>
              <th>Masc. sg / pl</th>
              <th>Fem. sg / pl</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c}>
                <td style={{ textTransform: 'capitalize' }}>{caseNames[c]}</td>
                <td className="latin-form">
                  {adjectiveForm(magnus, 'm', c, 'sg')} / {adjectiveForm(magnus, 'm', c, 'pl')}
                </td>
                <td className="latin-form">
                  {adjectiveForm(magnus, 'f', c, 'sg')} / {adjectiveForm(magnus, 'f', c, 'pl')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

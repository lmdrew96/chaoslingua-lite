import { conjugations, persons, personLabels, conjLabel, verbKeys } from '../data/grammar/ch1';

export function Ch1Reference() {
  return (
    <details className="learn-section" open>
      <summary>Ch. 1 — Present Active Verbs</summary>
      {verbKeys.map((verbKey) => {
        const verb = conjugations[verbKey];
        return (
          <table className="learn-table" key={verbKey}>
            <caption>
              {verb.gloss} ({conjLabel(verbKey)} conjugation)
            </caption>
            <thead>
              <tr>
                <th>Person</th>
                <th>Present active</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p) => (
                <tr key={p}>
                  <td>{personLabels[p]}</td>
                  <td className="latin-form">{verb.forms[p]}</td>
                </tr>
              ))}
              <tr>
                <td>Imperative (sg.)</td>
                <td className="latin-form">{verb.imperativeSg}</td>
              </tr>
              <tr>
                <td>Imperative (pl.)</td>
                <td className="latin-form">{verb.imperativePl}</td>
              </tr>
            </tbody>
          </table>
        );
      })}
    </details>
  );
}

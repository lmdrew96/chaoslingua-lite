import { cases, caseNames, declinedForm, neuterNouns, persons, personLabels, sumForms, sumEnglish, adjectives, adjectiveForm } from '../data/grammar/ch4';

export function Ch4Reference() {
  const donum = neuterNouns.find((n) => n.id === 'ch4-donum') ?? neuterNouns[0];
  const bonus = adjectives.find((a) => a.id === 'ch4-bonus') ?? adjectives[0];

  return (
    <details className="learn-section" open>
      <summary>Ch. 4 — 2nd Declension Neuters, sum, &amp; Predicate Nominative</summary>

      <table className="learn-table">
        <caption>{donum.gloss} (2nd declension, neuter — nominative and accusative are always identical)</caption>
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
              <td className="latin-form">{declinedForm(donum, c, 'sg')}</td>
              <td className="latin-form">{declinedForm(donum, c, 'pl')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="learn-table">
        <caption>sum, esse ("to be") — irregular, present indicative</caption>
        <thead>
          <tr>
            <th>Person</th>
            <th>Latin</th>
            <th>English</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((p) => (
            <tr key={p}>
              <td>{personLabels[p]}</td>
              <td className="latin-form">{sumForms[p]}</td>
              <td>{sumEnglish[p]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="learn-table">
        <caption>
          Predicate nominative: "puella est {adjectiveForm(bonus, 'f', 'nom', 'sg')}" (the girl is good) — {bonus.stem}
          us, -a, -um agreeing in the nominative for each gender
        </caption>
        <thead>
          <tr>
            <th>Gender</th>
            <th>Singular</th>
            <th>Plural</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Masculine</td>
            <td className="latin-form">{adjectiveForm(bonus, 'm', 'nom', 'sg')}</td>
            <td className="latin-form">{adjectiveForm(bonus, 'm', 'nom', 'pl')}</td>
          </tr>
          <tr>
            <td>Feminine</td>
            <td className="latin-form">{adjectiveForm(bonus, 'f', 'nom', 'sg')}</td>
            <td className="latin-form">{adjectiveForm(bonus, 'f', 'nom', 'pl')}</td>
          </tr>
          <tr>
            <td>Neuter</td>
            <td className="latin-form">{adjectiveForm(bonus, 'n', 'nom', 'sg')}</td>
            <td className="latin-form">{adjectiveForm(bonus, 'n', 'nom', 'pl')}</td>
          </tr>
        </tbody>
      </table>
    </details>
  );
}

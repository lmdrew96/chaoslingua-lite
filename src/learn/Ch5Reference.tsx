import { cases, caseNames, erAdjectiveForm, erAdjectives, wordOrderQuestions } from '../data/grammar/ch5';

export function Ch5Reference() {
  const liber = erAdjectives.find((a) => a.id === 'ch5-liber') ?? erAdjectives[0];
  const pulcher = erAdjectives.find((a) => a.id === 'ch5-pulcher') ?? erAdjectives[1];

  return (
    <details className="learn-section" open>
      <summary>Ch. 5 — -er Adjectives, Apposition, &amp; Word Order</summary>

      <div className="table-scroll">
        <table className="learn-table">
          <caption>
            liber, lībera, līberum ("free") — keeps the stem's "e" everywhere; masc. nom. sg. only differs by
            having no ending at all
          </caption>
          <thead>
            <tr>
              <th>Case</th>
              <th>Masc. sg.</th>
              <th>Fem. sg.</th>
              <th>Neut. sg.</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c}>
                <td style={{ textTransform: 'capitalize' }}>{caseNames[c]}</td>
                <td className="latin-form">{erAdjectiveForm(liber, 'm', c, 'sg')}</td>
                <td className="latin-form">{erAdjectiveForm(liber, 'f', c, 'sg')}</td>
                <td className="latin-form">{erAdjectiveForm(liber, 'n', c, 'sg')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-scroll">
        <table className="learn-table">
          <caption>
            pulcher, pulchra, pulchrum ("beautiful") — drops the "e" everywhere except the bare masc. nom. sg.
            itself (stem is pulchr-, not pulcher-)
          </caption>
          <thead>
            <tr>
              <th>Case</th>
              <th>Masc. sg.</th>
              <th>Fem. sg.</th>
              <th>Neut. sg.</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c}>
                <td style={{ textTransform: 'capitalize' }}>{caseNames[c]}</td>
                <td className="latin-form">{erAdjectiveForm(pulcher, 'm', c, 'sg')}</td>
                <td className="latin-form">{erAdjectiveForm(pulcher, 'f', c, 'sg')}</td>
                <td className="latin-form">{erAdjectiveForm(pulcher, 'n', c, 'sg')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '18px', fontSize: '0.95rem' }}>
        <strong>Apposition:</strong> a noun placed beside another to rename or describe it agrees with it in{' '}
        <em>case</em> — not necessarily gender or number. "Cicerō, cōnsul, ..." (Cicero, the consul, ...) — both
        nominative, even though "cōnsul" isn't declined the same way as "Cicerō."
      </p>

      <div className="table-scroll">
        <table className="learn-table">
          <caption>Word order — conceptual, not generated from declension data</caption>
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
            {wordOrderQuestions.map((q) => (
              <tr key={q.id}>
                <td>{q.prompt}</td>
                <td>{q.correct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

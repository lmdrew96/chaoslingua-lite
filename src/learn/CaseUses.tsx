import { caseUses, extendedCaseNames, locativeNote, vocativeNote, type ExtendedCase } from '../data/cases';

const ORDER: ExtendedCase[] = ['nom', 'gen', 'dat', 'acc', 'abl', 'voc', 'loc'];

export function CaseUses() {
  return (
    <details className="learn-section" open>
      <summary>Uses of the cases</summary>
      {ORDER.map((c) => (
        <div className="case-use-group" key={c}>
          <h3 className="case-use-heading">{extendedCaseNames[c]}</h3>
          <ul className="case-use-list">
            {caseUses[c].map((u) => (
              <li key={u.example}>
                <div>{u.use}</div>
                <div>
                  <span className="latin">{u.example}</span> — {u.translation}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="learn-note">
        <strong>Vocative:</strong> {vocativeNote}
      </p>
      <p className="learn-note">
        <strong>Locative:</strong> {locativeNote}
      </p>
    </details>
  );
}

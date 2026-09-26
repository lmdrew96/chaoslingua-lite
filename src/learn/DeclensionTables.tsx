import { CASES, DECLENSIONS, caseNames, genderNames, modelNounsFor, ordinal, tableGloss } from '../data/nouns';
import type { Declension, GNumber, ModelNoun } from '../data/nouns';

function ParadigmTable({ nouns, number }: { nouns: ModelNoun[]; number: GNumber }) {
  return (
    <div className="table-scroll">
      <table className="learn-table">
        <caption>{number === 'sg' ? 'Singular' : 'Plural'}</caption>
        <thead>
          <tr>
            <th>Case</th>
            {nouns.map((n) => (
              <th key={n.id}>
                {tableGloss[n.id] ?? n.gloss}
                <span className="th-sub">{genderNames[n.gender]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CASES.map((c) => (
            <tr key={c}>
              <td style={{ textTransform: 'capitalize' }}>{caseNames[c]}</td>
              {nouns.map((n) => (
                <td key={n.id} className="latin-form">
                  {n.forms[number][c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Disabled declensions stay readable here — only drills skip them.
export function DeclensionTables({ openDeclensions }: { openDeclensions: Set<Declension> }) {
  return (
    <>
      {DECLENSIONS.map((d) => {
        const nouns = modelNounsFor(d);
        const notes = nouns.flatMap((n) => (n.note ? [n.note] : []));
        return (
          <details className="learn-section" key={d}>
            <summary>
              {ordinal(d)} declension
              {!openDeclensions.has(d) && <span className="locked-tag">🔒 not in drills yet</span>}
            </summary>
            <ParadigmTable nouns={nouns} number="sg" />
            <ParadigmTable nouns={nouns} number="pl" />
            {notes.map((note) => (
              <p className="learn-note" key={note}>
                {note}
              </p>
            ))}
          </details>
        );
      })}
    </>
  );
}

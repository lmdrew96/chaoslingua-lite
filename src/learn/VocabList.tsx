import { ordinal } from '../data/nouns';
import { VOCAB_CHAPTERS, vocabByChapter, type VocabEntry } from '../data/vocab';

const GENDER_LABEL = { m: 'm.', f: 'f.', n: 'n.', mf: 'm.f.' } as const;

function headword(v: VocabEntry): string {
  if (v.pos !== 'Noun') return v.la;
  const parts = [v.la];
  if (v.principal) parts.push(v.principal);
  if (v.gender) parts.push(GENDER_LABEL[v.gender] + (v.pluralOnly ? 'pl.' : ''));
  return parts.join(', ');
}

interface VocabListProps {
  openChapters: Set<number>;
}

export function VocabList({ openChapters }: VocabListProps) {
  return (
    <details className="learn-section">
      <summary>Vocabulary by chapter</summary>
      {VOCAB_CHAPTERS.map((ch) => {
        const locked = !openChapters.has(ch);
        return (
          <details className="vocab-chapter" key={ch} open={!locked && ch === Math.max(...openChapters)}>
            <summary>
              Chapter {ch}
              {locked && <span className="locked-tag">🔒 not yet</span>}
            </summary>
            <div className="table-scroll">
              <table className="learn-table vocab-table">
                <tbody>
                  {vocabByChapter(ch).map((v) => (
                    <tr key={v.id}>
                      <td className="latin-form">{headword(v)}</td>
                      <td>
                        {v.en}
                        {v.declension && <span className="vocab-decl"> · {ordinal(v.declension)} decl.</span>}
                        {v.principalCase === 'gen' && v.chapter === 1 && (
                          <span className="vocab-decl"> · gen. from LATN 101 list</span>
                        )}
                        {v.irregular && <span className="vocab-decl"> · irregular</span>}
                        {v.unconfirmed && <div className="vocab-flag">⚠ Needs confirming: {v.unconfirmed}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        );
      })}
    </details>
  );
}

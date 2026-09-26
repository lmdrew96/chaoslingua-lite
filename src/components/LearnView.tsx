import { glossary } from '../learn/glossary';
import { CaseUses } from '../learn/CaseUses';
import { DeclensionTables } from '../learn/DeclensionTables';
import { VocabList } from '../learn/VocabList';

interface LearnViewProps {
  openChapters: Set<number>;
}

export function LearnView({ openChapters }: LearnViewProps) {
  return (
    <div className="card">
      <details className="learn-section" open>
        <summary>Grammar terms</summary>
        <dl className="glossary-list">
          {glossary.map((g) => (
            <div className="glossary-term" key={g.term}>
              <dt>{g.term}</dt>
              <dd>{g.definition}</dd>
            </div>
          ))}
        </dl>
      </details>
      <CaseUses />
      <DeclensionTables />
      <VocabList openChapters={openChapters} />
    </div>
  );
}

import type { Declension } from '../data/nouns';
import type { Tense, VerbGate } from '../data/verbs';
import { glossary } from '../learn/glossary';
import { CaseUses } from '../learn/CaseUses';
import { ConjugationTables } from '../learn/ConjugationTables';
import { DeclensionTables } from '../learn/DeclensionTables';
import { VocabList } from '../learn/VocabList';

interface LearnViewProps {
  openChapters: Set<number>;
  openDeclensions: Set<Declension>;
  openTenses: Set<Tense>;
  openConjugations: Set<VerbGate>;
}

export function LearnView({ openChapters, openDeclensions, openTenses, openConjugations }: LearnViewProps) {
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
      <DeclensionTables openDeclensions={openDeclensions} />
      <ConjugationTables openTenses={openTenses} openConjugations={openConjugations} />
      <VocabList openChapters={openChapters} />
    </div>
  );
}

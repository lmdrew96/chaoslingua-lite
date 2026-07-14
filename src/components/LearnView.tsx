import { glossary } from '../learn/glossary';
import { Ch1Reference } from '../learn/Ch1Reference';
import { Ch2Reference } from '../learn/Ch2Reference';

export function LearnView() {
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
      <Ch1Reference />
      <Ch2Reference />
    </div>
  );
}

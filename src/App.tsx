import { useState } from 'react';
import { useDrillSession } from './hooks/useDrillSession';
import { usePracticeFilter } from './hooks/usePracticeFilter';
import { StatsRow } from './components/StatsRow';
import { StreakPill } from './components/StreakPill';
import { DrillCard } from './components/DrillCard';
import { LearnView } from './components/LearnView';
import { PracticeFilter } from './components/PracticeFilter';

type View = 'drill' | 'learn';

function App() {
  const [view, setView] = useState<View>('drill');
  const { chapters, types, toggleChapter, toggleType, resetFilter } = usePracticeFilter();
  const { loading, stats, current, sessionGoal, handleAnswer, nextDrill, reset } = useDrillSession(chapters, types);

  return (
    <div className="wrap">
      <div className="top-row">
        <div>
          <h1>ChaosLingua Lite</h1>
          <div className="subtitle">Wheelock's Ch. 1-5 — verbs &amp; sum; 1st/2nd declension nouns, adjectives, apposition &amp; word order</div>
        </div>
        <StreakPill streak={stats.streak} />
      </div>

      <div className="tabs">
        <button
          className={`tab-btn${view === 'drill' ? ' active' : ''}`}
          onClick={() => setView('drill')}
        >
          Drill
        </button>
        <button
          className={`tab-btn${view === 'learn' ? ' active' : ''}`}
          onClick={() => setView('learn')}
        >
          Learn
        </button>
      </div>

      {view === 'learn' ? (
        <LearnView />
      ) : (
        <>
          <PracticeFilter
            chapters={chapters}
            types={types}
            onToggleChapter={toggleChapter}
            onToggleType={toggleType}
            onReset={resetFilter}
          />
          <StatsRow attempted={stats.attempted} correct={stats.correct} />

          {loading || !current ? (
            <div className="card">
              <div className="loading">Setting up your drill session…</div>
            </div>
          ) : (
            <DrillCard
              drill={current}
              attempted={stats.attempted}
              sessionGoal={sessionGoal}
              onAnswer={handleAnswer}
              onNext={nextDrill}
              onReset={reset}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;

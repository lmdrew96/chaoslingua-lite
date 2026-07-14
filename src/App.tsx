import { useDrillSession } from './hooks/useDrillSession';
import { StatsRow } from './components/StatsRow';
import { StreakPill } from './components/StreakPill';
import { DrillCard } from './components/DrillCard';

function App() {
  const { loading, stats, current, sessionGoal, handleAnswer, nextDrill, reset } = useDrillSession();

  return (
    <div className="wrap">
      <div className="top-row">
        <div>
          <h1>ChaosLingua Lite</h1>
          <div className="subtitle">Wheelock's Ch. 1-2 — present active &amp; imperative verbs; 1st declension nouns</div>
        </div>
        <StreakPill streak={stats.streak} />
      </div>

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
    </div>
  );
}

export default App;

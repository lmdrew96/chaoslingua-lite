import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { DECLENSIONS } from './data/nouns';
import type { DrillContext } from './drills';
import { useAccount } from './hooks/useAccount';
import { useDrillSession } from './hooks/useDrillSession';
import { usePracticeFilter } from './hooks/usePracticeFilter';
import { StatsRow } from './components/StatsRow';
import { StreakPill } from './components/StreakPill';
import { DrillCard } from './components/DrillCard';
import { LearnView } from './components/LearnView';
import { PracticeFilter } from './components/PracticeFilter';
import { AccountPanel } from './components/AccountPanel';

type View = 'drill' | 'learn';

const DRILL_CONTEXT: DrillContext = { declensions: new Set(DECLENSIONS), chapters: new Set() };

const MIN_WEAK_SPOT_ATTEMPTS = 3;
const MAX_WEAK_SPOT_TYPES = 3;

function App() {
  const [view, setView] = useState<View>('drill');
  const { account, token, loading: accountLoading, busy, error, createAccount, joinAccount, signOut } = useAccount();
  const { types, toggleType, resetFilter, applyFilter } = usePracticeFilter();
  const { loading, stats, current, sessionGoal, handleAnswer, nextDrill, reset } = useDrillSession(
    types,
    DRILL_CONTEXT,
    account?.userId ?? null,
  );

  const weakAreas = useQuery(api.attempts.getWeakAreas, account ? { userId: account.userId } : 'skip');
  const qualifyingWeakAreas = (weakAreas ?? [])
    .filter((w) => w.attempted >= MIN_WEAK_SPOT_ATTEMPTS)
    .slice(0, MAX_WEAK_SPOT_TYPES);

  const focusWeakSpots = () => {
    applyFilter([...new Set(qualifyingWeakAreas.map((w) => w.drillType))]);
  };

  return (
    <div className="wrap">
      <div className="top-row">
        <div>
          <h1>ChaosLingua Lite</h1>
          <div className="subtitle">Suburani — the five noun declensions &amp; what each case does</div>
        </div>
        <StreakPill streak={stats.streak} />
      </div>

      <AccountPanel
        account={account}
        token={token}
        loading={accountLoading}
        busy={busy}
        error={error}
        onCreate={createAccount}
        onJoin={joinAccount}
        onSignOut={signOut}
      />

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
            types={types}
            onToggleType={toggleType}
            onReset={resetFilter}
            weakSpotsAvailable={qualifyingWeakAreas.length > 0}
            onFocusWeakSpots={account ? focusWeakSpots : null}
          />
          <StatsRow attempted={stats.attempted} correct={stats.correct} />

          {loading ? (
            <div className="card">
              <div className="loading">Setting up your drill session…</div>
            </div>
          ) : !current ? (
            <div className="card">
              <div className="loading">No drills available yet — the Learn tab has the declension tables in the meantime.</div>
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

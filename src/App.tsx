import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAccount } from './hooks/useAccount';
import { useCourse } from './hooks/useCourse';
import { useDrillSession } from './hooks/useDrillSession';
import { usePracticeFilter } from './hooks/usePracticeFilter';
import { useSpeedMode } from './hooks/useSpeedMode';
import { StatsRow } from './components/StatsRow';
import { StreakPill } from './components/StreakPill';
import { DrillCard } from './components/DrillCard';
import { LearnView } from './components/LearnView';
import { PracticeFilter } from './components/PracticeFilter';
import { AccountPanel } from './components/AccountPanel';

type View = 'drill' | 'learn';

const MIN_WEAK_SPOT_ATTEMPTS = 3;
const MAX_WEAK_SPOT_TYPES = 3;

function App() {
  const [view, setView] = useState<View>('drill');
  const { account, token, loading: accountLoading, busy, error, createAccount, joinAccount, signOut } = useAccount();
  const { ctx, toggleChapter, toggleDeclension, followSchedule, customized } = useCourse();
  const { types, toggleType, resetFilter, applyFilter } = usePracticeFilter();
  const { loading, stats, current, drillSeq, sessionGoal, handleAnswer, nextDrill, reset } = useDrillSession(
    types,
    ctx,
    account?.userId ?? null,
  );

  const speed = useSpeedMode();

  const weakAreas = useQuery(api.attempts.getWeakAreas, account ? { userId: account.userId } : 'skip');
  const qualifyingWeakAreas = (weakAreas ?? [])
    .filter((w) => w.attempted >= MIN_WEAK_SPOT_ATTEMPTS)
    .slice(0, MAX_WEAK_SPOT_TYPES);

  const focusWeakSpots = () => {
    applyFilter([...new Set(qualifyingWeakAreas.map((w) => w.drillType))]);
  };

  return (
    <div className="layout">
      <aside className="rail">
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

        {view === 'drill' && (
          <>
            <PracticeFilter
              ctx={ctx}
              onToggleChapter={toggleChapter}
              onToggleDeclension={toggleDeclension}
              onFollowSchedule={followSchedule}
              customized={customized}
              types={types}
              onToggleType={toggleType}
              onReset={resetFilter}
              weakSpotsAvailable={qualifyingWeakAreas.length > 0}
              onFocusWeakSpots={account ? focusWeakSpots : null}
              speedMode={speed.enabled}
              onToggleSpeedMode={speed.toggle}
            />
            <StatsRow attempted={stats.attempted} correct={stats.correct} />
          </>
        )}
      </aside>

      {/* data-mark is the giant faint capital drawn behind the card (see .stage::before). */}
      <main className="stage" data-mark={view === 'learn' ? 'L' : (current?.label.charAt(0) ?? 'C')}>
        {view === 'learn' ? (
          <LearnView openChapters={ctx.chapters} openDeclensions={ctx.declensions} />
        ) : loading ? (
          <div className="card">
            <div className="loading">Setting up your drill session…</div>
          </div>
        ) : !current ? (
          <div className="card">
            <div className="loading">Nothing to drill with these settings — turn on another declension or chapter in the practice settings.</div>
          </div>
        ) : (
          <DrillCard
            key={drillSeq}
            drill={current}
            attempted={stats.attempted}
            sessionGoal={sessionGoal}
            onAnswer={handleAnswer}
            onNext={nextDrill}
            onReset={reset}
            speed={speed.enabled ? { stats: speed.stats, onResult: speed.record } : null}
          />
        )}

        <footer className="credits">
          Grammar and vocabulary follow <em>Suburani</em> (Hands Up Education). Tables for vocabulary nouns come from{' '}
          <a href="https://en.wiktionary.org" target="_blank" rel="noreferrer">Wiktionary</a> via{' '}
          <a href="https://kaikki.org" target="_blank" rel="noreferrer">kaikki.org</a>, licensed{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>.
        </footer>
      </main>
    </div>
  );
}

export default App;

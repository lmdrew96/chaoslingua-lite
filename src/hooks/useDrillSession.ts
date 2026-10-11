import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { makeDrill } from '../drills';
import type { AttemptMeta, Drill, DrillContext } from '../drills/types';

export interface SessionStats {
  attempted: number;
  correct: number;
  streak: number;
}

const SESSION_GOAL = 12;
const ZERO_STATS: SessionStats = { attempted: 0, correct: 0, streak: 0 };

export function useDrillSession(types: Set<string>, ctx: DrillContext, userId: Id<'users'> | null) {
  // Stats belong to the signed-in account. Signed out, they start at zero and aren't saved.
  const progress = useQuery(api.progress.getProgress, userId ? { userId } : 'skip');
  const saveProgress = useMutation(api.progress.saveProgress);
  const logAttempt = useMutation(api.attempts.logTutoringAttempt);

  const [stats, setStats] = useState<SessionStats>(ZERO_STATS);
  // Whose stats are on screen: undefined until the first load, null for signed out.
  const [statsOwner, setStatsOwner] = useState<Id<'users'> | null | undefined>(undefined);
  const [current, setCurrent] = useState<Drill | null>(null);
  // Bumped on every new drill so the card can remount even when two drills look alike.
  const [drillSeq, setDrillSeq] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    setCurrent(makeDrill(types, ctx));
    setDrillSeq((n) => n + 1);
  }, [types, ctx]);

  // Swap stats when the account changes: log out → zero, log in → that account's.
  useEffect(() => {
    if (userId === null) {
      if (statsOwner !== null) {
        setStats(ZERO_STATS);
        setStatsOwner(null);
      }
      return;
    }
    if (progress && statsOwner !== userId) {
      setStats({ attempted: progress.attempted, correct: progress.correct, streak: progress.streak });
      setStatsOwner(userId);
    }
  }, [userId, progress, statsOwner]);

  const handleAnswer = (isCorrect: boolean, meta?: AttemptMeta) => {
    const next: SessionStats = {
      attempted: stats.attempted + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? stats.streak + 1 : 0,
    };
    setStats(next);
    if (userId) {
      void saveProgress({ userId, ...next });
      if (current) void logAttempt({ userId, drillType: current.type, ...(meta ?? current.meta), correct: isCorrect });
    }
  };

  const nextDrill = () => {
    setCurrent(makeDrill(types, ctx));
    setDrillSeq((n) => n + 1);
  };

  const reset = () => {
    setStats(ZERO_STATS);
    if (userId) void saveProgress({ userId, ...ZERO_STATS });
    nextDrill();
  };

  return {
    loading: statsOwner !== userId,
    stats,
    current,
    drillSeq,
    sessionGoal: SESSION_GOAL,
    handleAnswer,
    nextDrill,
    reset,
  };
}

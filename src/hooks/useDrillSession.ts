import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { makeDrill } from '../drills';
import type { GeneratedDrill } from '../drills/types';

export interface SessionStats {
  attempted: number;
  correct: number;
  streak: number;
}

const SESSION_GOAL = 12;
const ZERO_STATS: SessionStats = { attempted: 0, correct: 0, streak: 0 };

export function useDrillSession(chapters: Set<number>, types: Set<string>, userId: Id<'users'> | null) {
  const progress = useQuery(api.progress.getProgress);
  const saveProgress = useMutation(api.progress.saveProgress);
  const logAttempt = useMutation(api.attempts.logTutoringAttempt);

  const [stats, setStats] = useState<SessionStats>(ZERO_STATS);
  const [current, setCurrent] = useState<GeneratedDrill | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (progress && !hydrated.current) {
      hydrated.current = true;
      setStats({ attempted: progress.attempted, correct: progress.correct, streak: progress.streak });
      setCurrent(makeDrill({ chapters, types }));
    }
  }, [progress, chapters, types]);

  const handleAnswer = (isCorrect: boolean) => {
    const next: SessionStats = {
      attempted: stats.attempted + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? stats.streak + 1 : 0,
    };
    setStats(next);
    void saveProgress(next);
    if (userId && current) {
      void logAttempt({ userId, drillType: current.type, chapter: current.chapter, correct: isCorrect });
    }
  };

  const nextDrill = () => setCurrent(makeDrill({ chapters, types }));

  const reset = () => {
    setStats(ZERO_STATS);
    void saveProgress(ZERO_STATS);
    setCurrent(makeDrill({ chapters, types }));
  };

  return {
    loading: !hydrated.current,
    stats,
    current,
    sessionGoal: SESSION_GOAL,
    handleAnswer,
    nextDrill,
    reset,
  };
}

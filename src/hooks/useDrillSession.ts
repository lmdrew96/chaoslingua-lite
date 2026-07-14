import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { makeDrill } from '../drills';
import type { Drill } from '../drills/types';

export interface SessionStats {
  attempted: number;
  correct: number;
  streak: number;
}

const SESSION_GOAL = 12;
const ZERO_STATS: SessionStats = { attempted: 0, correct: 0, streak: 0 };

export function useDrillSession() {
  const progress = useQuery(api.progress.getProgress);
  const saveProgress = useMutation(api.progress.saveProgress);

  const [stats, setStats] = useState<SessionStats>(ZERO_STATS);
  const [current, setCurrent] = useState<Drill | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (progress && !hydrated.current) {
      hydrated.current = true;
      setStats({ attempted: progress.attempted, correct: progress.correct, streak: progress.streak });
      setCurrent(makeDrill());
    }
  }, [progress]);

  const handleAnswer = (isCorrect: boolean) => {
    const next: SessionStats = {
      attempted: stats.attempted + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? stats.streak + 1 : 0,
    };
    setStats(next);
    void saveProgress(next);
  };

  const nextDrill = () => setCurrent(makeDrill());

  const reset = () => {
    setStats(ZERO_STATS);
    void saveProgress(ZERO_STATS);
    setCurrent(makeDrill());
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

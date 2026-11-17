import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import type { ExerciseConfig, ExerciseResult } from '../../lib/types';
import { Exercise } from './Exercise';
import styles from './shell.module.css';

export interface LessonResult {
  /** Number of exercises in the lesson. */
  total: number;
  /** Exercises answered wrong at least once (each wrong try counts). */
  wrongAnswers: number;
  /** 0–100. */
  accuracy: number;
}

interface LessonProps {
  exercises: ExerciseConfig[];
  onComplete?: (result: LessonResult) => void;
}

/**
 * Runs a list of exercises in order with a progress bar. Exercises answered
 * wrong come back at the end until they are answered right.
 */
export function Lesson({ exercises, onComplete }: LessonProps) {
  const [queue, setQueue] = useState(exercises);
  const [position, setPosition] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const lastResult = useRef<ExerciseResult | null>(null);

  const finished = position >= queue.length;
  const total = exercises.length;
  const result: LessonResult = {
    total,
    wrongAnswers,
    accuracy: Math.round((total / Math.max(total + wrongAnswers, 1)) * 100),
  };

  const done = useRef(onComplete);
  done.current = onComplete;
  useEffect(() => {
    if (finished) done.current?.(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const handleResult = (r: ExerciseResult) => {
    lastResult.current = r;
    if (!r.correct) setWrongAnswers((n) => n + 1);
  };

  const handleContinue = () => {
    if (lastResult.current?.correct) setCompleted((n) => n + 1);
    else setQueue((q) => [...q, q[position]]);
    lastResult.current = null;
    setPosition((p) => p + 1);
  };

  const restart = () => {
    setQueue(exercises);
    setPosition(0);
    setCompleted(0);
    setWrongAnswers(0);
  };

  return (
    <div className={styles.lesson}>
      <div className={styles.progressRow}>
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completed}
        >
          <div className={styles.progressBar} style={{ width: `${(completed / total) * 100}%` }} />
        </div>
        <span className={styles.progressCount}>
          {completed} / {total}
        </span>
      </div>

      {finished ? (
        <div className={styles.summary}>
          <span className={styles.summaryEmoji} role="img" aria-label="Celebration">
            🎉
          </span>
          <h2>Lesson complete!</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <b>{result.accuracy}%</b>
              <span>accuracy</span>
            </div>
            <div className={styles.stat}>
              <b>{total}</b>
              <span>exercises</span>
            </div>
          </div>
          <button type="button" className={cx(styles.button, styles.primary)} onClick={restart}>
            Practice again
          </button>
        </div>
      ) : (
        <Exercise
          key={position}
          config={queue[position]}
          onResult={handleResult}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}

import { useEffect, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import type { ExerciseStatus } from '../../lib/types';
import styles from './shell.module.css';

interface ExerciseFrameProps {
  instruction?: string;
  status: ExerciseStatus;
  /** Enables the main button while the exercise is still open. */
  canCheck?: boolean;
  onCheck?: () => void;
  /** Label of the main button before grading. Default: "Check". */
  checkLabel?: string;
  /** Hide the main button before grading (exercises that grade themselves). */
  hideCheck?: boolean;
  onContinue?: () => void;
  /** Shown after a wrong answer. */
  correctAnswer?: string;
  /** Replaces the default "Correct!" message. */
  successMessage?: string;
  children: ReactNode;
}

/** Shared layout: instruction, body, and the Check / feedback / Continue footer. */
export function ExerciseFrame({
  instruction,
  status,
  canCheck = false,
  onCheck,
  checkLabel = 'Check',
  hideCheck = false,
  onContinue,
  correctAnswer,
  successMessage = 'Correct!',
  children,
}: ExerciseFrameProps) {
  // Enter = Check / Continue, unless a button already has focus (it handles Enter itself).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.target instanceof HTMLButtonElement) return;
      if (status !== 'idle') onContinue?.();
      else if (canCheck && !hideCheck) onCheck?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, canCheck, hideCheck, onCheck, onContinue]);

  return (
    <section className={styles.frame}>
      {instruction && <h2 className={styles.instruction}>{instruction}</h2>}
      <div className={styles.body}>{children}</div>

      <footer className={cx(styles.footer, styles[`footer-${status}`])}>
        {status === 'idle' ? (
          !hideCheck && (
            <button
              type="button"
              className={cx(styles.button, styles.primary)}
              disabled={!canCheck}
              onClick={onCheck}
            >
              {checkLabel}
            </button>
          )
        ) : (
          <>
            <div className={styles.feedback} role="status">
              <strong>{status === 'correct' ? successMessage : 'Not quite'}</strong>
              {status === 'incorrect' && correctAnswer && (
                <span>
                  Correct answer: <span lang="zh-CN">{correctAnswer}</span>
                </span>
              )}
            </div>
            <button
              type="button"
              className={cx(styles.button, status === 'correct' ? styles.primary : styles.danger)}
              onClick={onContinue}
              autoFocus
            >
              Continue
            </button>
          </>
        )}
      </footer>
    </section>
  );
}

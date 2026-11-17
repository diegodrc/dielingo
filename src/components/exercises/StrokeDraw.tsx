import HanziWriter from 'hanzi-writer';
import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import type { ExerciseProps, ExerciseStatus, StrokeDrawConfig } from '../../lib/types';
import { AudioButton } from '../primitives/AudioButton';
import { SpeakableHanzi } from '../primitives/HanziText';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import shell from '../shell/shell.module.css';
import styles from './exercises.module.css';

const SIZE = 260;

const GUIDES = {
  full: { showOutline: true, outlineColor: '#cfd6de', showHintAfterMisses: 1 },
  faint: { showOutline: true, outlineColor: '#eef1f4', showHintAfterMisses: 3 },
  none: { showOutline: false, outlineColor: '#eef1f4', showHintAfterMisses: false },
} as const;

/**
 * Trace a character stroke by stroke, in the right order and direction.
 * Stroke data and recognition come from hanzi-writer; `guide` controls how
 * much help the learner gets.
 */
export function StrokeDraw({ config, onResult, onContinue }: ExerciseProps<StrokeDrawConfig>) {
  const target = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);
  const startQuiz = useRef<() => void>(() => {});
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const [strokes, setStrokes] = useState({ done: 0, total: 0 });
  const [loadError, setLoadError] = useState(false);
  const [demo, setDemo] = useState(false);
  const guide = config.guide ?? 'full';

  // Latest callback without re-creating the writer.
  const report = useRef(onResult);
  report.current = onResult;

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let cancelled = false;

    const instance = HanziWriter.create(element, config.character, {
      width: SIZE,
      height: SIZE,
      padding: 16,
      showCharacter: false,
      strokeColor: '#2b3440',
      drawingColor: '#1c8fd6',
      highlightColor: '#2f9e6b',
      drawingWidth: 6,
      highlightOnComplete: true,
      ...GUIDES[guide],
      onLoadCharDataError: () => !cancelled && setLoadError(true),
    });
    writer.current = instance;

    startQuiz.current = () => {
      setStrokes((s) => ({ ...s, done: 0 }));
      void instance.quiz({
        onCorrectStroke: (data) => {
          if (cancelled) return;
          setStrokes({
            done: data.strokeNum + 1,
            total: data.strokeNum + 1 + data.strokesRemaining,
          });
        },
        onComplete: (summary) => {
          if (cancelled) return;
          setStatus('correct');
          report.current?.({ correct: true, mistakes: summary.totalMistakes });
        },
      });
    };
    startQuiz.current();

    return () => {
      cancelled = true;
      instance.cancelQuiz();
      element.replaceChildren();
    };
  }, [config.character, guide]);

  const showMe = async () => {
    const instance = writer.current;
    if (!instance || demo) return;
    setDemo(true);
    instance.cancelQuiz();
    await instance.animateCharacter();
    await instance.hideCharacter();
    setDemo(false);
    startQuiz.current();
  };

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      hideCheck
      onContinue={onContinue}
      successMessage="Nicely drawn!"
    >
      <div className={styles.strokeHeader}>
        <AudioButton text={config.character} autoPlay />
        <SpeakableHanzi hanzi={config.character} pinyin={config.pinyin} />
        {config.meaning && <span className={styles.meaning}>{config.meaning}</span>}
      </div>

      <div className={styles.strokeBoard}>
        <div
          ref={target}
          className={styles.strokeCanvas}
          style={{ width: SIZE, height: SIZE }}
          role="img"
          aria-label={`Drawing area for ${config.character}`}
        />
      </div>

      {loadError ? (
        <p className={styles.notice} role="alert">
          Could not load the stroke data for “{config.character}”. Check your internet connection.
        </p>
      ) : (
        <div className={styles.strokeFooter}>
          <span className={styles.muted}>
            {strokes.total > 0
              ? `Stroke ${Math.min(strokes.done + 1, strokes.total)} of ${strokes.total}`
              : 'Draw the first stroke'}
          </span>
          {status === 'idle' && guide !== 'none' && (
            <button
              type="button"
              className={cx(shell.button, shell.secondary)}
              onClick={showMe}
              disabled={demo}
            >
              Show me
            </button>
          )}
        </div>
      )}
    </ExerciseFrame>
  );
}

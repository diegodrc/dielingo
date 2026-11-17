import { useState } from 'react';
import { cx } from '../../lib/cx';
import { applyTone, stripTones, syllables, toneOf } from '../../lib/pinyin';
import type { ExerciseProps, ExerciseStatus, TonesConfig } from '../../lib/types';
import { AudioButton } from '../primitives/AudioButton';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

/** Tone choices in order: 1–4, then the neutral tone (0). */
const TONES = [1, 2, 3, 4, 0];
const TONE_NAMES = ['neutral tone', 'first tone', 'second tone', 'third tone', 'fourth tone'];

/** Hear a word and pick the tone of each syllable. */
export function Tones({ config, onResult, onContinue }: ExerciseProps<TonesConfig>) {
  const parts = syllables(config.pinyin).map((s) => ({ base: stripTones(s), tone: toneOf(s) }));
  const [picked, setPicked] = useState<(number | null)[]>(() => parts.map(() => null));
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const speak = config.speak !== false;

  const pick = (i: number, tone: number) => {
    if (status !== 'idle') return;
    setPicked((current) => current.map((t, j) => (j === i ? tone : t)));
  };

  const check = () => {
    if (status !== 'idle' || picked.some((t) => t === null)) return;
    const correct = parts.every((p, i) => p.tone === picked[i]);
    setStatus(correct ? 'correct' : 'incorrect');
    onResult?.({ correct });
  };

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      canCheck={picked.every((t) => t !== null)}
      onCheck={check}
      onContinue={onContinue}
      correctAnswer={config.pinyin}
    >
      <div className={styles.prompt}>
        <span className={styles.toneWord}>
          {speak && <AudioButton text={config.word} autoPlay />}
          <span lang="zh-CN">{config.word}</span>
          {config.meaning && <span className={styles.meaning}>{config.meaning}</span>}
        </span>
      </div>

      <div className={styles.toneRows}>
        {parts.map((part, i) => {
          const chosen = picked[i];
          const graded = status !== 'idle';
          return (
            <div key={i} className={styles.toneRow} role="radiogroup" aria-label={`Tone of syllable ${i + 1}, ${part.base}`}>
              <span className={styles.toneIndex} aria-hidden="true">
                {[...config.word][i] ?? ''}
              </span>
              {TONES.map((tone) => {
                const isChosen = chosen === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    role="radio"
                    aria-checked={isChosen}
                    aria-label={`${applyTone(part.base, tone)}, ${TONE_NAMES[tone]}`}
                    disabled={graded}
                    className={cx(
                      styles.toneChip,
                      isChosen && !graded && styles.toneChosen,
                      graded && tone === part.tone && styles.toneRight,
                      graded && isChosen && tone !== part.tone && styles.toneWrong,
                    )}
                    onClick={() => pick(i, tone)}
                  >
                    {applyTone(part.base, tone)}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </ExerciseFrame>
  );
}

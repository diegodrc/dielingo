import { useMemo, useState } from 'react';
import { cx } from '../../lib/cx';
import { isChinese } from '../../lib/content';
import { useSettings, useShuffled } from '../../lib/settings';
import { speak } from '../../lib/speech';
import type { ExerciseProps, ExerciseStatus, FillBlanksConfig } from '../../lib/types';
import { ContentView } from '../primitives/ContentView';
import { HanziText } from '../primitives/HanziText';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

interface Tile {
  id: number;
  text: string;
}

/**
 * A sentence or short text with several gaps. Tapping a word fills the next
 * empty gap; tapping a filled gap gives the word back.
 */
export function FillBlanks({ config, onResult, onContinue }: ExerciseProps<FillBlanksConfig>) {
  const { settings } = useSettings();
  const tiles = useMemo<Tile[]>(
    () => [...config.answers, ...(config.distractors ?? [])].map((text, id) => ({ id, text })),
    [config.answers, config.distractors],
  );
  const bank = useShuffled(tiles, config.shuffle);
  const [fills, setFills] = useState<(Tile | null)[]>(() => config.answers.map(() => null));
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const open = status === 'idle';

  const place = (tile: Tile) => {
    if (!open || !fills.includes(null)) return;
    setFills((current) => {
      const gap = current.findIndex((f) => f === null);
      return gap === -1 ? current : current.map((f, i) => (i === gap ? tile : f));
    });
    if (isChinese(tile.text)) speak(tile.text, { rate: settings.speechRate });
  };

  const clear = (index: number) => {
    if (open) setFills((current) => current.map((f, i) => (i === index ? null : f)));
  };

  const check = () => {
    if (!open || fills.some((f) => f === null)) return;
    const correct = fills.every((f, i) => f?.text === config.answers[i]);
    setStatus(correct ? 'correct' : 'incorrect');
    onResult?.({ correct });
  };

  let blank = 0;
  const correctText = config.sentence.tokens
    .map((t) => (t.blank ? config.answers[blank++] : t.hanzi))
    .join(config.answers.some(isChinese) ? '' : ' ');

  const face = (text: string) =>
    isChinese(text) ? <HanziText hanzi={text} pinyin={config.pinyin?.[text]} /> : text;

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      canCheck={fills.every((f) => f !== null)}
      onCheck={check}
      onContinue={onContinue}
      correctAnswer={correctText}
    >
      {config.prompt && (
        <div className={styles.fillContext}>
          <ContentView content={config.prompt} />
        </div>
      )}

      <div className={styles.fillSentence}>
        <ContentView
          content={config.sentence}
          renderBlank={(i) => {
            const tile = fills[i];
            const graded = !open && tile;
            return (
              <button
                type="button"
                className={cx(
                  styles.gap,
                  tile && styles.gapFilled,
                  graded && (tile.text === config.answers[i] ? styles.gapRight : styles.gapWrong),
                )}
                disabled={!open || !tile}
                onClick={() => clear(i)}
                aria-label={tile ? `Gap ${i + 1}: ${tile.text}. Tap to remove` : `Gap ${i + 1}, empty`}
              >
                {tile ? face(tile.text) : ' '}
              </button>
            );
          }}
        />
      </div>

      <div className={styles.bank} aria-label="Word bank" role="group">
        {bank.map((tile) => {
          const used = fills.some((f) => f?.id === tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              className={cx(styles.tile, used && styles.tileUsed)}
              disabled={used || !open}
              aria-hidden={used}
              onClick={() => place(tile)}
            >
              {face(tile.text)}
            </button>
          );
        })}
      </div>
    </ExerciseFrame>
  );
}

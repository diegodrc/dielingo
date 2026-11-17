import { useMemo, useState } from 'react';
import { cx } from '../../lib/cx';
import { isChinese, isPinyinPrompt, tapToSpeakEnabled } from '../../lib/content';
import { gradeWordBank, joinTiles } from '../../lib/grading';
import { TapToSpeakContext, useSettings, useShuffled } from '../../lib/settings';
import { speak } from '../../lib/speech';
import type { ExerciseProps, ExerciseStatus, WordBankConfig } from '../../lib/types';
import { ContentView } from '../primitives/ContentView';
import { HanziText } from '../primitives/HanziText';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

interface Tile {
  id: number;
  text: string;
}

/**
 * Build a sentence by tapping word tiles. The prompt can be English text, a
 * Chinese sentence with hints, or audio only; the tiles can be Chinese or
 * English. Distractor tiles are mixed into the bank.
 */
export function WordBank({ config, onResult, onContinue }: ExerciseProps<WordBankConfig>) {
  const { settings } = useSettings();
  const allTiles = useMemo<Tile[]>(
    () => [...config.answer, ...(config.distractors ?? [])].map((text, id) => ({ id, text })),
    [config.answer, config.distractors],
  );
  const bank = useShuffled(allTiles, config.shuffle);
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const open = status === 'idle';
  const tapToSpeak = tapToSpeakEnabled(config);
  // When the prompt is the pinyin, pinyin on the tiles would be the answer.
  const tilePinyin = isPinyinPrompt(config.prompt) ? undefined : config.pinyin;

  const place = (tile: Tile) => {
    if (!open) return;
    setPlaced((tiles) => [...tiles, tile]);
    if (tapToSpeak && isChinese(tile.text)) speak(tile.text, { rate: settings.speechRate });
  };

  const remove = (tile: Tile) => {
    if (open) setPlaced((tiles) => tiles.filter((t) => t.id !== tile.id));
  };

  const check = () => {
    if (!open || placed.length === 0) return;
    const correct = gradeWordBank(
      config,
      placed.map((t) => t.text),
    );
    setStatus(correct ? 'correct' : 'incorrect');
    onResult?.({ correct });
  };

  const face = (tile: Tile) =>
    isChinese(tile.text) ? (
      <HanziText hanzi={tile.text} pinyin={tilePinyin?.[tile.text]} />
    ) : (
      tile.text
    );

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      canCheck={placed.length > 0}
      onCheck={check}
      onContinue={onContinue}
      correctAnswer={joinTiles(config.answer)}
    >
      <div className={styles.prompt}>
        <TapToSpeakContext.Provider value={tapToSpeak}>
          <ContentView content={config.prompt} />
        </TapToSpeakContext.Provider>
      </div>

      <div className={styles.answerArea} aria-label="Your answer" role="group">
        {placed.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={styles.tile}
            disabled={!open}
            onClick={() => remove(tile)}
          >
            {face(tile)}
          </button>
        ))}
      </div>

      <div className={styles.bank} aria-label="Word bank" role="group">
        {bank.map((tile) => {
          const used = placed.some((t) => t.id === tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              className={cx(styles.tile, used && styles.tileUsed)}
              disabled={used || !open}
              aria-hidden={used}
              onClick={() => place(tile)}
            >
              {face(tile)}
            </button>
          );
        })}
      </div>
    </ExerciseFrame>
  );
}

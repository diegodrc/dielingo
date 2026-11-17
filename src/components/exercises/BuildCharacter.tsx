import { useMemo, useState } from 'react';
import { cx } from '../../lib/cx';
import { useSettings, useShuffled } from '../../lib/settings';
import { speak } from '../../lib/speech';
import type { BuildCharacterConfig, ExerciseProps, ExerciseStatus } from '../../lib/types';
import { AudioButton } from '../primitives/AudioButton';
import { HanziText } from '../primitives/HanziText';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

interface Piece {
  id: number;
  text: string;
}

/**
 * Put a character together from its parts (女 + 马 = 妈), or, with
 * `showCharacter`, pick the parts a given character is made of.
 */
export function BuildCharacter({ config, onResult, onContinue }: ExerciseProps<BuildCharacterConfig>) {
  const { settings } = useSettings();
  const pieces = useMemo<Piece[]>(
    () => [...config.parts, ...(config.distractors ?? [])].map((text, id) => ({ id, text })),
    [config.parts, config.distractors],
  );
  const shuffled = useShuffled(pieces, config.shuffle);
  const [slots, setSlots] = useState<(Piece | null)[]>(() => config.parts.map(() => null));
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const open = status === 'idle';
  const revealed = config.showCharacter || status === 'correct';

  const place = (piece: Piece) => {
    if (!open) return;
    setSlots((current) => {
      const slot = current.findIndex((s) => s === null);
      return slot === -1 ? current : current.map((s, i) => (i === slot ? piece : s));
    });
  };

  const clear = (index: number) => {
    if (open) setSlots((current) => current.map((s, i) => (i === index ? null : s)));
  };

  const check = () => {
    if (!open || slots.some((s) => s === null)) return;
    const correct = slots.every((s, i) => s?.text === config.parts[i]);
    setStatus(correct ? 'correct' : 'incorrect');
    if (correct) speak(config.character, { rate: settings.speechRate });
    onResult?.({ correct });
  };

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      canCheck={slots.every((s) => s !== null)}
      onCheck={check}
      onContinue={onContinue}
      correctAnswer={`${config.parts.join(' + ')} = ${config.character}`}
    >
      <div className={styles.buildHeader}>
        {config.showCharacter ? (
          <span className={styles.buildShown}>
            <HanziText hanzi={config.character} pinyin={config.pinyin} />
          </span>
        ) : (
          <>
            <AudioButton text={config.character} />
            {config.pinyin && <span className={styles.buildPinyin}>{config.pinyin}</span>}
          </>
        )}
        {config.meaning && <span className={styles.meaning}>“{config.meaning}”</span>}
      </div>

      <div className={styles.buildEquation}>
        {slots.map((piece, i) => (
          <span key={i} className={styles.buildTerm}>
            {i > 0 && <span className={styles.buildOperator}>+</span>}
            <button
              type="button"
              className={cx(
                styles.buildSlot,
                piece && styles.buildSlotFilled,
                !open && piece && (piece.text === config.parts[i] ? styles.gapRight : styles.gapWrong),
              )}
              disabled={!open || !piece}
              onClick={() => clear(i)}
              aria-label={piece ? `Part ${i + 1}: ${piece.text}. Tap to remove` : `Part ${i + 1}, empty`}
            >
              <span lang="zh-CN">{piece?.text ?? ''}</span>
            </button>
          </span>
        ))}
        <span className={styles.buildOperator}>=</span>
        <span className={cx(styles.buildResult, revealed && styles.buildResultShown)} lang="zh-CN">
          {revealed ? config.character : '?'}
        </span>
      </div>

      <div className={styles.bank} aria-label="Character parts" role="group">
        {shuffled.map((piece) => {
          const used = slots.some((s) => s?.id === piece.id);
          return (
            <button
              key={piece.id}
              type="button"
              className={cx(styles.tile, styles.pieceTile, used && styles.tileUsed)}
              disabled={used || !open}
              aria-hidden={used}
              onClick={() => place(piece)}
            >
              <span lang="zh-CN">{piece.text}</span>
            </button>
          );
        })}
      </div>
    </ExerciseFrame>
  );
}

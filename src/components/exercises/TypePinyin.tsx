import { useState } from 'react';
import { tapToSpeakEnabled } from '../../lib/content';
import { gradePinyin } from '../../lib/grading';
import { numberedToMarks } from '../../lib/pinyin';
import { TapToSpeakContext } from '../../lib/settings';
import type { ExerciseProps, ExerciseStatus, TypePinyinConfig } from '../../lib/types';
import { ContentView } from '../primitives/ContentView';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

/**
 * Type the pinyin of what you see or hear. Tones can be typed as numbers
 * (ni3 hao3) and are shown as marks while typing.
 */
export function TypePinyin({ config, onResult, onContinue }: ExerciseProps<TypePinyinConfig>) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const preview = numberedToMarks(value);
  const tonesRequired = config.requireTones !== false;

  const check = () => {
    if (status !== 'idle' || !value.trim()) return;
    const correct = gradePinyin(config, value);
    setStatus(correct ? 'correct' : 'incorrect');
    onResult?.({ correct });
  };

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      canCheck={value.trim().length > 0}
      onCheck={check}
      onContinue={onContinue}
      correctAnswer={config.answer}
    >
      <div className={styles.prompt}>
        <TapToSpeakContext.Provider value={tapToSpeakEnabled(config)}>
          <ContentView content={config.prompt} />
        </TapToSpeakContext.Provider>
      </div>

      <div className={styles.typeArea}>
        <input
          className={styles.typeInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={status !== 'idle'}
          aria-label="Your answer in pinyin"
          placeholder="Type the pinyin…"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          lang="zh-Latn"
        />
        <p className={styles.typePreview} aria-live="polite">
          {preview !== value ? preview : ' '}
        </p>
        <p className={styles.muted}>
          {tonesRequired
            ? 'Type tones as numbers after each syllable: ni3 hao3 → nǐ hǎo. Use v for ü, and 5 (or nothing) for the neutral tone.'
            : 'Tones are optional here.'}
        </p>
      </div>
    </ExerciseFrame>
  );
}

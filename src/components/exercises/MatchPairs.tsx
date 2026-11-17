import { Fragment, useEffect, useRef, useState } from 'react';
import { speakableText } from '../../lib/content';
import { useSettings, useShuffled } from '../../lib/settings';
import { speak } from '../../lib/speech';
import type { Content, ExerciseProps, ExerciseStatus, MatchPairsConfig } from '../../lib/types';
import { ContentView } from '../primitives/ContentView';
import { OptionCard, type OptionState } from '../primitives/OptionCard';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

type Side = 'left' | 'right';

/**
 * Two shuffled columns. Tap one item on each side to pair them: right pairs
 * stay in place but lock, wrong pairs flash red. Each side can be any `Content` (English,
 * characters, pinyin, audio-only buttons…).
 */
export function MatchPairs({ config, onResult, onContinue }: ExerciseProps<MatchPairsConfig>) {
  const { settings } = useSettings();
  const left = useShuffled(config.pairs, config.shuffle, 0);
  const right = useShuffled(config.pairs, config.shuffle, 1);

  const [picked, setPicked] = useState<{ left?: string; right?: string }>({});
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(null);
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const mistakes = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pick = (side: Side, id: string, content: Content) => {
    if (wrong || matched.includes(id)) return;
    const audio = speakableText(content);
    if (audio) speak(audio, { rate: settings.speechRate });

    const next = { ...picked, [side]: picked[side] === id ? undefined : id };
    if (!next.left || !next.right) {
      setPicked(next);
      return;
    }

    if (next.left === next.right) {
      const nowMatched = [...matched, next.left];
      setMatched(nowMatched);
      setPicked({});
      if (nowMatched.length === config.pairs.length) {
        setStatus('correct');
        onResult?.({ correct: true, mistakes: mistakes.current });
      }
    } else {
      mistakes.current += 1;
      setPicked({});
      setWrong({ left: next.left, right: next.right });
      timer.current = window.setTimeout(() => setWrong(null), 600);
    }
  };

  const stateOf = (side: Side, id: string): OptionState => {
    if (matched.includes(id)) return 'matched';
    if (wrong?.[side] === id) return 'wrong';
    if (picked[side] === id) return 'selected';
    return 'default';
  };

  const card = (side: Side, pair: (typeof left)[number]) => (
    <OptionCard
      state={stateOf(side, pair.id)}
      aria-pressed={picked[side] === pair.id}
      disabled={matched.includes(pair.id)}
      onClick={() => pick(side, pair.id, pair[side])}
    >
      <ContentView content={pair[side]} mode="option" />
    </OptionCard>
  );

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      hideCheck
      onContinue={onContinue}
      successMessage="All matched!"
    >
      {/* One grid, filled row by row, so both cards of a row share the same height. */}
      <div className={styles.match}>
        {left.map((pair, row) => (
          <Fragment key={pair.id}>
            {card('left', pair)}
            {card('right', right[row])}
          </Fragment>
        ))}
      </div>
    </ExerciseFrame>
  );
}

import { useEffect, useState } from 'react';
import { cx } from '../../lib/cx';
import { plainText, speakableText, tapText, tapToSpeakEnabled } from '../../lib/content';
import { gradeChoice } from '../../lib/grading';
import { TapToSpeakContext, useSettings, useShuffled } from '../../lib/settings';
import { speak } from '../../lib/speech';
import type {
  ChoiceOption,
  ExerciseProps,
  ExerciseStatus,
  MultipleChoiceConfig,
} from '../../lib/types';
import { ContentView } from '../primitives/ContentView';
import { OptionCard, type OptionState } from '../primitives/OptionCard';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

/**
 * One prompt, several options, one correct answer. The prompt and each option
 * can be any `Content`, which is what turns this single component into
 * picture cards, "pick the sound", fill-in-the-blank, dialogue completion, etc.
 */
export function MultipleChoice({ config, onResult, onContinue }: ExerciseProps<MultipleChoiceConfig>) {
  const { settings } = useSettings();
  const options = useShuffled(config.options, config.shuffle);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const tapToSpeak = tapToSpeakEnabled(config);

  const layout =
    config.layout ?? (options.every((o) => o.content.kind === 'image') ? 'grid' : 'list');

  const select = (option: ChoiceOption) => {
    if (status !== 'idle') return;
    setSelected(option.id);
    // Audio options always play; Chinese text plays unless the sound is the answer.
    const audio =
      speakableText(option.content) ?? (tapToSpeak ? tapText(option.content) : undefined);
    if (audio) speak(audio, { rate: settings.speechRate });
  };

  const check = () => {
    if (selected === null || status !== 'idle') return;
    const correct = gradeChoice(config, selected);
    setStatus(correct ? 'correct' : 'incorrect');
    onResult?.({ correct });
  };

  // Number keys pick an option.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const option = options[Number(event.key) - 1];
      if (option && !event.ctrlKey && !event.metaKey && !event.altKey) select(option);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const stateOf = (option: ChoiceOption): OptionState => {
    if (status !== 'idle' && option.id === config.answer) return 'correct';
    if (status === 'incorrect' && option.id === selected) return 'wrong';
    if (status === 'idle' && option.id === selected) return 'selected';
    return 'default';
  };

  // Show the current pick inside the blank of the prompt, when it is text.
  const picked = options.find((o) => o.id === selected)?.content;
  const fill =
    picked && (picked.kind === 'hanzi' || picked.kind === 'sentence' || picked.kind === 'text')
      ? plainText(picked)
      : undefined;

  const answer = config.options.find((o) => o.id === config.answer);

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      canCheck={selected !== null}
      onCheck={check}
      onContinue={onContinue}
      correctAnswer={answer ? plainText(answer.content) : undefined}
    >
      {config.prompt && (
        <div className={styles.prompt}>
          <TapToSpeakContext.Provider value={tapToSpeak}>
            <ContentView content={config.prompt} fill={fill} />
          </TapToSpeakContext.Provider>
        </div>
      )}
      <div
        className={cx(styles.choices, layout === 'grid' && styles.choicesGrid)}
        role="radiogroup"
        aria-label={config.instruction ?? 'Options'}
      >
        {options.map((option, i) => (
          <OptionCard
            key={option.id}
            role="radio"
            aria-checked={option.id === selected}
            state={stateOf(option)}
            badge={layout === 'list' ? String(i + 1) : undefined}
            disabled={status !== 'idle'}
            onClick={() => select(option)}
          >
            <ContentView content={option.content} mode="option" />
          </OptionCard>
        ))}
      </div>
    </ExerciseFrame>
  );
}

import { useEffect, useRef, useState } from 'react';
import { speakableText } from '../../lib/content';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';
import type {
  ExerciseProps,
  ExerciseStatus,
  StoryConfig,
  StoryQuestion,
  StoryStep,
} from '../../lib/types';
import { ContentView } from '../primitives/ContentView';
import { OptionCard, type OptionState } from '../primitives/OptionCard';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

/** Lines are read aloud as they appear, whether or not they show an audio button. */
function lineAudio(step: StoryStep): string | undefined {
  if (step.kind !== 'line' || step.content.kind === 'text') return undefined;
  return speakableText({ ...step.content, speak: true });
}

/**
 * A longer text revealed one line at a time, with comprehension questions in
 * between. A question has to be answered correctly before the story goes on.
 */
export function Story({ config, onResult, onContinue }: ExerciseProps<StoryConfig>) {
  const { settings } = useSettings();
  const { steps } = config;
  const [visible, setVisible] = useState(1);
  /** Per question step index: the wrong picks so far and whether it is solved. */
  const [answers, setAnswers] = useState<Record<number, { wrong: string[]; solved: boolean }>>({});
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const mistakes = useRef(0);
  const end = useRef<HTMLDivElement>(null);

  const current = steps[visible - 1];
  const blocked = current?.kind === 'question' && !answers[visible - 1]?.solved;
  const atEnd = visible >= steps.length;

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [visible]);

  // The first line only plays by itself when autoplay is on.
  useEffect(() => {
    const audio = steps[0] && lineAudio(steps[0]);
    if (audio && settings.autoPlay) speak(audio, { rate: settings.speechRate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = () => {
    if (blocked || status !== 'idle') return;
    if (atEnd) {
      setStatus('correct');
      onResult?.({ correct: true, mistakes: mistakes.current });
      return;
    }
    const audio = lineAudio(steps[visible]);
    if (audio) speak(audio, { rate: settings.speechRate });
    setVisible(visible + 1);
  };

  const answer = (index: number, question: StoryQuestion, optionId: string) => {
    const state = answers[index] ?? { wrong: [], solved: false };
    if (state.solved || state.wrong.includes(optionId)) return;
    if (optionId === question.answer) {
      setAnswers({ ...answers, [index]: { ...state, solved: true } });
    } else {
      mistakes.current += 1;
      setAnswers({ ...answers, [index]: { ...state, wrong: [...state.wrong, optionId] } });
    }
  };

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      canCheck={!blocked}
      onCheck={advance}
      checkLabel={atEnd ? 'Finish' : 'Continue'}
      onContinue={onContinue}
      successMessage="Story complete!"
    >
      <h3 className={styles.storyTitle}>{config.title}</h3>
      <div className={styles.story}>
        {steps.slice(0, visible).map((step, i) =>
          step.kind === 'line' ? (
            <div key={i} className={styles.storyLine}>
              {step.avatar && (
                <span className={styles.storyAvatar} role="img" aria-label={step.speaker ?? 'Speaker'}>
                  {step.avatar}
                </span>
              )}
              <div className={styles.storyText}>
                {step.speaker && <span className={styles.speaker}>{step.speaker}</span>}
                <ContentView
                  audioSize="sm"
                  content={step.content.kind === 'text' ? step.content : { ...step.content, speak: true }}
                />
                {step.translation && <span className={styles.muted}>{step.translation}</span>}
              </div>
            </div>
          ) : (
            <div key={i} className={styles.storyQuestion}>
              <p className={styles.storyPrompt}>{step.prompt}</p>
              <div className={styles.choices} role="group" aria-label={step.prompt}>
                {step.options.map((option) => {
                  const state = answers[i];
                  let look: OptionState = 'default';
                  if (state?.solved && option.id === step.answer) look = 'correct';
                  else if (state?.wrong.includes(option.id)) look = 'wrong';
                  return (
                    <OptionCard
                      key={option.id}
                      state={look}
                      disabled={state?.solved || look === 'wrong'}
                      onClick={() => answer(i, step, option.id)}
                    >
                      {option.text}
                    </OptionCard>
                  );
                })}
              </div>
            </div>
          ),
        )}
        <div ref={end} />
      </div>
    </ExerciseFrame>
  );
}

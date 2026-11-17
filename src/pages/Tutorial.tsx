import { useEffect, useRef, useState, type ReactNode } from 'react';
import lessonPrompt from '../../docs/create-lesson-prompt.md?raw';
import { cx } from '../lib/cx';
import shell from '../components/shell/shell.module.css';
import styles from './Tutorial.module.css';

const SEEN_KEY = 'dielingo.tutorial.v1';

/** True until the learner has closed the tutorial once in this browser. */
export function isFirstVisit(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === null;
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, 'done');
  } catch {
    // Storage disabled: the tutorial will simply show again next time.
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure pages: fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

function downloadPrompt(): void {
  const url = URL.createObjectURL(new Blob([lessonPrompt], { type: 'text/markdown' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'create-lesson-prompt.md';
  link.click();
  URL.revokeObjectURL(url);
}

/** The "copy the prompt" control, shared by the tutorial and the Lessons page. */
export function CopyPromptButton({ className }: { className?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const ok = await copyText(lessonPrompt);
    setState(ok ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    if (ok) timer.current = window.setTimeout(() => setState('idle'), 2500);
  };

  return (
    <span className={styles.copyRow}>
      <button type="button" className={cx(shell.button, shell.secondary, className)} onClick={copy}>
        {state === 'copied' ? '✓ Copied' : '📋 Copy the prompt'}
      </button>
      {state === 'failed' ? (
        <span className={styles.copyNote} role="status">
          Couldn’t copy.{' '}
          <button type="button" className={styles.link} onClick={downloadPrompt}>
            Download it instead
          </button>
        </span>
      ) : (
        <button type="button" className={styles.link} onClick={downloadPrompt}>
          or download it (.md)
        </button>
      )}
    </span>
  );
}

interface Step {
  emoji: string;
  title: string;
  body: ReactNode;
}

const steps: Step[] = [
  {
    emoji: '👋',
    title: 'Welcome to Dielingo',
    body: (
      <>
        <p>Practise Mandarin Chinese in short lessons made of quick exercises:</p>
        <ul className={styles.features}>
          <li>
            <span aria-hidden="true">🖼️</span> Learn new words with pictures and matching
          </li>
          <li>
            <span aria-hidden="true">🔊</span> Train your ear with sounds and tones
          </li>
          <li>
            <span aria-hidden="true">🧩</span> Build sentences from word tiles
          </li>
          <li>
            <span aria-hidden="true">✍️</span> Draw characters stroke by stroke
          </li>
        </ul>
      </>
    ),
  },
  {
    emoji: '📚',
    title: 'Start with a lesson',
    body: (
      <ol className={styles.numbered}>
        <li>
          On the <strong>Lessons</strong> page, press <strong>Start</strong> on a lesson.{' '}
          <em>First words</em> is the place to begin.
        </li>
        <li>
          Answer each exercise and press <strong>Check</strong>. Anything you get wrong comes back
          at the end, until you get it right.
        </li>
        <li>
          Finished lessons get a <strong>✓</strong> and keep your best accuracy.
        </li>
        <li>
          Use the <strong>Pinyin</strong> switch at the top to hide the pronunciation when you want
          a challenge.
        </li>
      </ol>
    ),
  },
  {
    emoji: '✨',
    title: 'Create your own lesson',
    body: (
      <>
        <p>
          A lesson is a single <code>.json</code> file, and an AI assistant can write it for you:
        </p>
        <ol className={styles.numbered}>
          <li>
            Copy the lesson prompt:
            <CopyPromptButton />
          </li>
          <li>
            Paste it into an AI assistant (Claude, ChatGPT, Gemini…). It will ask what you want to
            learn, how many questions, and which exercise types.
          </li>
          <li>
            Save the JSON it gives you as a file ending in <code>.json</code>.
          </li>
          <li>
            Back here, press <strong>Upload lesson</strong> and choose the file.
          </li>
        </ol>
      </>
    ),
  },
];

interface TutorialProps {
  /** Step to open on. Default: the first. */
  startStep?: number;
  /** Lesson opened by the final "Start my first lesson" button. */
  firstLessonId?: string;
  onClose: () => void;
}

/** The step-by-step guide shown on the first visit, and again from the "?" button. */
export function Tutorial({ startStep = 0, firstLessonId, onClose }: TutorialProps) {
  const [index, setIndex] = useState(startStep);
  const step = steps[index];
  const last = index === steps.length - 1;
  const next = useRef<HTMLButtonElement>(null);

  const close = () => {
    markSeen();
    onClose();
  };

  useEffect(() => {
    next.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const finish = () => {
    close();
    if (firstLessonId) window.location.hash = `#/lesson/${firstLessonId}`;
  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <button type="button" className={styles.close} onClick={close} aria-label="Close tutorial">
          ✕
        </button>

        <div key={index} className={styles.step}>
          <span className={styles.emoji} aria-hidden="true">
            {step.emoji}
          </span>
          <h2 id="tutorial-title">{step.title}</h2>
          <div className={styles.body}>{step.body}</div>
        </div>

        <div className={styles.footer}>
          <div className={styles.dots} aria-label={`Step ${index + 1} of ${steps.length}`}>
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                className={cx(styles.dot, i === index && styles.dotActive)}
                onClick={() => setIndex(i)}
                aria-label={`Go to step ${i + 1}: ${s.title}`}
                aria-current={i === index ? 'step' : undefined}
              />
            ))}
          </div>
          <div className={styles.actions}>
            {index > 0 && (
              <button
                type="button"
                className={cx(shell.button, shell.secondary)}
                onClick={() => setIndex(index - 1)}
              >
                Back
              </button>
            )}
            {last ? (
              <button
                ref={next}
                type="button"
                className={cx(shell.button, shell.primary)}
                onClick={firstLessonId ? finish : close}
              >
                {firstLessonId ? 'Start my first lesson' : 'Got it'}
              </button>
            ) : (
              <button
                ref={next}
                type="button"
                className={cx(shell.button, shell.primary)}
                onClick={() => setIndex(index + 1)}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

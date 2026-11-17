import { useEffect } from 'react';
import { cx } from '../../lib/cx';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';
import styles from './primitives.module.css';

export function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path
        d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface AudioButtonProps {
  /** Chinese text to read aloud. */
  text: string;
  /** Turtle mode: reads slowly and shows a turtle. */
  slow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Read on mount, when the `autoPlay` setting is on. */
  autoPlay?: boolean;
}

export function AudioButton({ text, slow = false, size = 'md', autoPlay = false }: AudioButtonProps) {
  const { settings } = useSettings();
  const shouldAutoPlay = autoPlay && settings.autoPlay;

  useEffect(() => {
    if (shouldAutoPlay) speak(text, { slow, rate: settings.speechRate });
    // Only replay when the text itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, shouldAutoPlay]);

  return (
    <button
      type="button"
      className={cx(styles.audioButton, styles[`audio-${size}`], slow && styles.audioSlow)}
      onClick={() => speak(text, { slow, rate: settings.speechRate })}
      aria-label={slow ? 'Play slowly' : 'Play audio'}
    >
      {slow ? <span aria-hidden="true">🐢</span> : <SpeakerIcon />}
    </button>
  );
}

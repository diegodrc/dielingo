import { useContext } from 'react';
import { TapToSpeakContext, useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';
import styles from './primitives.module.css';

interface HanziTextProps {
  hanzi: string;
  pinyin?: string;
}

/** Chinese text with pinyin above it (when the `showPinyin` setting is on). */
export function HanziText({ hanzi, pinyin }: HanziTextProps) {
  const { settings } = useSettings();
  if (!pinyin || !settings.showPinyin) {
    return (
      <span className={styles.hanzi} lang="zh-CN">
        {hanzi}
      </span>
    );
  }
  return (
    <ruby className={styles.hanzi} lang="zh-CN">
      {hanzi}
      <rt className={styles.pinyin}>{pinyin}</rt>
    </ruby>
  );
}

/**
 * Chinese text that plays its sound when tapped. Falls back to plain text
 * where tap-to-speak is off (listening exercises).
 */
export function SpeakableHanzi({ hanzi, pinyin }: HanziTextProps) {
  const { settings } = useSettings();
  const tapToSpeak = useContext(TapToSpeakContext);
  if (!tapToSpeak) return <HanziText hanzi={hanzi} pinyin={pinyin} />;
  return (
    <button
      type="button"
      className={styles.speakable}
      onClick={() => speak(hanzi, { rate: settings.speechRate })}
      aria-label={`Play ${hanzi}`}
    >
      <HanziText hanzi={hanzi} pinyin={pinyin} />
    </button>
  );
}

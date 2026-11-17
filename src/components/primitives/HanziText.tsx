import { useSettings } from '../../lib/settings';
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

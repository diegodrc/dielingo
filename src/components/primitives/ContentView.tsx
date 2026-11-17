import { useState } from 'react';
import { cx } from '../../lib/cx';
import { sentenceText } from '../../lib/content';
import type { ChatContent, Content, SentenceContent } from '../../lib/types';
import { AudioButton, SpeakerIcon } from './AudioButton';
import { HanziText } from './HanziText';
import styles from './primitives.module.css';

interface ContentViewProps {
  content: Content;
  /**
   * prompt: interactive (audio buttons, tappable word hints).
   * option: static, for use inside a card that is itself a button.
   */
  mode?: 'prompt' | 'option';
  /** Text to show inside a blank (the learner's current pick). */
  fill?: string;
  /** Size of the audio button next to Chinese text. Default: md. */
  audioSize?: 'sm' | 'md';
}

/** Renders any `Content`. The one place that knows how each kind looks. */
export function ContentView({ content, mode = 'prompt', fill, audioSize = 'md' }: ContentViewProps) {
  const interactive = mode === 'prompt';

  switch (content.kind) {
    case 'text':
      return <span className={styles.text}>{content.text}</span>;

    case 'hanzi':
      return (
        <span className={cx(styles.row, interactive && styles.promptHanzi)}>
          {interactive && content.speak && (
            <AudioButton text={content.hanzi} size={audioSize} autoPlay />
          )}
          <HanziText hanzi={content.hanzi} pinyin={content.pinyin} />
        </span>
      );

    case 'audio':
      if (!interactive) {
        return (
          <span className={styles.audioGlyph} aria-label="Audio">
            <SpeakerIcon />
            <span className={styles.wave} aria-hidden="true" />
          </span>
        );
      }
      return (
        <span className={styles.row}>
          <AudioButton text={content.speak} size="lg" autoPlay />
          {content.slow && <AudioButton text={content.speak} slow />}
        </span>
      );

    case 'image':
      return (
        <span className={styles.image}>
          {content.src ? (
            <img src={content.src} alt={content.label} />
          ) : (
            <span className={styles.emoji} role="img" aria-label={content.label}>
              {content.emoji}
            </span>
          )}
          {content.showLabel && <span className={styles.imageLabel}>{content.label}</span>}
        </span>
      );

    case 'sentence':
      return (
        <SentenceView content={content} interactive={interactive} fill={fill} audioSize={audioSize} />
      );

    case 'chat':
      return <ChatView content={content} fill={fill} />;
  }
}

function SentenceView({
  content,
  interactive,
  fill,
  audioSize,
}: {
  content: SentenceContent;
  interactive: boolean;
  fill?: string;
  audioSize: 'sm' | 'md';
}) {
  const [openHint, setOpenHint] = useState<number | null>(null);

  return (
    <span className={styles.row}>
      {interactive && content.speak && (
        <AudioButton text={sentenceText(content)} size={audioSize} autoPlay />
      )}
      <span className={styles.sentence}>
        {content.tokens.map((token, i) => {
          if (token.blank) {
            return (
              <span key={i} className={cx(styles.blank, fill && styles.blankFilled)} lang="zh-CN">
                {fill ?? ' '}
              </span>
            );
          }
          if (!interactive || !token.hint) {
            return <HanziText key={i} hanzi={token.hanzi} pinyin={token.pinyin} />;
          }
          return (
            <span key={i} className={styles.tokenWrap}>
              <button
                type="button"
                className={styles.token}
                aria-expanded={openHint === i}
                onClick={() => setOpenHint(openHint === i ? null : i)}
                onBlur={() => setOpenHint((open) => (open === i ? null : open))}
              >
                <HanziText hanzi={token.hanzi} pinyin={token.pinyin} />
              </button>
              {openHint === i && (
                <span className={styles.hint} role="tooltip">
                  {token.hint}
                </span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}

function ChatView({ content, fill }: { content: ChatContent; fill?: string }) {
  return (
    <span className={styles.chat}>
      {content.lines.map((line, i) => (
        <span key={i} className={cx(styles.chatLine, line.side === 'right' && styles.chatRight)}>
          {line.avatar && (
            <span className={styles.avatar} role="img" aria-label={line.speaker ?? 'Speaker'}>
              {line.avatar}
            </span>
          )}
          <span className={cx(styles.bubble, line.blank && !fill && styles.bubbleBlank)}>
            {line.blank ? (
              <span lang="zh-CN">{fill ?? '…'}</span>
            ) : (
              line.content && <ContentView content={line.content} />
            )}
          </span>
        </span>
      ))}
    </span>
  );
}

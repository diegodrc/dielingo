import type { Content, ExerciseConfig, SentenceContent } from './types';

const CJK = /[㐀-鿿]/;

export function isChinese(text: string): boolean {
  return CJK.test(text);
}

/** Text shown in feedback ("Correct answer: …") and used to fill blanks. */
export function plainText(content: Content): string {
  switch (content.kind) {
    case 'text':
      return content.text;
    case 'hanzi':
      return content.hanzi;
    case 'audio':
      return content.speak;
    case 'image':
      return content.label;
    case 'sentence':
      return content.tokens.map((t) => (t.blank ? '＿＿' : t.hanzi)).join('');
    case 'chat':
      return '';
  }
}

/** Chinese text to read aloud for this content, if it has audio. */
export function speakableText(content: Content): string | undefined {
  switch (content.kind) {
    case 'audio':
      return content.speak;
    case 'hanzi':
      return content.speak ? content.hanzi : undefined;
    case 'sentence':
      return content.speak ? sentenceText(content) : undefined;
    default:
      return undefined;
  }
}

/** Chinese text to read aloud when the learner taps this content. */
export function tapText(content: Content): string | undefined {
  switch (content.kind) {
    case 'hanzi':
      return content.hanzi;
    case 'audio':
      return content.speak;
    case 'sentence':
      return sentenceText(content) || undefined;
    default:
      return undefined;
  }
}

const isAudio = (content: Content | undefined) => content?.kind === 'audio';

/**
 * Whether tapping Chinese text should play its sound in this exercise.
 * Listening exercises (anything with audio-only content) keep the text silent,
 * because the sound is the answer. `tapToSpeak` on the config overrides this.
 */
export function tapToSpeakEnabled(config: ExerciseConfig): boolean {
  if (config.tapToSpeak !== undefined) return config.tapToSpeak;
  switch (config.type) {
    case 'multipleChoice':
      return !isAudio(config.prompt) && !config.options.some((o) => isAudio(o.content));
    case 'matchPairs':
      return !config.pairs.some((p) => isAudio(p.left) || isAudio(p.right));
    case 'wordBank':
      return !isAudio(config.prompt);
    default:
      return true;
  }
}

export function sentenceText(content: SentenceContent): string {
  return content.tokens
    .filter((t) => !t.blank)
    .map((t) => t.hanzi)
    .join('');
}

/**
 * Shorthand for writing a Chinese sentence.
 *
 *   zh('我 喝 茶', 'wǒ hē chá', 'I | drink | tea', { speak: true })
 *
 * Words are separated by spaces, hints by `|`. Use `___` for a blank and `_`
 * to skip the pinyin of a word (e.g. punctuation).
 */
export function zh(
  hanzi: string,
  pinyin = '',
  hints = '',
  options: { speak?: boolean } = {},
): SentenceContent {
  const pinyinParts = pinyin.split(' ');
  const hintParts = hints ? hints.split('|').map((h) => h.trim()) : [];
  return {
    kind: 'sentence',
    ...(options.speak ? { speak: true } : {}),
    tokens: hanzi.split(' ').map((word, i) => {
      if (word === '___') return { hanzi: '', blank: true };
      const p = pinyinParts[i];
      return {
        hanzi: word,
        ...(p && p !== '_' ? { pinyin: p } : {}),
        ...(hintParts[i] ? { hint: hintParts[i] } : {}),
      };
    }),
  };
}

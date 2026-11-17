import type { Content, SentenceContent } from './types';

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

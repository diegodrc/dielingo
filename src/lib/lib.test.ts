import { describe, expect, it } from 'vitest';
import { plainText, speakableText, zh } from './content';
import { gradeChoice, gradeWordBank, joinTiles } from './grading';
import { seededRandom, shuffle } from './shuffle';
import type { MultipleChoiceConfig, WordBankConfig } from './types';

describe('gradeWordBank', () => {
  const config: WordBankConfig = {
    type: 'wordBank',
    prompt: { kind: 'text', text: '' },
    answer: ['I', "don't", 'eat', 'rice'],
    acceptedAnswers: [['I', 'do', 'not', 'eat', 'rice']],
  };

  it('accepts the main answer and the alternatives', () => {
    expect(gradeWordBank(config, ['I', "don't", 'eat', 'rice'])).toBe(true);
    expect(gradeWordBank(config, ['I', 'do', 'not', 'eat', 'rice'])).toBe(true);
  });

  it('rejects wrong order, missing and extra tiles', () => {
    expect(gradeWordBank(config, ['I', 'eat', "don't", 'rice'])).toBe(false);
    expect(gradeWordBank(config, ['I', "don't", 'eat'])).toBe(false);
    expect(gradeWordBank(config, ['I', "don't", 'eat', 'rice', 'tea'])).toBe(false);
    expect(gradeWordBank(config, [])).toBe(false);
  });
});

describe('gradeChoice', () => {
  const config: MultipleChoiceConfig = {
    type: 'multipleChoice',
    options: [
      { id: 'a', content: { kind: 'text', text: 'a' } },
      { id: 'b', content: { kind: 'text', text: 'b' } },
    ],
    answer: 'b',
  };

  it('compares the selected id with the answer', () => {
    expect(gradeChoice(config, 'b')).toBe(true);
    expect(gradeChoice(config, 'a')).toBe(false);
    expect(gradeChoice(config, null)).toBe(false);
  });
});

describe('joinTiles', () => {
  it('joins Chinese without spaces and English with spaces', () => {
    expect(joinTiles(['我', '喝', '茶'])).toBe('我喝茶');
    expect(joinTiles(['I', 'drink', 'tea'])).toBe('I drink tea');
  });
});

describe('shuffle', () => {
  it('keeps every item and does not change the input', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect([...result].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('is reproducible with a seed', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(shuffle(items, seededRandom(42))).toEqual(shuffle(items, seededRandom(42)));
  });
});

describe('zh', () => {
  it('builds tokens with pinyin, hints and blanks', () => {
    const sentence = zh('你 喝 ___ 吗？', 'nǐ hē _ ma', 'you | drink', { speak: true });
    expect(sentence.tokens).toEqual([
      { hanzi: '你', pinyin: 'nǐ', hint: 'you' },
      { hanzi: '喝', pinyin: 'hē', hint: 'drink' },
      { hanzi: '', blank: true },
      { hanzi: '吗？', pinyin: 'ma' },
    ]);
    expect(speakableText(sentence)).toBe('你喝吗？');
    expect(plainText(sentence)).toBe('你喝＿＿吗？');
  });

  it('has no audio unless asked', () => {
    expect(speakableText(zh('你 好'))).toBeUndefined();
  });
});

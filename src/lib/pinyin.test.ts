import { describe, expect, it } from 'vitest';
import { findWord, lineBetween, toCells } from './grid';
import { applyTone, normalizePinyin, numberedToMarks, stripTones, toneOf } from './pinyin';

describe('pinyin', () => {
  it('places tone marks by the standard rule', () => {
    expect(applyTone('hao', 3)).toBe('hǎo');
    expect(applyTone('gou', 3)).toBe('gǒu');
    expect(applyTone('xie', 4)).toBe('xiè');
    expect(applyTone('dui', 4)).toBe('duì');
    expect(applyTone('liu', 2)).toBe('liú');
    expect(applyTone('lü', 4)).toBe('lǜ');
    expect(applyTone('An', 1)).toBe('Ān');
    expect(applyTone('ma', 0)).toBe('ma');
  });

  it('turns tone numbers into marks', () => {
    expect(numberedToMarks('ni3 hao3')).toBe('nǐ hǎo');
    expect(numberedToMarks('Zhong1guo2ren2')).toBe('Zhōngguórén');
    expect(numberedToMarks('lv4 nu:3')).toBe('lǜ nǚ');
    expect(numberedToMarks('xie4xie5')).toBe('xièxie');
  });

  it('reads and removes tones', () => {
    expect(toneOf('mǎ')).toBe(3);
    expect(toneOf('ma')).toBe(0);
    expect(stripTones('nǚ hǎo')).toBe('nü hao');
  });

  it('compares typed answers loosely, but keeps tones', () => {
    expect(normalizePinyin('ni3 hao3')).toBe(normalizePinyin('nǐ hǎo'));
    expect(normalizePinyin('Nǐhǎo!')).toBe(normalizePinyin('nǐ hǎo'));
    expect(normalizePinyin('ni2 hao3')).not.toBe(normalizePinyin('nǐ hǎo'));
    expect(normalizePinyin('ni hao', false)).toBe(normalizePinyin('nǐ hǎo', false));
  });
});

describe('grid', () => {
  const grid = toCells(['他我们', '吗很不', '你呢好']);

  it('finds words in any straight direction', () => {
    expect(findWord(grid, '我们')).toEqual([
      [0, 1],
      [0, 2],
    ]);
    expect(findWord(grid, '他很好')).not.toBeNull();
    expect(findWord(grid, '好很他')).not.toBeNull();
    expect(findWord(grid, '你他')).toBeNull();
  });

  it('only accepts straight lines', () => {
    expect(lineBetween([0, 0], [2, 2])).toHaveLength(3);
    expect(lineBetween([0, 0], [1, 2])).toBeNull();
  });
});

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { allExamples } from '../../examples';
import { parseLesson } from '../../lib/lessons';
import type {
  BuildCharacterConfig,
  FillBlanksConfig,
  TonesConfig,
  TypePinyinConfig,
  WordBankConfig,
  WordSearchConfig,
} from '../../lib/types';
import { BuildCharacter } from './BuildCharacter';
import { FillBlanks } from './FillBlanks';
import { Tones } from './Tones';
import { TypePinyin } from './TypePinyin';
import { WordBank } from './WordBank';
import { WordSearch } from './WordSearch';

vi.mock('../../lib/speech', () => ({ speak: vi.fn() }));

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const problemsOf = (exercise: unknown): string[] => {
  try {
    parseLesson({ title: 'Test', exercises: [exercise] });
    return [];
  } catch (error) {
    return (error as { problems: string[] }).problems;
  }
};

describe('TypePinyin', () => {
  const config: TypePinyinConfig = {
    type: 'typePinyin',
    prompt: { kind: 'hanzi', hanzi: '你好' },
    answer: 'nǐ hǎo',
  };

  it('accepts tone numbers and shows them as marks', () => {
    const onResult = vi.fn();
    render(<TypePinyin config={config} onResult={onResult} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ni3hao3' } });
    expect(screen.getByText('nǐhǎo')).toBeInTheDocument();
    click('Check');
    expect(onResult).toHaveBeenCalledWith({ correct: true });
  });

  it('marks wrong tones as wrong, unless tones are optional', () => {
    const onResult = vi.fn();
    const { unmount } = render(<TypePinyin config={config} onResult={onResult} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ni2 hao3' } });
    click('Check');
    expect(onResult).toHaveBeenLastCalledWith({ correct: false });
    unmount();

    render(<TypePinyin config={{ ...config, requireTones: false }} onResult={onResult} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ni hao' } });
    click('Check');
    expect(onResult).toHaveBeenLastCalledWith({ correct: true });
  });

  it('is rejected when the prompt shows the pinyin', () => {
    expect(problemsOf({ ...config, prompt: { kind: 'hanzi', hanzi: '你好', pinyin: 'nǐ hǎo' } })).toContain(
      'Exercise 1: the prompt shows pinyin, which is the answer; leave "pinyin" out',
    );
  });
});

describe('Tones', () => {
  const config: TonesConfig = { type: 'tones', word: '你好', pinyin: 'nǐ hǎo', speak: false };

  it('grades the tone of every syllable', () => {
    const onResult = vi.fn();
    render(<Tones config={config} onResult={onResult} />);
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'nǐ, third tone' }));
    fireEvent.click(screen.getByRole('radio', { name: 'hǎo, third tone' }));
    click('Check');
    expect(onResult).toHaveBeenCalledWith({ correct: true });
  });

  it('needs one syllable per character', () => {
    expect(problemsOf({ ...config, pinyin: 'nǐhǎo' })).toContain(
      'Exercise 1: "pinyin" needs one syllable per character, separated by spaces ("nǐ hǎo")',
    );
  });
});

describe('FillBlanks', () => {
  const config: FillBlanksConfig = {
    type: 'fillBlanks',
    sentence: {
      kind: 'sentence',
      tokens: [{ hanzi: '我' }, { hanzi: '', blank: true }, { hanzi: '茶，' }, { hanzi: '你' }, { hanzi: '', blank: true }],
    },
    answers: ['喝', '呢'],
    distractors: ['吗'],
    shuffle: false,
  };
  const bank = () => within(screen.getByRole('group', { name: 'Word bank' }));

  it('fills the gaps in order and grades each one', () => {
    const onResult = vi.fn();
    render(<FillBlanks config={config} onResult={onResult} />);
    fireEvent.click(bank().getByRole('button', { name: '吗' }));
    // Tapping a filled gap gives the word back.
    click(/Gap 1: 吗/);
    fireEvent.click(bank().getByRole('button', { name: '喝' }));
    fireEvent.click(bank().getByRole('button', { name: '呢' }));
    click('Check');
    expect(onResult).toHaveBeenCalledWith({ correct: true });
  });

  it('needs one answer per blank', () => {
    expect(problemsOf({ ...config, answers: ['喝'] })).toContain('Exercise 1: "answers" needs one word per blank (2)');
  });
});

describe('BuildCharacter', () => {
  const config: BuildCharacterConfig = {
    type: 'buildCharacter',
    character: '妈',
    meaning: 'mum',
    parts: ['女', '马'],
    distractors: ['口'],
    shuffle: false,
  };
  const pieces = () => within(screen.getByRole('group', { name: 'Character parts' }));

  it('reveals the character when the parts are right, in order', () => {
    const onResult = vi.fn();
    render(<BuildCharacter config={config} onResult={onResult} />);
    expect(screen.queryByText('妈')).toBeNull();
    fireEvent.click(pieces().getByRole('button', { name: '女' }));
    fireEvent.click(pieces().getByRole('button', { name: '马' }));
    click('Check');
    expect(onResult).toHaveBeenCalledWith({ correct: true });
    expect(screen.getByText('妈')).toBeInTheDocument();
  });

  it('counts the wrong order as wrong', () => {
    const onResult = vi.fn();
    render(<BuildCharacter config={config} onResult={onResult} />);
    fireEvent.click(pieces().getByRole('button', { name: '马' }));
    fireEvent.click(pieces().getByRole('button', { name: '女' }));
    click('Check');
    expect(onResult).toHaveBeenCalledWith({ correct: false });
  });
});

describe('WordSearch', () => {
  const config: WordSearchConfig = {
    type: 'wordSearch',
    grid: ['他我们', '吗很不', '你呢好'],
    words: [{ word: '我们' }, { word: '他很好' }],
  };
  const cell = (char: string) => screen.getByRole('button', { name: new RegExp(`^${char},`) });

  it('finds words in either direction and finishes when all are found', () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    render(<WordSearch config={config} onResult={onResult} />);

    fireEvent.click(cell('我'));
    fireEvent.click(cell('你')); // not a straight line from 我: starts again at 你
    fireEvent.click(cell('呢')); // 你呢 is not on the list: one mistake
    act(() => vi.advanceTimersByTime(700));

    fireEvent.click(cell('们'));
    fireEvent.click(cell('我')); // backwards is fine
    fireEvent.click(cell('他'));
    fireEvent.click(cell('好'));

    expect(onResult).toHaveBeenCalledWith({ correct: true, mistakes: 1 });
    vi.useRealTimers();
  });

  it('is rejected when a word is not in the grid', () => {
    expect(problemsOf({ ...config, words: [{ word: '你好' }] })).toContain(
      'Exercise 1: "你好" is not in the grid in a straight line',
    );
  });
});

describe('WordBank lines layout', () => {
  it('orders whole sentences', () => {
    const config: WordBankConfig = {
      type: 'wordBank',
      prompt: { kind: 'text', text: 'Put the chat in order' },
      layout: 'lines',
      answer: ['你好！', '你好！认识你很高兴。'],
      shuffle: false,
    };
    const onResult = vi.fn();
    render(<WordBank config={config} onResult={onResult} />);
    const bank = within(screen.getByRole('group', { name: 'Word bank' }));
    fireEvent.click(bank.getByRole('button', { name: '你好！' }));
    fireEvent.click(bank.getByRole('button', { name: '你好！认识你很高兴。' }));
    click('Check');
    expect(onResult).toHaveBeenCalledWith({ correct: true });
  });
});

describe('catalogue', () => {
  it('has a valid example for every exercise format', () => {
    for (const example of allExamples) {
      expect(problemsOf(example.config), example.code).toEqual([]);
    }
  });
});

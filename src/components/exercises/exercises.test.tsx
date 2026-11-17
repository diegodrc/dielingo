import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Lesson } from '../shell/Lesson';
import type {
  MatchPairsConfig,
  MultipleChoiceConfig,
  StoryConfig,
  WordBankConfig,
} from '../../lib/types';
import { MatchPairs } from './MatchPairs';
import { MultipleChoice } from './MultipleChoice';
import { Story } from './Story';
import { WordBank } from './WordBank';

const choice: MultipleChoiceConfig = {
  type: 'multipleChoice',
  instruction: 'What does this mean?',
  prompt: { kind: 'hanzi', hanzi: '猫', pinyin: 'māo' },
  options: [
    { id: 'cat', content: { kind: 'text', text: 'cat' } },
    { id: 'dog', content: { kind: 'text', text: 'dog' } },
  ],
  answer: 'cat',
  shuffle: false,
};

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

describe('MultipleChoice', () => {
  it('enables Check after a pick and reports a correct answer', () => {
    const onResult = vi.fn();
    const onContinue = vi.fn();
    render(<MultipleChoice config={choice} onResult={onResult} onContinue={onContinue} />);

    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /cat/ }));
    click('Check');

    expect(onResult).toHaveBeenCalledWith({ correct: true });
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    click('Continue');
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('shows the correct answer after a wrong pick', () => {
    const onResult = vi.fn();
    render(<MultipleChoice config={choice} onResult={onResult} />);

    fireEvent.click(screen.getByRole('radio', { name: /dog/ }));
    click('Check');

    expect(onResult).toHaveBeenCalledWith({ correct: false });
    expect(screen.getByRole('status')).toHaveTextContent('Correct answer: cat');
  });

  it('picks options with the number keys', () => {
    render(<MultipleChoice config={choice} />);
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByRole('radio', { name: /dog/ })).toBeChecked();
  });
});

describe('WordBank', () => {
  const config: WordBankConfig = {
    type: 'wordBank',
    prompt: { kind: 'text', text: 'I drink tea' },
    answer: ['我', '喝', '茶'],
    distractors: ['水'],
    shuffle: false,
  };
  const bank = () => within(screen.getByRole('group', { name: 'Word bank' }));
  const answer = () => within(screen.getByRole('group', { name: 'Your answer' }));

  it('grades the tiles in the order they were placed', () => {
    const onResult = vi.fn();
    render(<WordBank config={config} onResult={onResult} />);

    for (const word of ['我', '喝', '茶']) fireEvent.click(bank().getByRole('button', { name: word }));
    click('Check');

    expect(onResult).toHaveBeenCalledWith({ correct: true });
  });

  it('lets the learner take a tile back, and fails a wrong sentence', () => {
    const onResult = vi.fn();
    render(<WordBank config={config} onResult={onResult} />);

    fireEvent.click(bank().getByRole('button', { name: '水' }));
    fireEvent.click(answer().getByRole('button', { name: '水' }));
    expect(answer().queryAllByRole('button')).toHaveLength(0);

    for (const word of ['我', '喝', '水']) fireEvent.click(bank().getByRole('button', { name: word }));
    click('Check');

    expect(onResult).toHaveBeenCalledWith({ correct: false });
    expect(screen.getByRole('status')).toHaveTextContent('Correct answer: 我喝茶');
  });
});

describe('MatchPairs', () => {
  const config: MatchPairsConfig = {
    type: 'matchPairs',
    pairs: [
      { id: 'water', left: { kind: 'text', text: 'water' }, right: { kind: 'hanzi', hanzi: '水' } },
      { id: 'tea', left: { kind: 'text', text: 'tea' }, right: { kind: 'hanzi', hanzi: '茶' } },
    ],
    shuffle: false,
  };

  it('counts wrong pairs and finishes when everything is matched', () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    render(<MatchPairs config={config} onResult={onResult} />);

    click('water');
    click('茶');
    expect(onResult).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(700));

    click('water');
    click('水');
    click('茶');
    click('tea');

    expect(onResult).toHaveBeenCalledWith({ correct: true, mistakes: 1 });
    expect(screen.getByRole('status')).toHaveTextContent('All matched!');
    vi.useRealTimers();
  });
});

describe('Story', () => {
  const config: StoryConfig = {
    type: 'story',
    title: 'At the café',
    steps: [
      { kind: 'line', content: { kind: 'hanzi', hanzi: '我喝水' } },
      {
        kind: 'question',
        prompt: 'What does she drink?',
        options: [
          { id: 'tea', text: 'Tea' },
          { id: 'water', text: 'Water' },
        ],
        answer: 'water',
      },
    ],
  };

  it('blocks on a question until it is answered correctly', () => {
    const onResult = vi.fn();
    render(<Story config={config} onResult={onResult} />);

    click('Continue');
    expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();

    click('Tea');
    expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();
    click('Water');
    click('Finish');

    expect(onResult).toHaveBeenCalledWith({ correct: true, mistakes: 1 });
  });
});

describe('Lesson', () => {
  it('brings a wrong exercise back at the end', () => {
    const onComplete = vi.fn();
    render(<Lesson exercises={[choice]} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('radio', { name: /dog/ }));
    click('Check');
    click('Continue');

    // Same exercise again.
    fireEvent.click(screen.getByRole('radio', { name: /cat/ }));
    click('Check');
    click('Continue');

    expect(screen.getByText('Lesson complete!')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith({ total: 1, wrongAnswers: 1, accuracy: 50 });
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tapToSpeakEnabled } from '../../lib/content';
import { speak } from '../../lib/speech';
import type { MatchPairsConfig, MultipleChoiceConfig, WordBankConfig } from '../../lib/types';
import { MatchPairs } from './MatchPairs';
import { MultipleChoice } from './MultipleChoice';
import { WordBank } from './WordBank';

vi.mock('../../lib/speech', () => ({ speak: vi.fn() }));

const spoken = () => vi.mocked(speak).mock.calls.map(([text]) => text);
beforeEach(() => vi.mocked(speak).mockClear());

const meaning: MultipleChoiceConfig = {
  type: 'multipleChoice',
  prompt: { kind: 'hanzi', hanzi: '猫', pinyin: 'māo' },
  options: [
    { id: 'cat', content: { kind: 'text', text: 'cat' } },
    { id: 'dog', content: { kind: 'text', text: 'dog' } },
  ],
  answer: 'cat',
};

const listenAndChoose: MultipleChoiceConfig = {
  type: 'multipleChoice',
  prompt: { kind: 'audio', speak: '狗' },
  options: [
    { id: 'cat', content: { kind: 'hanzi', hanzi: '猫' } },
    { id: 'dog', content: { kind: 'hanzi', hanzi: '狗' } },
  ],
  answer: 'dog',
};

const chooseTheSound: MultipleChoiceConfig = {
  type: 'multipleChoice',
  prompt: { kind: 'hanzi', hanzi: '马' },
  options: [
    { id: 'ma1', content: { kind: 'audio', speak: '妈' } },
    { id: 'ma3', content: { kind: 'audio', speak: '马' } },
  ],
  answer: 'ma3',
  shuffle: false,
};

const englishChinese: MatchPairsConfig = {
  type: 'matchPairs',
  pairs: [
    { id: 'water', left: { kind: 'text', text: 'water' }, right: { kind: 'hanzi', hanzi: '水' } },
    { id: 'tea', left: { kind: 'text', text: 'tea' }, right: { kind: 'hanzi', hanzi: '茶' } },
  ],
};

const audioCharacter: MatchPairsConfig = {
  type: 'matchPairs',
  pairs: [
    { id: 'water', left: { kind: 'audio', speak: '水' }, right: { kind: 'hanzi', hanzi: '水' } },
    { id: 'tea', left: { kind: 'audio', speak: '茶' }, right: { kind: 'hanzi', hanzi: '茶' } },
  ],
  shuffle: false,
};

const buildInChinese: WordBankConfig = {
  type: 'wordBank',
  prompt: { kind: 'text', text: 'I drink tea' },
  answer: ['我', '喝', '茶'],
};

const pinyinToCharacters: WordBankConfig = {
  type: 'wordBank',
  prompt: { kind: 'text', text: 'Wǒ hē chá.' },
  answer: ['我', '喝', '茶'],
  pinyin: { 我: 'wǒ', 喝: 'hē', 茶: 'chá' },
};

describe('pinyin → characters', () => {
  it('hides the tiles’ pinyin and keeps them silent, even with a pinyin map', () => {
    expect(tapToSpeakEnabled(pinyinToCharacters)).toBe(false);
    render(<WordBank config={pinyinToCharacters} />);
    expect(screen.queryByText('hē')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '喝' }));
    expect(spoken()).toEqual([]);
  });

  it('still shows tile pinyin when the prompt is English', () => {
    render(<WordBank config={{ ...pinyinToCharacters, prompt: { kind: 'text', text: 'I drink tea' } }} />);
    expect(screen.getAllByText('hē').length).toBeGreaterThan(0);
  });
});

describe('tapToSpeakEnabled', () => {
  it('is on unless the exercise has audio-only content', () => {
    expect(tapToSpeakEnabled(meaning)).toBe(true);
    expect(tapToSpeakEnabled(englishChinese)).toBe(true);
    expect(tapToSpeakEnabled(buildInChinese)).toBe(true);
    expect(tapToSpeakEnabled(listenAndChoose)).toBe(false);
    expect(tapToSpeakEnabled(chooseTheSound)).toBe(false);
    expect(tapToSpeakEnabled(audioCharacter)).toBe(false);
    expect(tapToSpeakEnabled({ ...buildInChinese, prompt: { kind: 'audio', speak: '我喝茶' } })).toBe(false);
  });

  it('can be overridden per exercise', () => {
    expect(tapToSpeakEnabled({ ...englishChinese, tapToSpeak: false })).toBe(false);
    expect(tapToSpeakEnabled({ ...listenAndChoose, tapToSpeak: true })).toBe(true);
  });
});

describe('tapping Chinese text', () => {
  it('plays a character in a meaning exercise', () => {
    render(<MultipleChoice config={meaning} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play 猫' }));
    expect(spoken()).toEqual(['猫']);
  });

  it('plays a character card when matching English and Chinese', () => {
    render(<MatchPairs config={englishChinese} />);
    fireEvent.click(screen.getByRole('button', { name: '水' }));
    fireEvent.click(screen.getByRole('button', { name: 'water' }));
    expect(spoken()).toEqual(['水']);
  });

  it('plays Chinese word tiles', () => {
    render(<WordBank config={buildInChinese} />);
    fireEvent.click(screen.getByRole('button', { name: '喝' }));
    expect(spoken()).toEqual(['喝']);
  });

  it('stays silent on character options when the learner has to recognise a sound', () => {
    render(<MultipleChoice config={listenAndChoose} />);
    fireEvent.click(screen.getByRole('radio', { name: '猫' }));
    expect(spoken()).toEqual([]);
  });

  it('does not make the character tappable when the options are the sounds', () => {
    render(<MultipleChoice config={chooseTheSound} />);
    expect(screen.queryByRole('button', { name: 'Play 马' })).toBeNull();
    // The audio options themselves still play.
    fireEvent.click(screen.getAllByRole('radio')[0]);
    expect(spoken()).toEqual(['妈']);
  });

  it('plays only the audio side when matching audio and characters', () => {
    render(<MatchPairs config={audioCharacter} />);
    fireEvent.click(screen.getByRole('button', { name: '茶' }));
    expect(spoken()).toEqual([]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Audio' })[0]);
    expect(spoken()).toEqual(['水']);
  });
});

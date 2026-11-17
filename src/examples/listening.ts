import type { Example } from './types';

export const listening: Example[] = [
  {
    code: '2.1',
    title: 'Choose the right sound',
    goal: 'Associate a character with its sound, including the tone.',
    config: {
      type: 'multipleChoice',
      instruction: 'How do you say this?',
      prompt: { kind: 'hanzi', hanzi: '马' },
      // The browser voice reads characters, not pinyin, so each audio option
      // is written as a character with the sound you want: mā, má, mǎ, mà.
      options: [
        { id: 'ma1', content: { kind: 'audio', speak: '妈' } },
        { id: 'ma2', content: { kind: 'audio', speak: '麻' } },
        { id: 'ma3', content: { kind: 'audio', speak: '马' } },
        { id: 'ma4', content: { kind: 'audio', speak: '骂' } },
      ],
      answer: 'ma3',
    },
  },
  {
    code: '2.2',
    title: 'Listen and choose the character',
    goal: 'Recognise words by their sound.',
    config: {
      type: 'multipleChoice',
      instruction: 'What do you hear?',
      prompt: { kind: 'audio', speak: '狗' },
      options: [
        { id: 'cat', content: { kind: 'hanzi', hanzi: '猫' } },
        { id: 'dog', content: { kind: 'hanzi', hanzi: '狗' } },
        { id: 'person', content: { kind: 'hanzi', hanzi: '人' } },
        { id: 'water', content: { kind: 'hanzi', hanzi: '水' } },
      ],
      answer: 'dog',
      layout: 'grid',
    },
  },
  {
    code: '2.3',
    title: 'Match audio ↔ character',
    goal: 'Train the ear to tell similar sounds and tones apart.',
    config: {
      type: 'matchPairs',
      instruction: 'Match each sound to its character',
      pairs: [
        { id: 'ma1', left: { kind: 'audio', speak: '妈' }, right: { kind: 'hanzi', hanzi: '妈' } },
        { id: 'ma3', left: { kind: 'audio', speak: '马' }, right: { kind: 'hanzi', hanzi: '马' } },
        { id: 'mao', left: { kind: 'audio', speak: '猫' }, right: { kind: 'hanzi', hanzi: '猫' } },
        { id: 'cha', left: { kind: 'audio', speak: '茶' }, right: { kind: 'hanzi', hanzi: '茶' } },
      ],
    },
  },
  {
    code: '2.4',
    title: 'Listen and build the sentence in Chinese',
    goal: 'Listening comprehension and recognising sentence structure.',
    config: {
      type: 'wordBank',
      instruction: 'Tap what you hear',
      prompt: { kind: 'audio', speak: '我喝茶', slow: true },
      answer: ['我', '喝', '茶'],
      distractors: ['你', '水'],
      pinyin: { 我: 'wǒ', 喝: 'hē', 茶: 'chá', 你: 'nǐ', 水: 'shuǐ' },
    },
  },
  {
    code: '2.5',
    title: 'Listen and translate into English',
    goal: 'Understand what you heard, without the Chinese text to lean on.',
    config: {
      type: 'wordBank',
      instruction: 'Write what you hear in English',
      prompt: { kind: 'audio', speak: '她是老师', slow: true },
      answer: ['She', 'is', 'a', 'teacher'],
      distractors: ['student', 'He', 'not'],
    },
  },
  {
    code: '2.6',
    title: 'Mark the tones',
    goal: 'Hear each syllable’s tone and know how to write it.',
    config: {
      type: 'tones',
      instruction: 'Choose the tone of each syllable',
      word: '你好',
      pinyin: 'nǐ hǎo',
      meaning: 'hello',
    },
  },
  {
    code: '2.7',
    title: 'Type the pinyin',
    goal: 'Recall the pronunciation and spelling of a word, tones included.',
    config: {
      type: 'typePinyin',
      instruction: 'Type the pinyin',
      prompt: { kind: 'hanzi', hanzi: '谢谢' },
      answer: 'xièxie',
    },
  },
];

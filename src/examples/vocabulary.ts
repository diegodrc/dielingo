import type { Example } from './types';

export const vocabulary: Example[] = [
  {
    code: '1.1',
    title: 'New word with pictures',
    goal: 'Introduce new vocabulary by visual association, without going through English.',
    config: {
      type: 'multipleChoice',
      instruction: 'Select the correct image',
      prompt: { kind: 'hanzi', hanzi: '茶', pinyin: 'chá', speak: true },
      options: [
        { id: 'tea', content: { kind: 'image', emoji: '🍵', label: 'tea' } },
        { id: 'water', content: { kind: 'image', emoji: '💧', label: 'water' } },
        { id: 'rice', content: { kind: 'image', emoji: '🍚', label: 'rice' } },
        { id: 'apple', content: { kind: 'image', emoji: '🍎', label: 'apple' } },
      ],
      answer: 'tea',
    },
  },
  {
    code: '1.2',
    title: 'Match English ↔ Chinese',
    goal: 'Fix the meaning of several words at once.',
    config: {
      type: 'matchPairs',
      instruction: 'Tap the matching pairs',
      pairs: [
        { id: 'water', left: { kind: 'text', text: 'water' }, right: { kind: 'hanzi', hanzi: '水', pinyin: 'shuǐ' } },
        { id: 'tea', left: { kind: 'text', text: 'tea' }, right: { kind: 'hanzi', hanzi: '茶', pinyin: 'chá' } },
        { id: 'cat', left: { kind: 'text', text: 'cat' }, right: { kind: 'hanzi', hanzi: '猫', pinyin: 'māo' } },
        { id: 'dog', left: { kind: 'text', text: 'dog' }, right: { kind: 'hanzi', hanzi: '狗', pinyin: 'gǒu' } },
        { id: 'person', left: { kind: 'text', text: 'person' }, right: { kind: 'hanzi', hanzi: '人', pinyin: 'rén' } },
      ],
    },
  },
  {
    code: '1.3',
    title: 'Match character ↔ pinyin',
    goal: 'Link the written form to its pronunciation.',
    config: {
      type: 'matchPairs',
      instruction: 'Match each character to its pinyin',
      // Hearing the character would give its pinyin away.
      tapToSpeak: false,
      pairs: [
        { id: 'ni', left: { kind: 'hanzi', hanzi: '你' }, right: { kind: 'text', text: 'nǐ' } },
        { id: 'hao', left: { kind: 'hanzi', hanzi: '好' }, right: { kind: 'text', text: 'hǎo' } },
        { id: 'wo', left: { kind: 'hanzi', hanzi: '我' }, right: { kind: 'text', text: 'wǒ' } },
        { id: 'shi', left: { kind: 'hanzi', hanzi: '是' }, right: { kind: 'text', text: 'shì' } },
        { id: 'bu', left: { kind: 'hanzi', hanzi: '不' }, right: { kind: 'text', text: 'bù' } },
      ],
    },
  },
  {
    code: '1.4',
    title: 'Choose the meaning',
    goal: 'Recognise the meaning of a single character.',
    config: {
      type: 'multipleChoice',
      instruction: 'What does this mean?',
      prompt: { kind: 'hanzi', hanzi: '猫', pinyin: 'māo', speak: true },
      options: [
        { id: 'cat', content: { kind: 'text', text: 'cat' } },
        { id: 'dog', content: { kind: 'text', text: 'dog' } },
        { id: 'person', content: { kind: 'text', text: 'person' } },
        { id: 'water', content: { kind: 'text', text: 'water' } },
      ],
      answer: 'cat',
    },
  },
  {
    code: '1.5',
    title: 'Draw the character',
    goal: 'Learn the stroke order and memorise the shape of the character.',
    config: {
      type: 'strokeDraw',
      instruction: 'Trace the character',
      character: '人',
      pinyin: 'rén',
      meaning: 'person',
      guide: 'full',
    },
  },
];

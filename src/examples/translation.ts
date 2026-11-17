import { zh } from '../lib/content';
import type { Example } from './types';

export const translation: Example[] = [
  {
    code: '3.1',
    title: 'English → Chinese',
    goal: 'Produce sentences in Chinese and practise word order.',
    config: {
      type: 'wordBank',
      instruction: 'Write this in Chinese',
      prompt: { kind: 'text', text: 'I am a student' },
      answer: ['我', '是', '学生'],
      distractors: ['老师', '你', '不'],
      pinyin: { 我: 'wǒ', 是: 'shì', 学生: 'xuésheng', 老师: 'lǎoshī', 你: 'nǐ', 不: 'bù' },
    },
  },
  {
    code: '3.2',
    title: 'Chinese → English',
    goal: 'Reading and comprehension. Tap a word to see its meaning.',
    config: {
      type: 'wordBank',
      instruction: 'Write this in English',
      prompt: zh('我 不 吃 米饭', 'wǒ bù chī mǐfàn', "I | not, don't | eat | rice", { speak: true }),
      answer: ['I', "don't", 'eat', 'rice'],
      acceptedAnswers: [['I', 'do', 'not', 'eat', 'rice']],
      distractors: ['do', 'not', 'drink', 'tea'],
    },
  },
  {
    code: '3.3',
    title: 'Choose the right translation',
    goal: 'Attention to details of meaning and structure.',
    config: {
      type: 'multipleChoice',
      instruction: 'Select the correct translation',
      prompt: { kind: 'text', text: 'Do you drink water?' },
      options: [
        { id: 'a', content: zh('你 喝 水 吗？', 'nǐ hē shuǐ ma') },
        { id: 'b', content: zh('你 喝 茶 吗？', 'nǐ hē chá ma') },
        { id: 'c', content: zh('我 喝 水。', 'wǒ hē shuǐ') },
      ],
      answer: 'a',
    },
  },
];

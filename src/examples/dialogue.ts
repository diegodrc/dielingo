import { zh } from '../lib/content';
import type { Example } from './types';

export const dialogue: Example[] = [
  {
    code: '4.1',
    title: 'Fill in the blank',
    goal: 'Grammar and word use in context: particles, measure words, verbs.',
    config: {
      type: 'multipleChoice',
      instruction: 'Complete the sentence',
      prompt: zh('你 喝 茶 ___ ？', 'nǐ hē chá', 'you | drink | tea'),
      options: [
        { id: 'ma', content: { kind: 'hanzi', hanzi: '吗', pinyin: 'ma' } },
        { id: 'bu', content: { kind: 'hanzi', hanzi: '不', pinyin: 'bù' } },
        { id: 'shi', content: { kind: 'hanzi', hanzi: '是', pinyin: 'shì' } },
      ],
      answer: 'ma',
    },
  },
  {
    code: '4.2',
    title: 'Choose the reply',
    goal: 'Understand the meaning and pick a reply that fits, not just a translation.',
    config: {
      type: 'multipleChoice',
      instruction: 'Choose the best reply',
      prompt: zh('你 好 吗？', 'nǐ hǎo ma', 'you | good, well | (question)', { speak: true }),
      options: [
        { id: 'fine', content: zh('我 很 好， 谢谢。', 'wǒ hěn hǎo xièxie') },
        { id: 'student', content: zh('我 是 学生。', 'wǒ shì xuésheng') },
      ],
      answer: 'fine',
    },
  },
  {
    code: '4.3',
    title: 'Complete the dialogue',
    goal: 'Understand the context of a conversation.',
    config: {
      type: 'multipleChoice',
      instruction: 'Complete the chat',
      prompt: {
        kind: 'chat',
        lines: [
          {
            speaker: 'Li',
            avatar: '🧑',
            content: zh(
              '你 好！ 你 是 老师 吗？',
              'nǐ hǎo nǐ shì lǎoshī ma',
              'you | good | you | are | teacher | (question)',
            ),
          },
          { speaker: 'Anna', avatar: '👩', side: 'right', blank: true },
          {
            speaker: 'Li',
            avatar: '🧑',
            content: zh('我 是 老师。', 'wǒ shì lǎoshī', 'I | am | teacher'),
          },
        ],
      },
      options: [
        { id: 'student', content: zh('不 是， 我 是 学生。', 'bú shì wǒ shì xuésheng') },
        { id: 'bye', content: zh('谢谢， 再见。', 'xièxie zàijiàn') },
        { id: 'tea', content: zh('我 喝 茶。', 'wǒ hē chá') },
      ],
      answer: 'student',
    },
  },
  {
    code: '4.4',
    title: 'Fill several blanks',
    goal: 'Use grammar words in context, several at a time.',
    config: {
      type: 'fillBlanks',
      instruction: 'Fill in the blanks',
      prompt: { kind: 'text', text: 'I drink tea. Do you drink tea too?' },
      sentence: zh('我 ___ 茶。 你 ___ 喝 茶 ___ ？', 'wǒ _ chá nǐ _ hē chá', 'I | | tea | you | | drink | tea'),
      answers: ['喝', '也', '吗'],
      distractors: ['吃', '不', '呢'],
      pinyin: { 喝: 'hē', 也: 'yě', 吗: 'ma', 吃: 'chī', 不: 'bù', 呢: 'ne' },
    },
  },
  {
    code: '4.5',
    title: 'Put the dialogue in order',
    goal: 'Follow how a conversation flows.',
    config: {
      type: 'wordBank',
      instruction: 'Put the conversation in order',
      prompt: { kind: 'text', text: 'Two people meet for the first time.' },
      layout: 'lines',
      answer: ['你好！你叫什么名字？', '我叫林娜。你呢？', '我叫马大为。', '认识你很高兴！'],
    },
  },
];

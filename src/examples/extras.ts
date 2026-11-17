import { zh } from '../lib/content';
import type { Example } from './types';

export const extras: Example[] = [
  {
    code: '6.1',
    title: 'Stories and extended listening',
    goal: 'Understand longer texts in context.',
    config: {
      type: 'story',
      instruction: 'Listen to the story',
      title: 'At the café',
      steps: [
        {
          kind: 'line',
          speaker: 'Waiter',
          avatar: '🧑‍🍳',
          content: zh('你 好！', 'nǐ hǎo', 'you | good'),
          translation: 'Hello!',
        },
        {
          kind: 'line',
          speaker: 'Anna',
          avatar: '👩',
          content: zh('你 好！', 'nǐ hǎo', 'you | good'),
        },
        {
          kind: 'line',
          speaker: 'Waiter',
          avatar: '🧑‍🍳',
          content: zh('你 喝 茶 吗？', 'nǐ hē chá ma', 'you | drink | tea | (question)'),
        },
        {
          kind: 'line',
          speaker: 'Anna',
          avatar: '👩',
          content: zh(
            '我 不 喝 茶。 我 喝 水。',
            'wǒ bù hē chá wǒ hē shuǐ',
            "I | not, don't | drink | tea | I | drink | water",
          ),
        },
        {
          kind: 'question',
          prompt: 'What does Anna want to drink?',
          options: [
            { id: 'tea', text: 'Tea' },
            { id: 'water', text: 'Water' },
            { id: 'nothing', text: 'Nothing' },
          ],
          answer: 'water',
        },
        {
          kind: 'line',
          speaker: 'Waiter',
          avatar: '🧑‍🍳',
          content: zh('你 吃 米饭 吗？', 'nǐ chī mǐfàn ma', 'you | eat | rice | (question)'),
        },
        {
          kind: 'line',
          speaker: 'Anna',
          avatar: '👩',
          content: zh('我 吃 米饭。 谢谢！', 'wǒ chī mǐfàn xièxie', 'I | eat | rice | thank you'),
        },
        {
          kind: 'question',
          prompt: 'What will Anna eat?',
          options: [
            { id: 'apple', text: 'An apple' },
            { id: 'rice', text: 'Rice' },
          ],
          answer: 'rice',
        },
        {
          kind: 'line',
          speaker: 'Waiter',
          avatar: '🧑‍🍳',
          content: zh('不 客气。 再见！', 'bú kèqi zàijiàn', "not | polite (you're welcome) | goodbye"),
        },
        {
          kind: 'line',
          speaker: 'Anna',
          avatar: '👩',
          content: zh('再见！', 'zàijiàn', 'goodbye'),
        },
        {
          kind: 'question',
          prompt: 'How does the conversation end?',
          options: [
            { id: 'tea', text: 'Anna orders tea' },
            { id: 'bye', text: 'They say goodbye' },
          ],
          answer: 'bye',
        },
      ],
    },
  },
];

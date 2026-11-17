import { describe, expect, it } from 'vitest';
import prompt from '../../docs/create-lesson-prompt.md?raw';
import { parseLesson } from './lessons';

// The prompt teaches an AI the lesson format by example, so every example in
// it has to be something the app really accepts.
const blocks = [...prompt.matchAll(/```json\r?\n([\s\S]*?)```/g)].map((m) => JSON.parse(m[1]));

const asLesson = (exercise: unknown) => ({ title: 'Example', exercises: [exercise] });
const asPrompt = (content: unknown) =>
  asLesson({
    type: 'multipleChoice',
    prompt: content,
    options: [
      { id: 'a', content: { kind: 'text', text: 'a' } },
      { id: 'b', content: { kind: 'text', text: 'b' } },
    ],
    answer: 'a',
  });

describe('create-lesson prompt', () => {
  it('has examples for every content kind and exercise type', () => {
    const kinds = blocks.filter((b) => b.kind).map((b) => b.kind);
    const types = blocks.filter((b) => b.type).map((b) => b.type);
    expect(new Set(kinds)).toEqual(new Set(['text', 'hanzi', 'audio', 'image', 'sentence', 'chat']));
    expect(new Set(types)).toEqual(
      new Set(['multipleChoice', 'matchPairs', 'wordBank', 'strokeDraw', 'story']),
    );
  });

  it('only shows examples the app accepts', () => {
    for (const block of blocks) {
      if (block.type) expect(() => parseLesson(asLesson(block))).not.toThrow();
      else if (block.kind) expect(() => parseLesson(asPrompt(block))).not.toThrow();
      // The bare file skeleton has an empty exercise list on purpose.
      else if (block.exercises.length > 0) expect(() => parseLesson(block)).not.toThrow();
    }
  });

  it('includes a complete lesson that loads', () => {
    const lessons = blocks.filter((b) => Array.isArray(b.exercises) && b.exercises.length > 0);
    expect(lessons).toHaveLength(1);
    expect(parseLesson(lessons[0]).exercises).toHaveLength(5);
  });
});

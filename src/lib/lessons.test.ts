import { describe, expect, it } from 'vitest';
import { isPinyinPrompt } from './content';
import {
  folderLessons,
  folderProblems,
  LessonFormatError,
  lessonToJson,
  parseLesson,
  parseLessonText,
  slugify,
} from './lessons';

const valid = {
  title: 'Animals',
  exercises: [
    {
      type: 'multipleChoice',
      prompt: { kind: 'hanzi', hanzi: '猫' },
      options: [
        { id: 'cat', content: { kind: 'text', text: 'cat' } },
        { id: 'dog', content: { kind: 'text', text: 'dog' } },
      ],
      answer: 'cat',
    },
  ],
};

const problemsOf = (data: unknown): string[] => {
  try {
    parseLesson(data);
    return [];
  } catch (error) {
    return (error as LessonFormatError).problems;
  }
};

describe('parseLesson', () => {
  it('accepts a valid lesson and survives a JSON round trip', () => {
    const lesson = parseLesson(valid);
    expect(lesson.title).toBe('Animals');
    expect(parseLessonText(lessonToJson(lesson))).toEqual(lesson);
  });

  it('rejects files that are not lessons', () => {
    expect(problemsOf([])).toEqual(['The file must contain a JSON object.']);
    expect(problemsOf({})).toEqual(['Missing "title".', '"exercises" must be a non-empty list.']);
    expect(() => parseLessonText('{ not json')).toThrow(LessonFormatError);
  });

  it('says which exercise is wrong and why', () => {
    const lesson = {
      title: 'Broken',
      exercises: [
        { ...valid.exercises[0], answer: 'bird' },
        { type: 'quiz' },
        { type: 'strokeDraw', character: '你好' },
        {
          type: 'wordBank',
          prompt: { kind: 'text', text: 'I drink tea' },
          answer: ['我', '喝', '茶'],
          acceptedAnswers: [['我', '喝', '水']],
        },
        { type: 'matchPairs', pairs: [{ id: 'a', left: { kind: 'text' }, right: { kind: 'video' } }] },
      ],
    };
    const problems = problemsOf(lesson);
    expect(problems).toContain('Exercise 1: "answer" must be the id of one of the options');
    expect(problems.some((p) => p.startsWith('Exercise 2: unknown type "quiz"'))).toBe(true);
    expect(problems).toContain('Exercise 3: "character" must be exactly one character');
    expect(problems).toContain(
      'Exercise 4: accepted answer 1 uses the tile "水", which is not in the bank',
    );
    expect(problems).toContain('Exercise 5: needs at least 2 "pairs"');
  });
});

describe('slugify', () => {
  it('turns a file name into an id', () => {
    expect(slugify('My Lesson (2).JSON')).toBe('my-lesson-2');
    expect(slugify('课.json')).toBe('lesson');
  });
});

describe('lessons folder', () => {
  it('loads every file in /lessons without problems', () => {
    expect(folderProblems).toEqual([]);
    // Listed in file-name order, starting with the starter lessons.
    expect(folderLessons.map((l) => l.id).slice(0, 4)).toEqual([
      '01-first-words',
      '02-sounds-and-tones',
      '03-first-sentences',
      '04-fruit-with-pictures',
    ]);
    expect(new Set(folderLessons.map((l) => l.id)).size).toBe(folderLessons.length);
  });

  it('has no tile pinyin in pinyin → characters exercises', () => {
    const offenders = folderLessons.flatMap((lesson) =>
      lesson.exercises
        .map((exercise, i) => ({ exercise, at: `${lesson.id} #${i + 1}` }))
        .filter(({ exercise }) => exercise.type === 'wordBank' && isPinyinPrompt(exercise.prompt) && exercise.pinyin)
        .map(({ at }) => at),
    );
    expect(offenders).toEqual([]);
  });
});

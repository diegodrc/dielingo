import { isChinese } from './content';
import { findWord, toCells } from './grid';
import { stripTones, syllables, toneOf } from './pinyin';
import type { ExerciseConfig } from './types';

// ---------------------------------------------------------------------------
// Lesson files
//
// A lesson is a JSON file: { "title", "description"?, "exercises": [...] }.
// Files in /lessons ship with the site; files uploaded in the browser are kept
// in localStorage.
// ---------------------------------------------------------------------------

export interface LessonFile {
  title: string;
  description?: string;
  exercises: ExerciseConfig[];
}

export interface LessonEntry extends LessonFile {
  /** File name without extension; uploads are prefixed with "upload-". */
  id: string;
  source: 'folder' | 'upload';
}

/** Thrown by `parseLesson` with one message per problem found in the file. */
export class LessonFormatError extends Error {
  problems: string[];

  constructor(problems: string[]) {
    super(problems.join('\n'));
    this.name = 'LessonFormatError';
    this.problems = problems;
  }
}

// ---- Validation ------------------------------------------------------------

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isTextList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isText);

function checkContent(content: unknown, at: string, problems: string[]): void {
  if (!isObject(content)) {
    problems.push(`${at}: expected a content object with a "kind"`);
    return;
  }
  const need = (field: string) => {
    if (!isText(content[field])) problems.push(`${at}: "${content.kind}" needs a "${field}" text`);
  };

  switch (content.kind) {
    case 'text':
      return need('text');
    case 'hanzi':
      return need('hanzi');
    case 'audio':
      return need('speak');
    case 'image':
      need('label');
      if (!isText(content.emoji) && !isText(content.src)) {
        problems.push(`${at}: "image" needs an "emoji" or a "src"`);
      }
      return;
    case 'sentence':
      if (!Array.isArray(content.tokens) || content.tokens.length === 0) {
        problems.push(`${at}: "sentence" needs a non-empty "tokens" list`);
      } else if (!content.tokens.every((t) => isObject(t) && (t.blank === true || isText(t.hanzi)))) {
        problems.push(`${at}: every token needs a "hanzi" text (or "blank": true)`);
      }
      return;
    case 'chat':
      if (!Array.isArray(content.lines) || content.lines.length === 0) {
        problems.push(`${at}: "chat" needs a non-empty "lines" list`);
        return;
      }
      content.lines.forEach((line, i) => {
        if (!isObject(line)) problems.push(`${at}, line ${i + 1}: expected an object`);
        else if (line.content !== undefined) checkContent(line.content, `${at}, line ${i + 1}`, problems);
        else if (line.blank !== true) problems.push(`${at}, line ${i + 1}: needs "content" or "blank": true`);
      });
      return;
    default:
      problems.push(
        `${at}: unknown content kind ${JSON.stringify(content.kind)} (use text, hanzi, audio, image, sentence or chat)`,
      );
  }
}

/** Checks a list of `{ id, ... }` items and that `answer` is one of the ids. */
function checkAnswer(items: unknown[], answer: unknown, at: string, problems: string[]): void {
  const ids = items.map((item) => (isObject(item) ? item.id : undefined));
  if (!ids.every(isText)) problems.push(`${at}: every option needs an "id"`);
  else if (new Set(ids).size !== ids.length) problems.push(`${at}: option ids must be unique`);
  if (!isText(answer) || !ids.includes(answer)) {
    problems.push(`${at}: "answer" must be the id of one of the options`);
  }
}

function checkExercise(exercise: unknown, at: string, problems: string[]): void {
  if (!isObject(exercise)) {
    problems.push(`${at}: expected an object`);
    return;
  }

  switch (exercise.type) {
    case 'multipleChoice': {
      if (exercise.prompt !== undefined) checkContent(exercise.prompt, `${at}, prompt`, problems);
      if (!Array.isArray(exercise.options) || exercise.options.length < 2) {
        problems.push(`${at}: needs at least 2 "options"`);
        return;
      }
      exercise.options.forEach((option, i) =>
        checkContent(isObject(option) ? option.content : undefined, `${at}, option ${i + 1}`, problems),
      );
      checkAnswer(exercise.options, exercise.answer, at, problems);
      return;
    }

    case 'matchPairs': {
      if (!Array.isArray(exercise.pairs) || exercise.pairs.length < 2) {
        problems.push(`${at}: needs at least 2 "pairs"`);
        return;
      }
      const ids = exercise.pairs.map((pair) => (isObject(pair) ? pair.id : undefined));
      if (!ids.every(isText) || new Set(ids).size !== ids.length) {
        problems.push(`${at}: every pair needs a unique "id"`);
      }
      exercise.pairs.forEach((pair, i) => {
        checkContent(isObject(pair) ? pair.left : undefined, `${at}, pair ${i + 1} left`, problems);
        checkContent(isObject(pair) ? pair.right : undefined, `${at}, pair ${i + 1} right`, problems);
      });
      return;
    }

    case 'wordBank': {
      checkContent(exercise.prompt, `${at}, prompt`, problems);
      if (!isTextList(exercise.answer) || exercise.answer.length === 0) {
        problems.push(`${at}: "answer" must be a non-empty list of tiles`);
        return;
      }
      if (exercise.distractors !== undefined && !isTextList(exercise.distractors)) {
        problems.push(`${at}: "distractors" must be a list of tiles`);
        return;
      }
      if (exercise.layout !== undefined && !['inline', 'lines'].includes(exercise.layout as string)) {
        problems.push(`${at}: "layout" must be inline or lines`);
      }
      const accepted = exercise.acceptedAnswers;
      if (accepted === undefined) return;
      if (!Array.isArray(accepted) || !accepted.every(isTextList)) {
        problems.push(`${at}: "acceptedAnswers" must be a list of tile lists`);
        return;
      }
      // Every accepted answer has to be buildable from the tiles in the bank.
      const bank = [...exercise.answer, ...((exercise.distractors as string[] | undefined) ?? [])];
      accepted.forEach((tiles, i) => {
        const left = [...bank];
        for (const tile of tiles) {
          const index = left.indexOf(tile);
          if (index === -1) {
            problems.push(`${at}: accepted answer ${i + 1} uses the tile "${tile}", which is not in the bank`);
            return;
          }
          left.splice(index, 1);
        }
      });
      return;
    }

    case 'strokeDraw':
      if (!isText(exercise.character) || [...exercise.character].length !== 1) {
        problems.push(`${at}: "character" must be exactly one character`);
      }
      if (exercise.guide !== undefined && !['full', 'faint', 'none'].includes(exercise.guide as string)) {
        problems.push(`${at}: "guide" must be full, faint or none`);
      }
      return;

    case 'story': {
      if (!isText(exercise.title)) problems.push(`${at}: needs a "title"`);
      if (!Array.isArray(exercise.steps) || exercise.steps.length === 0) {
        problems.push(`${at}: needs a non-empty "steps" list`);
        return;
      }
      exercise.steps.forEach((step, i) => {
        const where = `${at}, step ${i + 1}`;
        if (!isObject(step)) problems.push(`${where}: expected an object`);
        else if (step.kind === 'line') {
          checkContent(step.content, where, problems);
          if (isObject(step.content) && !['text', 'hanzi', 'sentence'].includes(step.content.kind as string)) {
            problems.push(`${where}: a story line must be text, hanzi or sentence`);
          }
        } else if (step.kind === 'question') {
          if (!isText(step.prompt)) problems.push(`${where}: needs a "prompt"`);
          if (!Array.isArray(step.options) || step.options.length < 2) {
            problems.push(`${where}: needs at least 2 "options"`);
          } else {
            if (!step.options.every((o) => isObject(o) && isText(o.text))) {
              problems.push(`${where}: every option needs a "text"`);
            }
            checkAnswer(step.options, step.answer, where, problems);
          }
        } else problems.push(`${where}: "kind" must be line or question`);
      });
      return;
    }

    case 'typePinyin': {
      checkContent(exercise.prompt, `${at}, prompt`, problems);
      if (!isText(exercise.answer) || !/\p{L}/u.test(exercise.answer) || isChinese(exercise.answer)) {
        problems.push(`${at}: "answer" must be the pinyin, with tone marks`);
      }
      if (exercise.acceptedAnswers !== undefined && !isTextList(exercise.acceptedAnswers)) {
        problems.push(`${at}: "acceptedAnswers" must be a list of texts`);
      }
      // The prompt must not show what the learner has to type.
      const prompt = exercise.prompt;
      const showsPinyin =
        isObject(prompt) &&
        ((prompt.kind === 'hanzi' && prompt.pinyin) ||
          (prompt.kind === 'sentence' && Array.isArray(prompt.tokens) && prompt.tokens.some((t) => isObject(t) && t.pinyin)));
      if (showsPinyin) problems.push(`${at}: the prompt shows pinyin, which is the answer; leave "pinyin" out`);
      return;
    }

    case 'tones': {
      if (!isText(exercise.word) || !isChinese(exercise.word)) problems.push(`${at}: "word" must be in characters`);
      if (!isText(exercise.pinyin)) {
        problems.push(`${at}: needs the "pinyin" with tone marks`);
        return;
      }
      const parts = syllables(exercise.pinyin);
      if (parts.length === 0 || parts.some((p) => !/^\p{L}+$/u.test(p) || !/^[a-zü]+$/i.test(stripTones(p)))) {
        problems.push(`${at}: "pinyin" must be letters only, one syllable per word, separated by spaces`);
      }
      if (parts.some((p) => [...p].filter((c) => toneOf(c) > 0).length > 1)) {
        problems.push(`${at}: each syllable in "pinyin" can have only one tone mark`);
      }
      if (isText(exercise.word) && [...exercise.word].filter(isChinese).length !== parts.length) {
        problems.push(`${at}: "pinyin" needs one syllable per character, separated by spaces ("nǐ hǎo")`);
      }
      return;
    }

    case 'fillBlanks': {
      if (exercise.prompt !== undefined) checkContent(exercise.prompt, `${at}, prompt`, problems);
      const sentence = exercise.sentence;
      if (!isObject(sentence) || sentence.kind !== 'sentence') {
        problems.push(`${at}: "sentence" must be a sentence object`);
        return;
      }
      checkContent(sentence, `${at}, sentence`, problems);
      const gaps = Array.isArray(sentence.tokens) ? sentence.tokens.filter((t) => isObject(t) && t.blank === true).length : 0;
      if (gaps === 0) problems.push(`${at}: the sentence needs at least one "blank": true token`);
      if (!isTextList(exercise.answers) || exercise.answers.length !== gaps) {
        problems.push(`${at}: "answers" needs one word per blank (${gaps})`);
      }
      if (exercise.distractors !== undefined && !isTextList(exercise.distractors)) {
        problems.push(`${at}: "distractors" must be a list of words`);
      }
      return;
    }

    case 'buildCharacter': {
      const single = (v: unknown) => isText(v) && [...v].length === 1;
      if (!single(exercise.character)) problems.push(`${at}: "character" must be exactly one character`);
      if (!Array.isArray(exercise.parts) || exercise.parts.length < 2 || exercise.parts.length > 4 || !exercise.parts.every(single)) {
        problems.push(`${at}: "parts" must be 2 to 4 single characters, in reading order`);
      }
      if (exercise.distractors !== undefined && (!Array.isArray(exercise.distractors) || !exercise.distractors.every(single))) {
        problems.push(`${at}: "distractors" must be single characters`);
      }
      return;
    }

    case 'wordSearch': {
      if (!isTextList(exercise.grid) || exercise.grid.length < 2) {
        problems.push(`${at}: "grid" must be at least 2 rows of characters`);
        return;
      }
      const grid = toCells(exercise.grid);
      if (grid.some((row) => row.length !== grid[0].length) || grid[0].length < 2) {
        problems.push(`${at}: every row of "grid" must have the same number of characters (at least 2)`);
        return;
      }
      if (!Array.isArray(exercise.words) || exercise.words.length === 0) {
        problems.push(`${at}: needs a non-empty "words" list`);
        return;
      }
      const seen = new Set<string>();
      exercise.words.forEach((w, i) => {
        if (!isObject(w) || !isText(w.word) || [...w.word].length < 2) {
          problems.push(`${at}, word ${i + 1}: needs a "word" of at least 2 characters`);
          return;
        }
        if (seen.has(w.word)) problems.push(`${at}: "${w.word}" is listed twice`);
        seen.add(w.word);
        if (!findWord(grid, w.word)) {
          problems.push(`${at}: "${w.word}" is not in the grid in a straight line`);
        }
      });
      return;
    }

    default:
      problems.push(
        `${at}: unknown type ${JSON.stringify(exercise.type)} (use multipleChoice, matchPairs, wordBank, typePinyin, tones, fillBlanks, buildCharacter, wordSearch, strokeDraw or story)`,
      );
  }
}

/** Validates parsed JSON as a lesson. Throws `LessonFormatError` listing every problem. */
export function parseLesson(data: unknown): LessonFile {
  if (!isObject(data)) throw new LessonFormatError(['The file must contain a JSON object.']);

  const problems: string[] = [];
  if (!isText(data.title)) problems.push('Missing "title".');
  if (data.description !== undefined && typeof data.description !== 'string') {
    problems.push('"description" must be text.');
  }
  if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
    problems.push('"exercises" must be a non-empty list.');
  } else {
    data.exercises.forEach((exercise, i) => checkExercise(exercise, `Exercise ${i + 1}`, problems));
  }
  if (problems.length > 0) throw new LessonFormatError(problems);

  return {
    title: data.title as string,
    ...(data.description ? { description: data.description as string } : {}),
    exercises: data.exercises as ExerciseConfig[],
  };
}

/** Parses the text of a .json file. */
export function parseLessonText(text: string): LessonFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new LessonFormatError([`Not valid JSON: ${(error as Error).message}`]);
  }
  return parseLesson(data);
}

export function lessonToJson({ title, description, exercises }: LessonFile): string {
  return JSON.stringify({ title, description, exercises }, null, 2) + '\n';
}

export function slugify(name: string): string {
  return (
    name
      .replace(/\.json$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lesson'
  );
}

// ---- Lessons in the /lessons folder ----------------------------------------

const files = import.meta.glob<unknown>('/lessons/*.json', { eager: true, import: 'default' });

/** Files in /lessons that could not be loaded, with the reasons. */
export const folderProblems: { file: string; problems: string[] }[] = [];

export const folderLessons: LessonEntry[] = Object.keys(files)
  .sort()
  .flatMap((path) => {
    const file = path.split('/').pop()!;
    try {
      return [{ id: slugify(file), source: 'folder' as const, ...parseLesson(files[path]) }];
    } catch (error) {
      folderProblems.push({ file, problems: (error as LessonFormatError).problems ?? [String(error)] });
      return [];
    }
  });

// ---- Browser storage: uploaded lessons and progress -------------------------

const UPLOADS_KEY = 'dielingo.uploads.v1';
const PROGRESS_KEY = 'dielingo.progress.v1';

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

/** Returns false when the browser refuses to store (private mode, quota). */
function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadUploads(): LessonEntry[] {
  const stored = read(UPLOADS_KEY);
  if (!Array.isArray(stored)) return [];
  return stored.flatMap((item) => {
    try {
      if (!isObject(item) || !isText(item.id)) return [];
      return [{ id: item.id, source: 'upload' as const, ...parseLesson(item) }];
    } catch {
      return [];
    }
  });
}

export function saveUploads(uploads: LessonEntry[]): boolean {
  return write(UPLOADS_KEY, uploads);
}

export interface LessonProgress {
  /** Times the lesson was finished. */
  completions: number;
  /** Best accuracy so far, 0–100. */
  bestAccuracy: number;
}

export type ProgressMap = Record<string, LessonProgress>;

export function loadProgress(): ProgressMap {
  const stored = read(PROGRESS_KEY);
  return isObject(stored) ? (stored as ProgressMap) : {};
}

export function saveProgress(progress: ProgressMap): boolean {
  return write(PROGRESS_KEY, progress);
}

# Dielingo

Generic, configurable React components for Chinese practice exercises (English → Chinese),
with one beginner example for each of the 17 exercise types.

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

- **Lessons** (`#/`): every lesson, with upload, download, and your completion history.
- **Exercise types** (`#/types`): catalogue of the 17 examples, each with its config object.

## Lessons

A lesson is one `.json` file:

```json
{
  "title": "First words",
  "description": "Optional one-line summary.",
  "exercises": [
    {
      "type": "multipleChoice",
      "instruction": "What does this mean?",
      "prompt": { "kind": "hanzi", "hanzi": "狗", "pinyin": "gǒu", "speak": true },
      "options": [
        { "id": "dog", "content": { "kind": "text", "text": "dog" } },
        { "id": "cat", "content": { "kind": "text", "text": "cat" } }
      ],
      "answer": "dog"
    }
  ]
}
```

`exercises` takes the same objects described below. There are two ways to add a lesson:

- **Put the file in `lessons/`.** It ships with the site for everyone. Lessons are listed in
  file-name order, so prefix them (`01-…`, `02-…`). The dev server picks up new files by
  itself; a deployed site needs a rebuild.
- **Upload it on the Lessons page** (button or drag and drop). It is saved in that browser's
  localStorage only. Uploading a file with the same name replaces the earlier one. Uploaded
  lessons can be deleted from the page.

Files are validated when loaded; an invalid one is rejected with a list of what is wrong
(for example `Exercise 3: "answer" must be the id of one of the options`). The quickest way
to write a new lesson is to download an existing one from the page (⬇) and edit it.

Completion (times finished and best accuracy) is also stored in the browser.

### Writing a lesson with an AI assistant

[docs/create-lesson-prompt.md](docs/create-lesson-prompt.md) is a ready-to-paste prompt. Give
it to an AI assistant and it will ask what the lesson should teach, the level, how many
questions and which exercise types, show a plan, and then produce the `.json` to upload. The
same prompt can be copied from the app: **Lessons → Create with AI**. Every JSON example in
it is checked against the app's validator by the test suite, so keep them valid when editing.

### First-visit tutorial

The first time someone opens the site, a three-step guide explains what Dielingo is, how to
do a lesson, and how to create one with the prompt above. It is remembered in the browser
and can be reopened with the **?** button in the header.

## How it works

Every question is a plain object. Five components cover all 17 exercise types:

| `type` | Component | Exercises |
|---|---|---|
| `multipleChoice` | `MultipleChoice` | 1.1, 1.4, 2.1, 2.2, 3.3, 4.1, 4.2, 4.3 |
| `matchPairs` | `MatchPairs` | 1.2, 1.3, 2.3 |
| `wordBank` | `WordBank` | 2.4, 2.5, 3.1, 3.2 |
| `strokeDraw` | `StrokeDraw` | 1.5 |
| `story` | `Story` | 6.1 |

What changes between, say, "pick the picture" and "pick the sound" is only the **content**
of the prompt and options. Content comes in six kinds (see `src/lib/types.ts`):

```ts
{ kind: 'text', text: 'water' }                              // English
{ kind: 'hanzi', hanzi: '水', pinyin: 'shuǐ', speak: true }   // word/character
{ kind: 'audio', speak: '水', slow: true }                    // sound only (+ turtle)
{ kind: 'image', emoji: '💧', label: 'water' }                // or src: '/img/water.png'
{ kind: 'sentence', tokens: [...] }                          // words with tap-to-see hints
{ kind: 'chat', lines: [...] }                               // dialogue with a missing line
```

## Creating a question

```tsx
import { Exercise, Lesson, zh, type ExerciseConfig } from './src';

const questions: ExerciseConfig[] = [
  {
    type: 'multipleChoice',
    instruction: 'What does this mean?',
    prompt: { kind: 'hanzi', hanzi: '狗', pinyin: 'gǒu', speak: true },
    options: [
      { id: 'dog', content: { kind: 'text', text: 'dog' } },
      { id: 'cat', content: { kind: 'text', text: 'cat' } },
    ],
    answer: 'dog',
  },
  {
    type: 'wordBank',
    instruction: 'Write this in English',
    // zh(words, pinyin, hints): words split by spaces, hints by "|"
    prompt: zh('我 喝 水', 'wǒ hē shuǐ', 'I | drink | water', { speak: true }),
    answer: ['I', 'drink', 'water'],
    distractors: ['tea', 'eat'],
  },
];

<Lesson exercises={questions} onComplete={(result) => console.log(result)} />
// or a single one:
<Exercise config={questions[0]} onResult={({ correct }) => {}} onContinue={() => {}} />
```

The examples in `src/examples/` show a config for every exercise type; copy the closest one.

### Things worth knowing

- **Audio** uses the browser's speech synthesis. Audio options are written as Chinese
  characters (`speak: '麻'`), because the voice reads characters, not pinyin. If the system
  has no Chinese voice the site shows a warning (on Windows: Settings → Time & language →
  Speech → add Chinese (Simplified)).
- **Pictures** are `image` content with either an `emoji` or a `src`. `src` can be a full
  `https://` link to an image file, or a path to a file in `public/` (for example
  `images/fruits/apple.svg`, which is `public/images/fruits/apple.svg`). Lessons uploaded in
  the browser should use full links. `lessons/04-fruit-with-pictures.json` is a worked example
  with pictures as options, as a prompt and in a match.
- **Tap to hear**: tapping Chinese text (a prompt character, a word in a sentence, a match
  card, an option, a word tile) reads it aloud. This is switched off automatically in
  exercises with audio-only content, where the sound is the answer. Set `tapToSpeak: false`
  (or `true`) on an exercise to override, as the character ↔ pinyin match does.
- **`wordBank` grading** is an exact match against `answer` or one of `acceptedAnswers`.
  List every translation you want to accept, and make sure its tiles exist in
  `answer` + `distractors`.
- **`strokeDraw`** takes one character. Stroke data is downloaded from the hanzi-writer CDN,
  so it needs an internet connection. `guide` can be `full`, `faint` or `none`.
- **Shuffling** happens once per mount. Give `<Exercise>` a new `key` to restart it. Set
  `shuffle: false` on a config to keep the written order.
- **Settings** (`showPinyin`, `speechRate`, `autoPlay`, `shuffle`, `seed`) come from
  `<SettingsProvider>`; exercises also work without it.

## Layout

```
lessons/        one .json file per lesson
docs/           create-lesson-prompt.md (the prompt for AI assistants)
src/
  lib/          types, content helpers (zh), grading, shuffle, speech, settings,
                lessons (file format, validation, storage)
  components/
    primitives/ ContentView, AudioButton, HanziText, OptionCard
    exercises/  MultipleChoice, MatchPairs, WordBank, StrokeDraw, Story
    shell/      Exercise (dispatch by type), ExerciseFrame, Lesson
  examples/     one config per exercise type
  pages/        Lessons, LessonPlayer, Gallery, Tutorial
  index.ts      public exports
```

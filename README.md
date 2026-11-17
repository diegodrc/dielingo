# Dielingo

Generic, configurable React components for Chinese practice exercises (English → Chinese),
with one beginner example for each of the 17 exercise types.

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

- **Exercises** (`#/`): catalogue of the 17 examples, each with its config object.
- **Demo lesson** (`#/lesson`): a lesson mixing the types, with progress and retries.

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
src/
  lib/          types, content helpers (zh), grading, shuffle, speech, settings
  components/
    primitives/ ContentView, AudioButton, HanziText, OptionCard
    exercises/  MultipleChoice, MatchPairs, WordBank, StrokeDraw, Story
    shell/      Exercise (dispatch by type), ExerciseFrame, Lesson
  examples/     one config per exercise type + the demo lesson
  pages/        Gallery
  index.ts      public exports
```

# Create a Dielingo lesson

You are helping me create a lesson for **Dielingo**, a web app for practising Mandarin Chinese
from English. A lesson is a single JSON file that I will upload to the app. Your job is to
interview me first, then write that file.

## How to work with me

Follow these steps in order. **Do not write any JSON until step 3.**

### Step 1 — Ask me these questions

Ask all of them in one message, as a short numbered list, and then wait for my answers. If I
already answered one in my first message, skip it. If I say "you decide" (or skip a question),
use the default.

1. **Content** — What should the lesson teach? (a topic such as "ordering food", a word list,
   a grammar point, or a text I paste in). *No default: you need this one.*
2. **Level** — Absolute beginner, HSK 1, HSK 2, …? *Default: absolute beginner.*
3. **Number of questions** — How many exercises? *Default: 10.*
4. **Exercise types** — Do I want specific types (for example only listening, or only
   matching and drawing), or a mix that explores all of them? Show me the list of 24 types
   from "Exercise catalogue" below, by name only, so I can choose. *Default: a varied mix.*
5. **Words I already know** — Any vocabulary you can rely on without teaching it?
   *Default: none; only use words the lesson itself introduces.*
6. **Title** — A name for the lesson. *Default: you propose one.*

If one of my answers is unclear or contradicts another (for example "5 questions exploring
all 24 types"), ask a follow-up question before going on.

### Step 2 — Show me a plan and wait for my OK

Reply with:

- the lesson title and a one-sentence description;
- the vocabulary and sentences you will use, each with characters, pinyin and English;
- a numbered outline: for each exercise, its type and what it asks.

Then ask: "Should I generate the lesson, or do you want to change anything?" Apply any
changes I ask for and show the plan again until I approve it.

### Step 3 — Generate the file

Once I approve, reply with:

1. One ```` ```json ```` code block containing the **complete** lesson and nothing else: no
   comments, no trailing commas, no `...` placeholders.
2. A suggested file name, such as `ordering-food.json`.
3. This reminder: *"Save this as a .json file, then in Dielingo open Lessons → Upload lesson
   and choose the file."*

Before you send it, check it against "Checklist" at the end of this document. If I later
report an error message from the app, fix the file and send the complete JSON again.

## Teaching guidelines

- Use **simplified** characters and pinyin **with tone marks** (nǐ hǎo, never ni3 hao3 or
  ni hao).
- Introduce before you test: start with recognition (pictures, meanings, matching), move to
  listening, then to building sentences. Put stories and dialogues near the end.
- Reuse the same small vocabulary across several exercises. 5–8 new words is plenty for a
  10-exercise lesson.
- Wrong options should be plausible: other words from the lesson, or look-alike and
  sound-alike words. Never make two options correct.
- Keep the app's instructions in English.
- The app reads Chinese aloud with the browser's text-to-speech voice. It reads
  **characters**, not pinyin, so every audio item must be written in characters.

## File format

```json
{
  "title": "Greetings",
  "description": "Say hello and ask how someone is.",
  "exercises": []
}
```

- `title` (required), `description` (optional, one sentence).
- `exercises` (required): a list of exercise objects, in the order they are shown. When the
  learner gets one wrong, the app shows it again at the end of the lesson.

### Content objects

Prompts, options and match items are all "content" objects. There are six kinds:

| `kind` | Fields | What it shows |
|---|---|---|
| `text` | `text` | Plain English text. |
| `hanzi` | `hanzi`, optional `pinyin`, optional `speak` | A Chinese word or character. `"speak": true` adds an audio button when it is a prompt. |
| `audio` | `speak`, optional `slow` | A sound button with **no text**. `speak` is the Chinese text to read, in characters. `"slow": true` adds a slow-playback button. |
| `image` | `label`, and `emoji` **or** `src` | A picture card: a single emoji, or an image file given by its link in `src`. `label` is the English name (used for accessibility, not shown). |
| `sentence` | `tokens`, optional `speak` | A Chinese sentence split into words. See below. |
| `chat` | `lines` | A short chat with one missing line. See below. |

```json
{ "kind": "text", "text": "water" }
```

```json
{ "kind": "hanzi", "hanzi": "水", "pinyin": "shuǐ", "speak": true }
```

```json
{ "kind": "audio", "speak": "我喝水", "slow": true }
```

```json
{ "kind": "image", "emoji": "💧", "label": "water" }
```

```json
{ "kind": "image", "src": "https://example.com/pictures/water.png", "label": "water" }
```

**Pictures: emoji by default.** Use `emoji` unless I give you image links. Never invent an
image URL or guess one from memory: a link that does not exist shows a broken picture. If I
ask for real pictures, ask me for one full `https://` link per picture (a direct link to a
`.png`, `.jpg`, `.svg` or `.webp` file) and use exactly the links I give you.

**Sentence.** One token per word. Each token has `hanzi`, and optionally `pinyin` and `hint`
(the English meaning, shown when the learner taps the word). Attach punctuation to the word
before it. A token with `"blank": true` (and `"hanzi": ""`) renders a gap to fill.

```json
{
  "kind": "sentence",
  "speak": true,
  "tokens": [
    { "hanzi": "我", "pinyin": "wǒ", "hint": "I" },
    { "hanzi": "喝", "pinyin": "hē", "hint": "drink" },
    { "hanzi": "水。", "pinyin": "shuǐ", "hint": "water" }
  ]
}
```

**Chat.** A list of lines. Each line has an optional `speaker`, an optional `avatar` (one
emoji), an optional `side` (`"left"` or `"right"`), and either `content` (a `text`, `hanzi`
or `sentence` object) or `"blank": true` for the missing line. Use exactly one blank line.

```json
{
  "kind": "chat",
  "lines": [
    {
      "speaker": "Li",
      "avatar": "🧑",
      "content": {
        "kind": "sentence",
        "tokens": [
          { "hanzi": "你", "pinyin": "nǐ", "hint": "you" },
          { "hanzi": "好！", "pinyin": "hǎo", "hint": "good" }
        ]
      }
    },
    { "speaker": "Anna", "avatar": "👩", "side": "right", "blank": true }
  ]
}
```

### Exercise objects

Every exercise has a `type` and an optional `instruction` (the English heading, such as
"What does this mean?"). There are ten types.

When the learner taps Chinese text, the app reads it aloud. It turns this off by itself in
exercises that contain `audio` content, where the sound is the answer. Any exercise can also
set `"tapToSpeak": false` to keep its text silent; use it when hearing the word would give the
answer away, as in "Match character ↔ pinyin".

#### `multipleChoice` — one prompt, several options, one correct

- `prompt` (optional): any content object.
- `options`: 2 to 4 items, each `{ "id", "content" }`. Ids must be unique within the exercise.
- `answer`: the `id` of the correct option.
- `layout` (optional): `"grid"` or `"list"`. Picture options use a grid automatically.

Options are shuffled by the app, so the position of the correct one does not matter.

```json
{
  "type": "multipleChoice",
  "instruction": "What does this mean?",
  "prompt": { "kind": "hanzi", "hanzi": "猫", "pinyin": "māo", "speak": true },
  "options": [
    { "id": "cat", "content": { "kind": "text", "text": "cat" } },
    { "id": "dog", "content": { "kind": "text", "text": "dog" } },
    { "id": "person", "content": { "kind": "text", "text": "person" } }
  ],
  "answer": "cat"
}
```

#### `matchPairs` — two columns to pair up

- `pairs`: 4 or 5 items, each `{ "id", "left", "right" }`, where `left` and `right` are
  content objects. Ids must be unique. Both columns are shuffled by the app.

```json
{
  "type": "matchPairs",
  "instruction": "Tap the matching pairs",
  "pairs": [
    { "id": "water", "left": { "kind": "text", "text": "water" }, "right": { "kind": "hanzi", "hanzi": "水", "pinyin": "shuǐ" } },
    { "id": "tea", "left": { "kind": "text", "text": "tea" }, "right": { "kind": "hanzi", "hanzi": "茶", "pinyin": "chá" } },
    { "id": "cat", "left": { "kind": "text", "text": "cat" }, "right": { "kind": "hanzi", "hanzi": "猫", "pinyin": "māo" } },
    { "id": "dog", "left": { "kind": "text", "text": "dog" }, "right": { "kind": "hanzi", "hanzi": "狗", "pinyin": "gǒu" } }
  ]
}
```

#### `wordBank` — build a sentence from word tiles

- `prompt`: a content object (English `text`, a Chinese `sentence`, or `audio`).
- `answer`: the tiles of the correct sentence, in order. One word per tile.
- `distractors` (optional): 2 to 4 extra wrong tiles.
- `acceptedAnswers` (optional): other tile sequences that are also correct. Every tile they
  use must exist in `answer` + `distractors`.
- `pinyin` (optional): for Chinese tiles, a map from tile text to its pinyin. **Leave it
  out when the prompt is pinyin** ("Pinyin → characters" below): pinyin on the tiles would
  be the answer. The app hides it there anyway, and also turns off the tiles' sound.

- `layout` (optional): `"inline"` (the default, tiles flow like words) or `"lines"` (one
  tile per line). Use `"lines"` with whole sentences as tiles to put a dialogue in order.

Grading is an exact match, so list every correct answer. English tiles are case-sensitive:
capitalise only the first word and proper nouns, and leave out the final full stop.

```json
{
  "type": "wordBank",
  "instruction": "Write this in English",
  "prompt": {
    "kind": "sentence",
    "speak": true,
    "tokens": [
      { "hanzi": "我", "pinyin": "wǒ", "hint": "I" },
      { "hanzi": "不", "pinyin": "bù", "hint": "not, don't" },
      { "hanzi": "吃", "pinyin": "chī", "hint": "eat" },
      { "hanzi": "米饭", "pinyin": "mǐfàn", "hint": "rice" }
    ]
  },
  "answer": ["I", "don't", "eat", "rice"],
  "acceptedAnswers": [["I", "do", "not", "eat", "rice"]],
  "distractors": ["do", "not", "drink", "tea"]
}
```

```json
{
  "type": "wordBank",
  "instruction": "Write this in Chinese",
  "prompt": { "kind": "text", "text": "I am a student" },
  "answer": ["我", "是", "学生"],
  "distractors": ["老师", "你", "不"],
  "pinyin": { "我": "wǒ", "是": "shì", "学生": "xuésheng", "老师": "lǎoshī", "你": "nǐ", "不": "bù" }
}
```

```json
{
  "type": "wordBank",
  "instruction": "Put the conversation in order",
  "prompt": { "kind": "text", "text": "Two people meet for the first time." },
  "layout": "lines",
  "answer": ["你好！你叫什么名字？", "我叫林娜。你呢？", "我叫马大为。", "认识你很高兴！"]
}
```

#### `strokeDraw` — trace a character stroke by stroke

- `character`: **exactly one** common simplified character.
- `pinyin`, `meaning` (optional but recommended).
- `guide` (optional): `"full"` (outline and hints, the default), `"faint"` (light outline,
  fewer hints) or `"none"` (no help). Use `"full"` for a character's first appearance.

```json
{
  "type": "strokeDraw",
  "instruction": "Trace the character",
  "character": "人",
  "pinyin": "rén",
  "meaning": "person",
  "guide": "full"
}
```

#### `story` — a longer text with comprehension questions

- `title`: the story's title.
- `steps`: a list shown one at a time. Each step is either
  - a line: `{ "kind": "line", "content", "speaker"?, "avatar"?, "translation"? }`, where
    `content` is a `text`, `hanzi` or `sentence` object (lines are read aloud automatically);
  - or a question: `{ "kind": "question", "prompt", "options", "answer" }`, where `prompt` is
    English text, `options` is 2 or 3 items of `{ "id", "text" }` and `answer` is the correct
    `id`.

Use 6 to 12 lines and 2 or 3 questions. Put each question right after the lines it is about.

```json
{
  "type": "story",
  "instruction": "Listen to the story",
  "title": "At the café",
  "steps": [
    {
      "kind": "line",
      "speaker": "Waiter",
      "avatar": "🧑‍🍳",
      "content": {
        "kind": "sentence",
        "tokens": [
          { "hanzi": "你", "pinyin": "nǐ", "hint": "you" },
          { "hanzi": "喝", "pinyin": "hē", "hint": "drink" },
          { "hanzi": "茶", "pinyin": "chá", "hint": "tea" },
          { "hanzi": "吗？", "pinyin": "ma", "hint": "(question)" }
        ]
      }
    },
    {
      "kind": "line",
      "speaker": "Anna",
      "avatar": "👩",
      "content": {
        "kind": "sentence",
        "tokens": [
          { "hanzi": "我", "pinyin": "wǒ", "hint": "I" },
          { "hanzi": "喝", "pinyin": "hē", "hint": "drink" },
          { "hanzi": "水。", "pinyin": "shuǐ", "hint": "water" }
        ]
      }
    },
    {
      "kind": "question",
      "prompt": "What does Anna want to drink?",
      "options": [
        { "id": "tea", "text": "Tea" },
        { "id": "water", "text": "Water" }
      ],
      "answer": "water"
    }
  ]
}
```

#### `typePinyin` — type the pinyin

The learner types the pinyin of what they see or hear. They can type tones as numbers
(`ni3 hao3`), which the app shows as marks. Spaces, capitals and punctuation don't matter.

- `prompt`: what to transcribe: a `hanzi` or `sentence` **without** `pinyin`, or `audio`.
  A prompt that shows pinyin is rejected, because it is the answer.
- `answer`: the pinyin with tone marks, such as `"nǐ hǎo"`.
- `acceptedAnswers` (optional): other spellings that are also correct.
- `requireTones` (optional): `false` to accept answers without tones. Default `true`.

Keep answers short: one word, or a sentence of up to five syllables.

```json
{
  "type": "typePinyin",
  "instruction": "Type the pinyin",
  "prompt": { "kind": "hanzi", "hanzi": "谢谢" },
  "answer": "xièxie"
}
```

```json
{
  "type": "typePinyin",
  "instruction": "Type what you hear in pinyin",
  "prompt": { "kind": "audio", "speak": "我很忙", "slow": true },
  "answer": "wǒ hěn máng"
}
```

#### `tones` — choose the tone of each syllable

The app plays the word, and for each syllable the learner picks one of five spellings
(first to fourth tone, and the neutral tone).

- `word`: the word in characters.
- `pinyin`: its pinyin with tone marks, **one syllable per character, separated by spaces**:
  `"Zhōng guó"`, not `"Zhōngguó"`. A syllable with no mark is the neutral tone (`"xiè xie"`).
  Write the tones a dictionary gives, except 不 before a fourth tone, which is `bú`.
- `meaning` (optional): shown next to the word.
- `speak` (optional): `false` to test reading instead of listening. Default `true`.

```json
{
  "type": "tones",
  "instruction": "Choose the tone of each syllable",
  "word": "你好",
  "pinyin": "nǐ hǎo",
  "meaning": "hello"
}
```

#### `fillBlanks` — a sentence with several gaps

The learner fills every gap from one word bank, in order.

- `prompt` (optional): context shown above, usually the English meaning. Add it whenever
  more than one word could fit a gap.
- `sentence`: a `sentence` object with one `"blank": true` token (and `"hanzi": ""`) per gap.
- `answers`: the word for each gap, in order. A word needed twice is listed twice.
- `distractors` (optional): 2 or 3 wrong words. None of them may also fit its gap.
- `pinyin` (optional): pinyin for Chinese bank words, as in `wordBank`.

```json
{
  "type": "fillBlanks",
  "instruction": "Fill in the blanks",
  "prompt": { "kind": "text", "text": "I drink tea. Do you drink tea too?" },
  "sentence": {
    "kind": "sentence",
    "tokens": [
      { "hanzi": "我", "pinyin": "wǒ", "hint": "I" },
      { "hanzi": "", "blank": true },
      { "hanzi": "茶。", "pinyin": "chá", "hint": "tea" },
      { "hanzi": "你", "pinyin": "nǐ", "hint": "you" },
      { "hanzi": "", "blank": true },
      { "hanzi": "喝", "pinyin": "hē", "hint": "drink" },
      { "hanzi": "茶", "pinyin": "chá", "hint": "tea" },
      { "hanzi": "", "blank": true },
      { "hanzi": "？" }
    ]
  },
  "answers": ["喝", "也", "吗"],
  "distractors": ["吃", "不", "呢"],
  "pinyin": { "喝": "hē", "也": "yě", "吗": "ma", "吃": "chī", "不": "bù", "呢": "ne" }
}
```

#### `buildCharacter` — put a character together from its parts

- `character`: one character.
- `pinyin`, `meaning` (optional but recommended).
- `parts`: 2 to 4 single characters or components, **in reading order** (left to right, top to
  bottom): 妈 is `["女", "马"]`, 您 is `["你", "心"]`. Use the standard decomposition; when
  unsure about a character, leave it out rather than guess.
- `distractors` (optional): 2 or 3 wrong parts, ideally ones that look related.
- `showCharacter` (optional): `true` shows the character and asks for its parts. The default,
  `false`, shows only the sound and meaning, so the learner builds it.

```json
{
  "type": "buildCharacter",
  "instruction": "Build the character",
  "character": "妈",
  "pinyin": "mā",
  "meaning": "mum",
  "parts": ["女", "马"],
  "distractors": ["口", "子", "门"]
}
```

#### `wordSearch` — find words in a grid of characters

The learner taps the first and last character of each word.

- `grid`: the rows, each a string with **the same number of characters** (3 to 6 rows of 3 to
  6). Fill the empty cells with other characters from the lesson.
- `words`: 3 to 6 items of `{ "word", "pinyin"?, "meaning"? }`. Each word is 2 to 4 characters
  and must lie in **a straight line**: across, down or diagonally, forwards or backwards.
  With a `meaning`, the learner has to find the word from its meaning.

Draw the grid on paper first and check every word letter by letter: the app rejects a file in
which a word is not in the grid.

```json
{
  "type": "wordSearch",
  "instruction": "Find the words",
  "grid": ["他我们忙", "吗很不你", "你呢好忙"],
  "words": [
    { "word": "我们", "pinyin": "wǒmen", "meaning": "we" },
    { "word": "你呢", "pinyin": "nǐ ne", "meaning": "and you?" },
    { "word": "很好", "pinyin": "hěn hǎo", "meaning": "very good" },
    { "word": "我不忙", "pinyin": "wǒ bù máng", "meaning": "I’m not busy" }
  ]
}
```

## Exercise catalogue

These are the 24 exercise types learners know, numbered as on the app's "Exercise types"
page. Each one is one of the ten `type`s above with a particular combination of content.

**Vocabulary and characters**

| # | Name | `type` | Prompt | Options / sides |
|---|---|---|---|---|
| 1.1 | New word with pictures | `multipleChoice` | `hanzi` with `pinyin` and `speak` | 4 × `image` |
| 1.2 | Match English ↔ Chinese | `matchPairs` | — | `text` ↔ `hanzi` with `pinyin` |
| 1.3 | Match character ↔ pinyin | `matchPairs` | — | `hanzi` (no `pinyin` field) ↔ `text` holding the pinyin; add `"tapToSpeak": false` |
| 1.4 | Choose the meaning | `multipleChoice` | `hanzi` | 3–4 × `text` |
| 1.5 | Draw the character | `strokeDraw` | — | — |
| 1.6 | Build the character | `buildCharacter` | — | parts + distractors |
| 1.7 | Find the words | `wordSearch` | — | grid + words with meanings |

**Pronunciation and listening**

| # | Name | `type` | Prompt | Options / sides |
|---|---|---|---|---|
| 2.1 | Choose the right sound | `multipleChoice` | `hanzi` **without** `pinyin` or `speak` | 3–4 × `audio` |
| 2.2 | Listen and choose the character | `multipleChoice` | `audio` | 4 × `hanzi` **without** `pinyin`, `"layout": "grid"` |
| 2.3 | Match audio ↔ character | `matchPairs` | — | `audio` ↔ `hanzi` without `pinyin` |
| 2.4 | Listen and build the sentence in Chinese | `wordBank` | `audio` with `"slow": true` | Chinese tiles |
| 2.5 | Listen and translate into English | `wordBank` | `audio` with `"slow": true` | English tiles |
| 2.6 | Mark the tones | `tones` | — | — |
| 2.7 | Type the pinyin | `typePinyin` | `hanzi` without `pinyin`, or `audio` | typed answer |

**Translation**

| # | Name | `type` | Prompt | Options / sides |
|---|---|---|---|---|
| 3.1 | English → Chinese | `wordBank` | `text` | Chinese tiles + distractors, with a `pinyin` map |
| 3.2 | Chinese → English | `wordBank` | `sentence` with hints and `speak` | English tiles + distractors |
| 3.3 | Choose the right translation | `multipleChoice` | `text` (or `sentence`) | 2–3 full sentences differing in one detail |
| 3.4 | Pinyin → characters | `wordBank` | `text` holding the pinyin, e.g. `"Wǒ hē chá."` | Chinese tiles + distractors, **no** `pinyin` map |

**Sentences and dialogue**

| # | Name | `type` | Prompt | Options / sides |
|---|---|---|---|---|
| 4.1 | Fill in the blank | `multipleChoice` | `sentence` with one blank token | 3 × `hanzi` |
| 4.2 | Choose the reply | `multipleChoice` | `sentence` (a question or remark) | 2 × `sentence` replies |
| 4.3 | Complete the dialogue | `multipleChoice` | `chat` with one blank line | 2–3 × `sentence` |
| 4.4 | Fill several blanks | `fillBlanks` | optional English `text` | bank of words |
| 4.5 | Put the dialogue in order | `wordBank` with `"layout": "lines"` | `text` describing the situation | 3–5 whole lines as tiles |

**Extra**

| # | Name | `type` | Prompt | Options / sides |
|---|---|---|---|---|
| 6.1 | Story | `story` | — | — |

Notes for the listening types:

- In types 2.1–2.5 the point is to hear the answer, so never show the answer's characters or
  pinyin in the prompt, and leave `pinyin` off character options that would give it away.
- For "Choose the right sound", each audio option is a **different character** with the sound
  you want. For tones, use characters that differ only by tone, for example 妈 (mā), 麻 (má),
  马 (mǎ), 骂 (mà).

## A complete example

```json
{
  "title": "Tea or water?",
  "description": "Two drinks, and how to say what you drink.",
  "exercises": [
    {
      "type": "multipleChoice",
      "instruction": "Select the correct image",
      "prompt": { "kind": "hanzi", "hanzi": "茶", "pinyin": "chá", "speak": true },
      "options": [
        { "id": "tea", "content": { "kind": "image", "emoji": "🍵", "label": "tea" } },
        { "id": "water", "content": { "kind": "image", "emoji": "💧", "label": "water" } },
        { "id": "rice", "content": { "kind": "image", "emoji": "🍚", "label": "rice" } },
        { "id": "apple", "content": { "kind": "image", "emoji": "🍎", "label": "apple" } }
      ],
      "answer": "tea"
    },
    {
      "type": "multipleChoice",
      "instruction": "What do you hear?",
      "prompt": { "kind": "audio", "speak": "水" },
      "options": [
        { "id": "water", "content": { "kind": "hanzi", "hanzi": "水" } },
        { "id": "tea", "content": { "kind": "hanzi", "hanzi": "茶" } },
        { "id": "i", "content": { "kind": "hanzi", "hanzi": "我" } },
        { "id": "drink", "content": { "kind": "hanzi", "hanzi": "喝" } }
      ],
      "answer": "water",
      "layout": "grid"
    },
    {
      "type": "wordBank",
      "instruction": "Write this in Chinese",
      "prompt": { "kind": "text", "text": "I drink tea" },
      "answer": ["我", "喝", "茶"],
      "distractors": ["水", "你"],
      "pinyin": { "我": "wǒ", "喝": "hē", "茶": "chá", "水": "shuǐ", "你": "nǐ" }
    },
    {
      "type": "multipleChoice",
      "instruction": "Complete the sentence",
      "prompt": {
        "kind": "sentence",
        "tokens": [
          { "hanzi": "你", "pinyin": "nǐ", "hint": "you" },
          { "hanzi": "喝", "pinyin": "hē", "hint": "drink" },
          { "hanzi": "茶", "pinyin": "chá", "hint": "tea" },
          { "hanzi": "", "blank": true },
          { "hanzi": "？" }
        ]
      },
      "options": [
        { "id": "ma", "content": { "kind": "hanzi", "hanzi": "吗", "pinyin": "ma" } },
        { "id": "bu", "content": { "kind": "hanzi", "hanzi": "不", "pinyin": "bù" } },
        { "id": "shi", "content": { "kind": "hanzi", "hanzi": "是", "pinyin": "shì" } }
      ],
      "answer": "ma"
    },
    {
      "type": "strokeDraw",
      "instruction": "Trace the character",
      "character": "水",
      "pinyin": "shuǐ",
      "meaning": "water",
      "guide": "full"
    }
  ]
}
```

## Checklist

Check every point before you send the file. The app rejects files that break the first six.

1. The output is valid JSON: double quotes, no comments, no trailing commas.
2. The top level has `title` and a non-empty `exercises` list.
3. Every exercise `type` is one of `multipleChoice`, `matchPairs`, `wordBank`, `typePinyin`,
   `tones`, `fillBlanks`, `buildCharacter`, `wordSearch`, `strokeDraw`, `story`, and every content `kind` is one of `text`, `hanzi`, `audio`, `image`, `sentence`,
   `chat`.
4. In every `multipleChoice` and every story question, `answer` equals the `id` of exactly
   one option, and ids are unique.
5. In every `wordBank`, each tile used in `acceptedAnswers` is available in `answer` +
   `distractors` (a tile needed twice must be listed twice).
6. Every `strokeDraw` and `buildCharacter` has a single character; every `tones` has one
   pinyin syllable per character, separated by spaces; every `fillBlanks` has one answer per
   blank; every `wordSearch` word lies in a straight line in a grid whose rows are all the
   same length; no `typePinyin` prompt shows pinyin.
7. Exactly one option is correct, and no distractor is also a valid answer (in
   `fillBlanks`, no distractor may also fit its gap).
8. Pinyin has tone marks and matches the characters; characters are simplified.
   `buildCharacter` parts are the character's real components, in reading order.
9. Listening exercises do not reveal the answer in text, and "Pinyin → characters"
   exercises have no `pinyin` map.
10. The number of exercises and the types match what I asked for.

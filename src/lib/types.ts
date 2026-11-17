// ---------------------------------------------------------------------------
// Content: the single building block used in prompts, options, match columns
// and chat lines. Any exercise can show any kind of content.
// ---------------------------------------------------------------------------

/** Plain text in the base language (English). */
export interface TextContent {
  kind: 'text';
  text: string;
}

/** A Chinese word or character, optionally with pinyin and an audio button. */
export interface HanziContent {
  kind: 'hanzi';
  hanzi: string;
  pinyin?: string;
  /** Show an audio button (prompt) or speak it when selected (option). */
  speak?: boolean;
}

/** Audio only: a sound button with no text. `speak` is the Chinese text to read. */
export interface AudioContent {
  kind: 'audio';
  speak: string;
  /** Also show the slow (turtle) button. */
  slow?: boolean;
}

/** A picture card: an emoji or an image URL. `label` is used as alt text. */
export interface ImageContent {
  kind: 'image';
  emoji?: string;
  src?: string;
  label: string;
  /** Show the label under the picture. Default: false. */
  showLabel?: boolean;
}

export interface Token {
  hanzi: string;
  pinyin?: string;
  /** Meaning shown when the learner taps the word. */
  hint?: string;
  /** Renders a gap to fill instead of the word. */
  blank?: boolean;
}

/** A Chinese sentence split into words, with optional per-word hints. */
export interface SentenceContent {
  kind: 'sentence';
  tokens: Token[];
  speak?: boolean;
}

export interface ChatLine {
  speaker?: string;
  /** Emoji avatar. */
  avatar?: string;
  side?: 'left' | 'right';
  content?: TextContent | HanziContent | SentenceContent;
  /** The missing line the learner has to pick. */
  blank?: boolean;
}

/** A short chat between characters. */
export interface ChatContent {
  kind: 'chat';
  lines: ChatLine[];
}

export type Content =
  | TextContent
  | HanziContent
  | AudioContent
  | ImageContent
  | SentenceContent
  | ChatContent;

// ---------------------------------------------------------------------------
// Exercise configs
// ---------------------------------------------------------------------------

interface BaseConfig {
  /** Heading shown above the exercise, e.g. "Select the correct meaning". */
  instruction?: string;
  /** Set to false to keep options/tiles in the order they were written. */
  shuffle?: boolean;
  /**
   * Read Chinese aloud when the learner taps it. Default: on, except in
   * exercises with audio-only content, where hearing it would give the answer away.
   */
  tapToSpeak?: boolean;
}

export interface ChoiceOption {
  id: string;
  content: Content;
}

/** One prompt, N options, one correct. Covers 1.1, 1.4, 2.1, 2.2, 3.3, 4.1, 4.2, 4.3. */
export interface MultipleChoiceConfig extends BaseConfig {
  type: 'multipleChoice';
  prompt?: Content;
  options: ChoiceOption[];
  /** `id` of the correct option. */
  answer: string;
  /** Default: grid when every option is an image, list otherwise. */
  layout?: 'list' | 'grid';
}

export interface MatchPair {
  id: string;
  left: Content;
  right: Content;
}

/** Two shuffled columns to pair up. Covers 1.2, 1.3, 2.3. */
export interface MatchPairsConfig extends BaseConfig {
  type: 'matchPairs';
  pairs: MatchPair[];
}

/** Build a sentence from word tiles. Covers 2.4, 2.5, 3.1, 3.2. */
export interface WordBankConfig extends BaseConfig {
  type: 'wordBank';
  prompt: Content;
  /** The tiles of the correct answer, in order. */
  answer: string[];
  /** Extra wrong tiles added to the bank. */
  distractors?: string[];
  /** Other tile orders/combinations that are also correct. */
  acceptedAnswers?: string[][];
  /**
   * Pinyin for Chinese tiles, keyed by tile text. Leave it out when the prompt
   * is pinyin: the app hides it there anyway, since it would show the answer.
   */
  pinyin?: Record<string, string>;
  /**
   * inline: tiles flow like words in a sentence (default).
   * lines: one tile per line, for putting whole sentences (a dialogue) in order.
   */
  layout?: 'inline' | 'lines';
}

/** Type the pinyin of a word or sentence. Covers 2.7. */
export interface TypePinyinConfig extends BaseConfig {
  type: 'typePinyin';
  /** What to transcribe: Chinese without pinyin (hanzi or sentence), or audio. */
  prompt: Content;
  /** The pinyin, with tone marks: "nǐ hǎo". Spaces and capitals don't matter. */
  answer: string;
  /** Other spellings that are also correct. */
  acceptedAnswers?: string[];
  /** Set to false to accept answers without tones. Default: true. */
  requireTones?: boolean;
}

/** Pick the tone of each syllable of a word. Covers 2.6. */
export interface TonesConfig extends BaseConfig {
  type: 'tones';
  /** The word in characters: "你好". */
  word: string;
  /** Its pinyin with tone marks, one syllable per character, separated by spaces: "nǐ hǎo". */
  pinyin: string;
  meaning?: string;
  /** Play the word (and show a speaker button). Default: true. */
  speak?: boolean;
}

/** A sentence or short text with several gaps, filled from one word bank. Covers 4.4. */
export interface FillBlanksConfig extends BaseConfig {
  type: 'fillBlanks';
  /** Optional context shown above, such as the English meaning. */
  prompt?: Content;
  /** The text, with one `"blank": true` token per gap. */
  sentence: SentenceContent;
  /** The word for each gap, in order. */
  answers: string[];
  /** Extra wrong words added to the bank. */
  distractors?: string[];
  /** Pinyin for Chinese bank words, keyed by word. */
  pinyin?: Record<string, string>;
}

/** Build a character from its parts. Covers 1.6. */
export interface BuildCharacterConfig extends BaseConfig {
  type: 'buildCharacter';
  /** One character: "妈". */
  character: string;
  pinyin?: string;
  meaning?: string;
  /** Its parts in reading order (left to right, top to bottom): ["女", "马"]. */
  parts: string[];
  /** Extra wrong parts added to the pieces. */
  distractors?: string[];
  /**
   * false (default): show the sound and meaning, the learner builds the character.
   * true: show the character, the learner picks the parts it is made of.
   */
  showCharacter?: boolean;
}

export interface SearchWord {
  /** The word as it appears in the grid: "我们". */
  word: string;
  pinyin?: string;
  /** Clue shown in the list. When given, the learner finds the word from its meaning. */
  meaning?: string;
}

/** Find words hidden in a grid of characters. Covers 1.7. */
export interface WordSearchConfig extends BaseConfig {
  type: 'wordSearch';
  /** Rows of the grid, all the same length: ["他我们忙都", "吗很不你好"]. */
  grid: string[];
  /** Words to find, each in a straight line (across, down or diagonal, either way). */
  words: SearchWord[];
}

/** Trace a character stroke by stroke. Covers 1.5. */
export interface StrokeDrawConfig extends BaseConfig {
  type: 'strokeDraw';
  /** A single Chinese character. */
  character: string;
  pinyin?: string;
  meaning?: string;
  /**
   * full: outline + hint after 1 miss · faint: light outline, hint after 3 misses ·
   * none: no outline, no hints. Default: full.
   */
  guide?: 'full' | 'faint' | 'none';
}

export interface StoryLine {
  kind: 'line';
  speaker?: string;
  avatar?: string;
  content: TextContent | HanziContent | SentenceContent;
  /** English translation shown under the line. */
  translation?: string;
}

export interface StoryQuestion {
  kind: 'question';
  prompt: string;
  options: { id: string; text: string }[];
  answer: string;
}

export type StoryStep = StoryLine | StoryQuestion;

/** A longer text revealed line by line with comprehension questions. Covers 6.1. */
export interface StoryConfig extends BaseConfig {
  type: 'story';
  title: string;
  steps: StoryStep[];
}

export type ExerciseConfig =
  | MultipleChoiceConfig
  | MatchPairsConfig
  | WordBankConfig
  | StrokeDrawConfig
  | StoryConfig
  | TypePinyinConfig
  | TonesConfig
  | FillBlanksConfig
  | BuildCharacterConfig
  | WordSearchConfig;

export type ExerciseType = ExerciseConfig['type'];

// ---------------------------------------------------------------------------
// Component contract
// ---------------------------------------------------------------------------

export interface ExerciseResult {
  correct: boolean;
  /** Wrong attempts, for exercises that let the learner retry (match, draw, story). */
  mistakes?: number;
}

export interface ExerciseProps<C extends ExerciseConfig = ExerciseConfig> {
  config: C;
  /** Called once, when the exercise is graded. */
  onResult?: (result: ExerciseResult) => void;
  /** Called when the learner presses Continue after seeing the feedback. */
  onContinue?: () => void;
}

export type ExerciseStatus = 'idle' | 'correct' | 'incorrect';

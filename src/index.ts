// Public API: everything you need to build your own exercises and lessons.

export * from './lib/types';
export { zh, plainText, speakableText } from './lib/content';
export { applyTone, numberedToMarks, normalizePinyin } from './lib/pinyin';
export { SettingsProvider, useSettings, defaultSettings, type Settings } from './lib/settings';
export { speak, useVoiceStatus } from './lib/speech';

export { Exercise } from './components/shell/Exercise';
export { Lesson, type LessonResult } from './components/shell/Lesson';
export { ExerciseFrame } from './components/shell/ExerciseFrame';

export { MultipleChoice } from './components/exercises/MultipleChoice';
export { MatchPairs } from './components/exercises/MatchPairs';
export { WordBank } from './components/exercises/WordBank';
export { StrokeDraw } from './components/exercises/StrokeDraw';
export { Story } from './components/exercises/Story';
export { TypePinyin } from './components/exercises/TypePinyin';
export { Tones } from './components/exercises/Tones';
export { FillBlanks } from './components/exercises/FillBlanks';
export { BuildCharacter } from './components/exercises/BuildCharacter';
export { WordSearch } from './components/exercises/WordSearch';

export { ContentView } from './components/primitives/ContentView';
export { AudioButton } from './components/primitives/AudioButton';
export { HanziText } from './components/primitives/HanziText';
export { OptionCard } from './components/primitives/OptionCard';

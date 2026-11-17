import type { ExerciseConfig } from '../lib/types';
import { dialogue } from './dialogue';
import { extras } from './extras';
import { listening } from './listening';
import { translation } from './translation';
import type { Example, ExampleSection } from './types';
import { vocabulary } from './vocabulary';

export type { Example, ExampleSection };

export const sections: ExampleSection[] = [
  { title: '1. Vocabulary and characters', examples: vocabulary },
  { title: '2. Pronunciation and listening', examples: listening },
  { title: '3. Translation', examples: translation },
  { title: '4. Sentences and dialogue', examples: dialogue },
  { title: '6. Extra modes', examples: extras },
];

export const allExamples: Example[] = sections.flatMap((s) => s.examples);

const pick = (code: string): ExerciseConfig => allExamples.find((e) => e.code === code)!.config;

/** A short lesson mixing the exercise types, as a learner would see them. */
export const demoLesson: ExerciseConfig[] = [
  '1.1',
  '1.4',
  '1.2',
  '2.2',
  '1.5',
  '3.1',
  '4.1',
  '2.4',
  '3.2',
  '4.3',
].map(pick);

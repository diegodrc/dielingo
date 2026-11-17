import type { ExerciseConfig } from '../lib/types';

export interface Example {
  /** Number in the exercise catalogue, e.g. "1.1". */
  code: string;
  title: string;
  goal: string;
  config: ExerciseConfig;
}

export interface ExampleSection {
  title: string;
  examples: Example[];
}

import type { ExerciseProps } from '../../lib/types';
import { MatchPairs } from '../exercises/MatchPairs';
import { MultipleChoice } from '../exercises/MultipleChoice';
import { StrokeDraw } from '../exercises/StrokeDraw';
import { Story } from '../exercises/Story';
import { WordBank } from '../exercises/WordBank';

/**
 * Renders any exercise from its config object. Give it a `key` that changes
 * when the config changes, so the exercise starts fresh.
 */
export function Exercise({ config, ...handlers }: ExerciseProps) {
  switch (config.type) {
    case 'multipleChoice':
      return <MultipleChoice config={config} {...handlers} />;
    case 'matchPairs':
      return <MatchPairs config={config} {...handlers} />;
    case 'wordBank':
      return <WordBank config={config} {...handlers} />;
    case 'strokeDraw':
      return <StrokeDraw config={config} {...handlers} />;
    case 'story':
      return <Story config={config} {...handlers} />;
  }
}

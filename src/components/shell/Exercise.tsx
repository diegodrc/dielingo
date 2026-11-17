import type { ExerciseProps } from '../../lib/types';
import { BuildCharacter } from '../exercises/BuildCharacter';
import { FillBlanks } from '../exercises/FillBlanks';
import { MatchPairs } from '../exercises/MatchPairs';
import { MultipleChoice } from '../exercises/MultipleChoice';
import { StrokeDraw } from '../exercises/StrokeDraw';
import { Story } from '../exercises/Story';
import { Tones } from '../exercises/Tones';
import { TypePinyin } from '../exercises/TypePinyin';
import { WordBank } from '../exercises/WordBank';
import { WordSearch } from '../exercises/WordSearch';

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
    case 'typePinyin':
      return <TypePinyin config={config} {...handlers} />;
    case 'tones':
      return <Tones config={config} {...handlers} />;
    case 'fillBlanks':
      return <FillBlanks config={config} {...handlers} />;
    case 'buildCharacter':
      return <BuildCharacter config={config} {...handlers} />;
    case 'wordSearch':
      return <WordSearch config={config} {...handlers} />;
  }
}

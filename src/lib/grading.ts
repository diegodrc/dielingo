import { isChinese } from './content';
import type { MultipleChoiceConfig, WordBankConfig } from './types';

export function gradeChoice(config: MultipleChoiceConfig, selectedId: string | null): boolean {
  return selectedId !== null && selectedId === config.answer;
}

function sameTiles(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((tile, i) => tile === b[i]);
}

/** Exact match against `answer` or any of `acceptedAnswers`. */
export function gradeWordBank(config: WordBankConfig, selected: readonly string[]): boolean {
  return [config.answer, ...(config.acceptedAnswers ?? [])].some((candidate) =>
    sameTiles(candidate, selected),
  );
}

/** Joins tiles into a readable sentence: no spaces for Chinese, spaces otherwise. */
export function joinTiles(tiles: readonly string[]): string {
  return tiles.join(tiles.some(isChinese) ? '' : ' ');
}

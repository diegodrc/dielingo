import { isChinese } from './content';
import { normalizePinyin } from './pinyin';
import type { MultipleChoiceConfig, TypePinyinConfig, WordBankConfig } from './types';

/** Typed pinyin: tone numbers or marks, spaces, capitals and punctuation don't matter. */
export function gradePinyin(config: TypePinyinConfig, typed: string): boolean {
  const keepTones = config.requireTones !== false;
  const given = normalizePinyin(typed, keepTones);
  return (
    given.length > 0 &&
    [config.answer, ...(config.acceptedAnswers ?? [])].some((a) => normalizePinyin(a, keepTones) === given)
  );
}

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

import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { lineBetween, toCells, type Cell } from '../../lib/grid';
import { useSettings } from '../../lib/settings';
import { speak } from '../../lib/speech';
import type { ExerciseProps, ExerciseStatus, WordSearchConfig } from '../../lib/types';
import { ExerciseFrame } from '../shell/ExerciseFrame';
import styles from './exercises.module.css';

const key = ([r, c]: Cell) => `${r},${c}`;

/**
 * Words hidden in a grid of characters. Tap the first and the last character
 * of a word; it can run across, down or diagonally, in either direction.
 */
export function WordSearch({ config, onResult, onContinue }: ExerciseProps<WordSearchConfig>) {
  const { settings } = useSettings();
  const grid = toCells(config.grid);
  const [start, setStartState] = useState<Cell | null>(null);
  const [found, setFoundState] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const mistakes = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The selection is also kept in refs, so quick taps never see a stale value.
  const startRef = useRef<Cell | null>(null);
  const foundRef = useRef<string[]>([]);
  const setStart = (cell: Cell | null) => {
    startRef.current = cell;
    setStartState(cell);
  };

  const tap = (cell: Cell) => {
    if (status !== 'idle' || foundRef.current.length === config.words.length) return;
    const from = startRef.current;
    if (!from) return setStart(cell);
    if (key(from) === key(cell)) return setStart(null);

    const line = lineBetween(from, cell);
    if (!line) return setStart(cell); // Not in a straight line: start again from here.
    setStart(null);

    const text = line.map(([r, c]) => grid[r][c]).join('');
    const reversed = [...text].reverse().join('');
    const match = config.words.find(
      (w) => !foundRef.current.includes(w.word) && (w.word === text || w.word === reversed),
    );

    if (match) {
      const nowFound = [...foundRef.current, match.word];
      foundRef.current = nowFound;
      setFoundState(nowFound);
      setFoundCells((cells) => new Set([...cells, ...line.map(key)]));
      speak(match.word, { rate: settings.speechRate });
      if (nowFound.length === config.words.length) {
        setStatus('correct');
        onResult?.({ correct: true, mistakes: mistakes.current });
      }
    } else {
      mistakes.current += 1;
      setWrong(new Set(line.map(key)));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setWrong(new Set()), 600);
    }
  };

  // A preview of the line from the first tap, so learners see what they are selecting.
  const startKey = start ? key(start) : null;

  return (
    <ExerciseFrame
      instruction={config.instruction}
      status={status}
      hideCheck
      onContinue={onContinue}
      successMessage="All words found!"
    >
      <p className={styles.muted}>
        Tap the first and the last character of each word. Words run across, down or diagonally.
      </p>

      <div
        className={styles.searchGrid}
        style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 1}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Word search"
      >
        {grid.map((row, r) =>
          row.map((char, c) => {
            const k = key([r, c]);
            return (
              <button
                key={k}
                type="button"
                lang="zh-CN"
                className={cx(
                  styles.searchCell,
                  foundCells.has(k) && styles.searchFound,
                  startKey === k && styles.searchStart,
                  wrong.has(k) && styles.searchWrong,
                )}
                aria-pressed={startKey === k}
                aria-label={`${char}, row ${r + 1}, column ${c + 1}`}
                onClick={() => tap([r, c])}
              >
                {char}
              </button>
            );
          }),
        )}
      </div>

      <ul className={styles.searchList} aria-label="Words to find">
        {config.words.map((w) => {
          const done = found.includes(w.word);
          return (
            <li key={w.word} className={cx(styles.searchItem, done && styles.searchItemDone)}>
              <span aria-hidden="true">{done ? '✓' : '○'}</span>
              {done || !w.meaning ? (
                <span lang="zh-CN" className={styles.searchWord}>
                  {w.word}
                </span>
              ) : null}
              {w.pinyin && (done || !w.meaning) && <span className={styles.muted}>{w.pinyin}</span>}
              {w.meaning && <span>{w.meaning}</span>}
            </li>
          );
        })}
      </ul>
      <p className={styles.muted} aria-live="polite">
        {found.length} of {config.words.length} found
      </p>
    </ExerciseFrame>
  );
}

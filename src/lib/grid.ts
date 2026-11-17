// Helpers for the word search grid.

export type Cell = [row: number, col: number];

const DIRECTIONS: Cell[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [-1, 1],
];

/** Splits each row into characters (by code point, so CJK is safe). */
export function toCells(rows: string[]): string[][] {
  return rows.map((row) => [...row]);
}

/** Cells on the straight line from `a` to `b` (inclusive), or null if they are not in a line. */
export function lineBetween(a: Cell, b: Cell): Cell[] | null {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const cells: Cell[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([a[0] + Math.sign(dr) * i, a[1] + Math.sign(dc) * i]);
  }
  return cells;
}

/** Where `word` lies in the grid in a straight line (any of the 8 directions), or null. */
export function findWord(grid: string[][], word: string): Cell[] | null {
  const chars = [...word];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      for (const [dr, dc] of DIRECTIONS) {
        const cells: Cell[] = chars.map((_, i) => [r + dr * i, c + dc * i]);
        if (cells.every(([cr, cc], i) => grid[cr]?.[cc] === chars[i])) return cells;
      }
    }
  }
  return null;
}

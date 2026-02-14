import type { Digit, Difficulty, Puzzle } from "./types";
import { countSolutions } from "./solver";
import { getTargetGivens, DIFFICULTY_PARAMS } from "./difficulty";

const FULL_MASK = 0x1ff;
const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function bit(digit: Digit): number {
  return 1 << (digit - 1);
}

function bitCount(mask: number): number {
  let count = 0;
  let m = mask;
  while (m) {
    m &= m - 1;
    count++;
  }
  return count;
}

function rowOf(index: number): number {
  return Math.floor(index / 9);
}

function colOf(index: number): number {
  return index % 9;
}

function boxOf(index: number): number {
  const r = rowOf(index);
  const c = colOf(index);
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function maskToDigitsShuffled(mask: number): Digit[] {
  const digits: Digit[] = [];
  for (const d of DIGITS) {
    if (mask & bit(d)) digits.push(d);
  }
  return shuffle(digits);
}

function initMasks(values: (Digit | null)[]) {
  const rowMask = Array(9).fill(0);
  const colMask = Array(9).fill(0);
  const boxMask = Array(9).fill(0);

  for (let i = 0; i < 81; i++) {
    const v = values[i];
    if (!v) continue;
    const r = rowOf(i);
    const c = colOf(i);
    const b = boxOf(i);
    const m = bit(v);
    rowMask[r] |= m;
    colMask[c] |= m;
    boxMask[b] |= m;
  }

  return { rowMask, colMask, boxMask };
}

export function generateCompleteSolution(): Digit[] {
  const working: (Digit | null)[] = Array(81).fill(null);
  const masks = initMasks(working);
  const empties = Array.from({ length: 81 }, (_, i) => i);
  let emptyCount = empties.length;

  const search = (): boolean => {
    if (emptyCount === 0) return true;

    let bestPos = -1;
    let bestMask = 0;
    let bestCount = 10;

    for (let pos = 0; pos < emptyCount; pos++) {
      const idx = empties[pos];
      const r = rowOf(idx);
      const c = colOf(idx);
      const b = boxOf(idx);
      const mask = FULL_MASK & ~(masks.rowMask[r] | masks.colMask[c] | masks.boxMask[b]);
      const count = bitCount(mask);
      if (count < bestCount) {
        bestCount = count;
        bestMask = mask;
        bestPos = pos;
        if (count === 1) break;
      }
    }

    if (bestCount === 0) return false;

    const idx = empties[bestPos];
    const lastPos = emptyCount - 1;
    [empties[bestPos], empties[lastPos]] = [empties[lastPos], empties[bestPos]];
    emptyCount--;

    const r = rowOf(idx);
    const c = colOf(idx);
    const b = boxOf(idx);

    for (const d of maskToDigitsShuffled(bestMask)) {
      const m = bit(d);
      working[idx] = d;
      masks.rowMask[r] |= m;
      masks.colMask[c] |= m;
      masks.boxMask[b] |= m;

      if (search()) return true;

      masks.rowMask[r] &= ~m;
      masks.colMask[c] &= ~m;
      masks.boxMask[b] &= ~m;
      working[idx] = null;
    }

    emptyCount++;
    [empties[bestPos], empties[lastPos]] = [empties[lastPos], empties[bestPos]];
    return false;
  };

  search();
  return working as Digit[];
}

function randomId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `puzzle-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const solution = generateCompleteSolution();
  const target = getTargetGivens(difficulty);
  const givens: (Digit | null)[] = solution.slice();

  let givensCount = 81;
  let passes = 0;

  while (givensCount > target && passes < 30) {
    const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));
    for (const idx of indices) {
      if (givensCount <= target) break;
      if (givens[idx] === null) continue;
      const backup = givens[idx];
      givens[idx] = null;
      if (countSolutions(givens, 2) !== 1) {
        givens[idx] = backup;
      } else {
        givensCount--;
      }
    }
    passes++;
  }

  const { minGivens, maxGivens } = DIFFICULTY_PARAMS[difficulty];
  if (givensCount < minGivens || givensCount > maxGivens) {
    return generatePuzzle(difficulty);
  }

  return {
    id: randomId(),
    givens,
    solution,
    difficulty,
  };
}

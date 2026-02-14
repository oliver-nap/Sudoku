import type { Digit } from "./types";

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

function maskToDigits(mask: number): Digit[] {
  const result: Digit[] = [];
  for (const d of DIGITS) {
    if (mask & bit(d)) result.push(d);
  }
  return result;
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

interface MaskState {
  rowMask: number[];
  colMask: number[];
  boxMask: number[];
}

function initMasks(values: (Digit | null)[]): MaskState | null {
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
    if ((rowMask[r] & m) || (colMask[c] & m) || (boxMask[b] & m)) {
      return null;
    }
    rowMask[r] |= m;
    colMask[c] |= m;
    boxMask[b] |= m;
  }

  return { rowMask, colMask, boxMask };
}

export function solveGrid(values: ReadonlyArray<Digit | null>): Digit[] | null {
  if (values.length !== 81) return null;
  const working = values.slice();
  const masks = initMasks(working);
  if (!masks) return null;

  const empties: number[] = [];
  for (let i = 0; i < 81; i++) {
    if (working[i] === null) empties.push(i);
  }

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

    for (const d of maskToDigits(bestMask)) {
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

  if (!search()) return null;
  return working as Digit[];
}

export function countSolutions(values: ReadonlyArray<Digit | null>, limit = 2): number {
  if (values.length !== 81) return 0;
  const working = values.slice();
  const masks = initMasks(working);
  if (!masks) return 0;

  const empties: number[] = [];
  for (let i = 0; i < 81; i++) {
    if (working[i] === null) empties.push(i);
  }

  let emptyCount = empties.length;
  let solutions = 0;

  const search = (): void => {
    if (solutions >= limit) return;
    if (emptyCount === 0) {
      solutions++;
      return;
    }

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

    if (bestCount === 0) return;

    const idx = empties[bestPos];
    const lastPos = emptyCount - 1;
    [empties[bestPos], empties[lastPos]] = [empties[lastPos], empties[bestPos]];
    emptyCount--;

    const r = rowOf(idx);
    const c = colOf(idx);
    const b = boxOf(idx);

    for (const d of maskToDigits(bestMask)) {
      const m = bit(d);
      working[idx] = d;
      masks.rowMask[r] |= m;
      masks.colMask[c] |= m;
      masks.boxMask[b] |= m;

      search();
      if (solutions >= limit) break;

      masks.rowMask[r] &= ~m;
      masks.colMask[c] &= ~m;
      masks.boxMask[b] &= ~m;
      working[idx] = null;
    }

    emptyCount++;
    [empties[bestPos], empties[lastPos]] = [empties[lastPos], empties[bestPos]];
  };

  search();
  return solutions;
}

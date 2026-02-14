import type { CellIndex, Digit, Puzzle } from "./types";

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

export function getConflicts(
  values: ReadonlyArray<Digit | null>,
  index: CellIndex,
  value: Digit | null,
): Set<CellIndex> {
  const conflicts = new Set<CellIndex>();
  if (!value) return conflicts;

  const r = rowOf(index);
  const c = colOf(index);
  const b = boxOf(index);

  const rowStart = r * 9;
  for (let i = 0; i < 9; i++) {
    const idx = rowStart + i;
    if (idx !== index && values[idx] === value) conflicts.add(idx);
  }

  for (let i = 0; i < 9; i++) {
    const idx = c + i * 9;
    if (idx !== index && values[idx] === value) conflicts.add(idx);
  }

  const boxRow = Math.floor(b / 3) * 3;
  const boxCol = (b % 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const idx = (boxRow + dr) * 9 + (boxCol + dc);
      if (idx !== index && values[idx] === value) conflicts.add(idx);
    }
  }

  return conflicts;
}

export function isWrongEntry(
  puzzle: Puzzle,
  values: ReadonlyArray<Digit | null>,
  index: CellIndex,
): boolean {
  const value = values[index];
  if (!value) return false;
  return value !== puzzle.solution[index];
}

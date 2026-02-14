import type {
  CellIndex,
  Digit,
  GameGrid,
  NotesMask,
  SaveGame,
} from "../game/types";
import type { Difficulty } from "../game/types";
import { generatePuzzle } from "../game/generator";
import { isWrongEntry } from "../game/validator";

function nowIso(): string {
  return new Date().toISOString();
}

function bit(digit: Digit): number {
  return 1 << (digit - 1);
}

export function hasNote(mask: NotesMask, digit: Digit): boolean {
  return (mask & bit(digit)) !== 0;
}

export function toggleNoteMask(mask: NotesMask, digit: Digit): NotesMask {
  return mask ^ bit(digit);
}

export function maskToDigits(mask: NotesMask): Digit[] {
  const out: Digit[] = [];
  for (let d = 1 as Digit; d <= 9; d++) {
    if (hasNote(mask, d)) out.push(d);
  }
  return out;
}

export function createNewGame(difficulty: Difficulty): SaveGame {
  const puzzle = generatePuzzle(difficulty);
  const values = puzzle.givens.slice();
  const notes = Array(81).fill(0) as NotesMask[];

  const grid: GameGrid = { values, notes };
  const timestamp = nowIso();

  return {
    puzzle,
    grid,
    mistakes: 0,
    startedAt: timestamp,
    updatedAt: timestamp,
    elapsedSeconds: 0,
    undoHistory: [],
  };
}

export function recomputeMistakes(state: SaveGame): number {
  const values = state.grid.values;
  let mistakes = 0;
  for (let i = 0; i < 81; i++) {
    if (values[i] !== null && isWrongEntry(state.puzzle, values, i)) {
      mistakes++;
    }
  }
  return mistakes;
}

function isGiven(state: SaveGame, index: CellIndex): boolean {
  return state.puzzle.givens[index] !== null;
}

function withUpdatedGrid(
  state: SaveGame,
  values: ReadonlyArray<Digit | null>,
  notes: ReadonlyArray<NotesMask>,
  newUndoEntry?: SaveGame["undoHistory"][number],
): SaveGame {
  const undoHistory = newUndoEntry
    ? [...state.undoHistory, newUndoEntry]
    : state.undoHistory.slice();
  const next: SaveGame = {
    ...state,
    grid: { values: values.slice(), notes: notes.slice() },
    undoHistory,
    updatedAt: nowIso(),
  };
  return next;
}

export function applySetValue(
  state: SaveGame,
  index: CellIndex,
  value: Digit | null,
): SaveGame {
  if (isGiven(state, index)) return state;
  if (value === null) return clearCell(state, index);
  const prevValue = state.grid.values[index];
  const prevNotes = state.grid.notes[index];
  if (prevValue === value && (value === null || prevNotes === 0)) return state;

  const values = state.grid.values.slice();
  const notes = state.grid.notes.slice();
  const wasWrong =
    prevValue !== null && isWrongEntry(state.puzzle, state.grid.values, index);
  const nextValues = values.slice();
  nextValues[index] = value;
  values[index] = value;
  if (value !== null) {
    notes[index] = 0;
  }
  const isWrong =
    value !== null && isWrongEntry(state.puzzle, nextValues, index);
  const nextMistakes = !wasWrong && isWrong ? state.mistakes + 1 : state.mistakes;

  const entry = {
    index,
    prevValue,
    nextValue: value,
    prevNotes,
    nextNotes: notes[index],
    timestamp: Date.now(),
  };
  return { ...withUpdatedGrid(state, nextValues, notes, entry), mistakes: nextMistakes };
}

export function toggleNote(
  state: SaveGame,
  index: CellIndex,
  digit: Digit,
): SaveGame {
  if (isGiven(state, index)) return state;
  if (state.grid.values[index] !== null) return state;

  const values = state.grid.values.slice();
  const notes = state.grid.notes.slice();
  const prevNotes = notes[index];
  const nextNotes = toggleNoteMask(prevNotes, digit);
  if (prevNotes === nextNotes) return state;
  notes[index] = nextNotes;

  const entry = {
    index,
    prevValue: values[index],
    nextValue: values[index],
    prevNotes,
    nextNotes,
    timestamp: Date.now(),
  };
  return withUpdatedGrid(state, values, notes, entry);
}

export function clearCell(state: SaveGame, index: CellIndex): SaveGame {
  if (isGiven(state, index)) return state;
  const prevValue = state.grid.values[index];
  const values = state.grid.values.slice();
  const notes = state.grid.notes.slice();
  const prevNotes = notes[index];

  values[index] = null;
  notes[index] = 0;

  const entry = {
    index,
    prevValue,
    nextValue: null,
    prevNotes,
    nextNotes: notes[index],
    timestamp: Date.now(),
  };
  return { ...withUpdatedGrid(state, values, notes, entry), mistakes: state.mistakes };
}

export function undo(state: SaveGame): SaveGame {
  if (state.undoHistory.length === 0) return state;
  const last = state.undoHistory[state.undoHistory.length - 1];
  const values = state.grid.values.slice();
  const notes = state.grid.notes.slice();

  values[last.index] = last.prevValue;
  notes[last.index] = last.prevNotes;

  const next: SaveGame = {
    ...state,
    grid: { values, notes },
    undoHistory: state.undoHistory.slice(0, -1),
    updatedAt: nowIso(),
  };
  return next;
}

export function setElapsedSeconds(state: SaveGame, seconds: number): SaveGame {
  return {
    ...state,
    elapsedSeconds: seconds,
    updatedAt: nowIso(),
  };
}

export type Digit = 1|2|3|4|5|6|7|8|9;
export type CellIndex = number; // 0..80
export type Difficulty = "easy" | "medium" | "hard" | "expert";

// 9 Bits: bit0=1 ... bit8=9
export type NotesMask = number; // 0..511

export interface Puzzle {
  id: string; // seed oder uuid
  givens: ReadonlyArray<Digit | null>; // 81
  solution: ReadonlyArray<Digit>;      // 81
  difficulty: Difficulty;
}

export interface GameGrid {
  values: ReadonlyArray<Digit | null>;   // 81
  notes: ReadonlyArray<NotesMask>;       // 81
}

export interface UndoEntry {
  index: CellIndex;
  prevValue: Digit | null;
  nextValue: Digit | null;
  prevNotes: NotesMask;
  nextNotes: NotesMask;
  timestamp: number;
}

export interface SaveGame {
  puzzle: Puzzle;
  grid: GameGrid;
  mistakes: number;
  startedAt: string;
  updatedAt: string;
  elapsedSeconds: number;
  undoHistory: ReadonlyArray<UndoEntry>;
}

export interface Profile {
  level: number;
  xp: number;
  totals: {
    played: number;
    completed: number;
    mistakes: number;
    timeSeconds: number;
  };
}

export type ThemeMode = "light" | "dark" | "auto";
export interface Settings {
  theme: ThemeMode;
  showMistakes: boolean;
  highlightConflicts: boolean;
  highlightSameDigit: boolean;
  highlightDigitLines: boolean;
  highlightDigitBlocks: boolean;
  sound: boolean;
  language: "de";
  hasSeenTutorial?: boolean;
}

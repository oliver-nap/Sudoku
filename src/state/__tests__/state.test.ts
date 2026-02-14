import { describe, expect, it } from "vitest";
import type { Digit, SaveGame } from "../../game/types";
import {
  applySetValue,
  clearCell,
  recomputeMistakes,
  toggleNote,
  undo,
  hasNote,
} from "../gameState";
import {
  addCompletedGame,
  computeXpEarned,
  initialProfile,
  xpToNext,
} from "../profileState";
import {
  clearSaveGame,
  loadProfile,
  loadSaveGame,
  saveProfile,
  saveSaveGame,
} from "../persistence";
import type { StorageProvider } from "../storage";

const puzzleStr =
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const solutionStr =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

function parseGrid(input: string): (Digit | null)[] {
  return Array.from(input).map((ch) => (ch === "0" ? null : (Number(ch) as Digit)));
}

function makeSaveGame(): SaveGame {
  const givens = parseGrid(puzzleStr);
  const solution = parseGrid(solutionStr) as Digit[];
  return {
    puzzle: {
      id: "test",
      difficulty: "easy",
      givens,
      solution,
    },
    grid: {
      values: givens.slice(),
      notes: Array(81).fill(0),
    },
    mistakes: 0,
    startedAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-13T00:00:00.000Z",
    elapsedSeconds: 0,
    undoHistory: [],
  };
}

class MemoryStorage implements StorageProvider {
  private store = new Map<string, string>();
  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  set(key: string, value: string): void {
    this.store.set(key, value);
  }
  remove(key: string): void {
    this.store.delete(key);
  }
}

describe("profile state", () => {
  it("computes XP with penalties and minimum", () => {
    expect(computeXpEarned("easy", 0)).toBe(100);
    expect(computeXpEarned("easy", 25)).toBe(20);
  });

  it("levels up based on xpToNext", () => {
    const profile = initialProfile();
    const gained = addCompletedGame({
      difficulty: "expert",
      mistakes: 0,
      elapsedSeconds: 100,
      profile,
    });
    expect(gained.level).toBe(2);
    expect(gained.xp).toBe(70);
    const next = addCompletedGame({
      difficulty: "expert",
      mistakes: 0,
      elapsedSeconds: 100,
      profile: gained,
    });
    expect(next.level).toBe(3);
    expect(next.xp).toBe(65);
  });
});

describe("game state", () => {
  it("toggles notes and records undo", () => {
    const state = makeSaveGame();
    const next = toggleNote(state, 2, 9);
    expect(hasNote(next.grid.notes[2], 9)).toBe(true);
    const undone = undo(next);
    expect(hasNote(undone.grid.notes[2], 9)).toBe(false);
  });

  it("applySetValue clears notes", () => {
    const state = makeSaveGame();
    const noted = toggleNote(state, 2, 9);
    const set = applySetValue(noted, 2, 4);
    expect(set.grid.notes[2]).toBe(0);
  });

  it("recomputeMistakes counts wrong entries", () => {
    const state = makeSaveGame();
    const wrong = applySetValue(state, 2, 9);
    expect(recomputeMistakes(wrong)).toBe(1);
  });

  it("clearCell resets a value and supports undo", () => {
    const state = makeSaveGame();
    const set = applySetValue(state, 2, 4);
    const cleared = clearCell(set, 2);
    expect(cleared.grid.values[2]).toBeNull();
    const undone = undo(cleared);
    expect(undone.grid.values[2]).toBe(4);
  });
});

describe("persistence", () => {
  it("saves and loads profile", () => {
    const storage = new MemoryStorage();
    const profile = initialProfile();
    saveProfile(profile, storage);
    expect(loadProfile(storage)).toEqual(profile);
  });

  it("saves, loads, and clears save game", () => {
    const storage = new MemoryStorage();
    const save = makeSaveGame();
    saveSaveGame(save, storage);
    expect(loadSaveGame(storage)).toEqual(save);
    clearSaveGame(storage);
    expect(loadSaveGame(storage)).toBeNull();
  });
});

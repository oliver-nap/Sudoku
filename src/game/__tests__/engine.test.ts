import { describe, expect, it } from "vitest";
import type { Digit } from "../types";
import { solveGrid, countSolutions } from "../solver";
import { generateCompleteSolution, generatePuzzle } from "../generator";
import { getConflicts, isWrongEntry } from "../validator";

function parseGrid(input: string): (Digit | null)[] {
  if (input.length !== 81) throw new Error("Grid string must be 81 chars");
  return Array.from(input).map((ch) => {
    if (ch === "." || ch === "0") return null;
    return Number(ch) as Digit;
  });
}

function isValidSolution(values: Digit[]): boolean {
  if (values.length !== 81) return false;
  const row = (r: number) => values.slice(r * 9, r * 9 + 9);
  const col = (c: number) => values.filter((_, i) => i % 9 === c);
  const box = (b: number) => {
    const r0 = Math.floor(b / 3) * 3;
    const c0 = (b % 3) * 3;
    const out: Digit[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        out.push(values[(r0 + r) * 9 + (c0 + c)]);
      }
    }
    return out;
  };
  const isSet = (arr: Digit[]) =>
    arr.slice().sort().join("") === "123456789";
  for (let i = 0; i < 9; i++) {
    if (!isSet(row(i))) return false;
    if (!isSet(col(i))) return false;
    if (!isSet(box(i))) return false;
  }
  return true;
}

const puzzleStr =
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const solutionStr =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

describe("solver", () => {
  it("solves a valid puzzle", () => {
    const puzzle = parseGrid(puzzleStr);
    const solved = solveGrid(puzzle);
    expect(solved).not.toBeNull();
    expect(solved).toEqual(parseGrid(solutionStr));
  });

  it("returns null for invalid puzzles", () => {
    const puzzle = parseGrid(puzzleStr);
    puzzle[1] = 5;
    expect(solveGrid(puzzle)).toBeNull();
  });

  it("countSolutions detects uniqueness", () => {
    const puzzle = parseGrid(puzzleStr);
    expect(countSolutions(puzzle, 2)).toBe(1);
  });

  it("countSolutions detects multiple solutions", () => {
    const puzzle = Array(81).fill(null) as (Digit | null)[];
    puzzle[0] = 1;
    expect(countSolutions(puzzle, 2)).toBe(2);
  });
});

describe("generator", () => {
  it("generates a valid complete solution", () => {
    const solution = generateCompleteSolution();
    expect(isValidSolution(solution)).toBe(true);
  });

  it("generates a puzzle with exactly one solution", () => {
    const puzzle = generatePuzzle("easy");
    expect(countSolutions(puzzle.givens, 2)).toBe(1);
  });

  it("respects given count range for the difficulty", () => {
    const puzzle = generatePuzzle("easy");
    const count = puzzle.givens.filter((v) => v !== null).length;
    expect(count).toBeGreaterThanOrEqual(40);
    expect(count).toBeLessThanOrEqual(45);
  });
});

describe("validator", () => {
  it("detects conflicts in row, column, and box", () => {
    const values = Array(81).fill(null) as (Digit | null)[];
    values[0] = 5;
    values[1] = 5;
    values[9] = 5;
    const conflicts = getConflicts(values, 0, 5);
    expect(conflicts.has(1)).toBe(true);
    expect(conflicts.has(9)).toBe(true);
  });

  it("detects wrong entries based on the solution", () => {
    const puzzle = {
      id: "test",
      difficulty: "easy" as const,
      givens: parseGrid(puzzleStr),
      solution: parseGrid(solutionStr) as Digit[],
    };
    const values = parseGrid(puzzleStr);
    values[2] = 9;
    expect(isWrongEntry(puzzle, values, 2)).toBe(true);
  });
});

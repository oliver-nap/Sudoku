import type { Difficulty } from "./types";

export interface DifficultyParams {
  minGivens: number;
  maxGivens: number;
}

export const DIFFICULTY_PARAMS: Record<Difficulty, DifficultyParams> = {
  easy: { minGivens: 40, maxGivens: 45 },
  medium: { minGivens: 32, maxGivens: 36 },
  hard: { minGivens: 26, maxGivens: 30 },
  expert: { minGivens: 22, maxGivens: 25 },
};

export function getTargetGivens(difficulty: Difficulty): number {
  const { minGivens, maxGivens } = DIFFICULTY_PARAMS[difficulty];
  return minGivens + Math.floor(Math.random() * (maxGivens - minGivens + 1));
}

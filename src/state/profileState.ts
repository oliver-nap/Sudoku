import type { Difficulty, Profile } from "../game/types";

const BASE_XP: Record<Difficulty, number> = {
  easy: 100,
  medium: 160,
  hard: 240,
  expert: 320,
};

export function initialProfile(): Profile {
  return {
    level: 1,
    xp: 0,
    totals: {
      played: 0,
      completed: 0,
      mistakes: 0,
      timeSeconds: 0,
    },
  };
}

export function xpToNext(level: number): number {
  return 250 + (level - 1) * 75;
}

export function computeXpEarned(difficulty: Difficulty, mistakes: number): number {
  const base = BASE_XP[difficulty];
  const penalty = 1 - 0.15 * mistakes;
  const earned = Math.round(base * penalty);
  const minEarned = Math.round(base * 0.2);
  return Math.max(earned, minEarned);
}

export function addCompletedGame(params: {
  difficulty: Difficulty;
  mistakes: number;
  elapsedSeconds: number;
  profile?: Profile;
}): Profile {
  const profile = params.profile ?? initialProfile();
  const earned = computeXpEarned(params.difficulty, params.mistakes);

  let level = profile.level;
  let xp = profile.xp + earned;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level++;
  }

  return {
    level,
    xp,
    totals: {
      played: profile.totals.played + 1,
      completed: profile.totals.completed + 1,
      mistakes: profile.totals.mistakes + params.mistakes,
      timeSeconds: profile.totals.timeSeconds + params.elapsedSeconds,
    },
  };
}

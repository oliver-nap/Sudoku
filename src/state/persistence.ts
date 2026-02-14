import type { Profile, SaveGame, Settings } from "../game/types";
import { LocalStorageProvider, type StorageProvider } from "./storage";

export const PROFILE_KEY = "sudoku.profile.v1";
export const SAVE_KEY = "sudoku.save.v1";
export const SETTINGS_KEY = "sudoku.settings.v1";

const defaultStorage = new LocalStorageProvider();

function readJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(value: unknown): string {
  return JSON.stringify(value);
}

export function loadProfile(storage: StorageProvider = defaultStorage): Profile | null {
  return readJSON<Profile>(storage.get(PROFILE_KEY));
}

export function saveProfile(
  profile: Profile,
  storage: StorageProvider = defaultStorage,
): void {
  storage.set(PROFILE_KEY, writeJSON(profile));
}

export function loadSaveGame(storage: StorageProvider = defaultStorage): SaveGame | null {
  return readJSON<SaveGame>(storage.get(SAVE_KEY));
}

export function saveSaveGame(
  save: SaveGame,
  storage: StorageProvider = defaultStorage,
): void {
  storage.set(SAVE_KEY, writeJSON(save));
}

export function clearSaveGame(storage: StorageProvider = defaultStorage): void {
  storage.remove(SAVE_KEY);
}

export function loadSettings(storage: StorageProvider = defaultStorage): Settings | null {
  return readJSON<Settings>(storage.get(SETTINGS_KEY));
}

export function saveSettings(
  settings: Settings,
  storage: StorageProvider = defaultStorage,
): void {
  storage.set(SETTINGS_KEY, writeJSON(settings));
}


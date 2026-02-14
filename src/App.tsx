import { useEffect, useMemo, useState } from "react";
import "./App.css";
import type { Difficulty, SaveGame, Settings } from "./game/types";
import {
  clearSaveGame,
  loadProfile,
  loadSaveGame,
  loadSettings,
  saveProfile,
  saveSaveGame,
  saveSettings,
} from "./state/persistence";
import { applyTheme } from "./ui/theme";
import { createNewGame } from "./state/gameState";
import { addCompletedGame, computeXpEarned, initialProfile, xpToNext } from "./state/profileState";
import { Start } from "./screens/Start";
import { Game } from "./screens/Game";
import { Success } from "./screens/Success";
import { Settings as SettingsScreen } from "./screens/Settings";
import { Tutorial } from "./screens/Tutorial";

type Screen = "start" | "game" | "success" | "settings" | "tutorial";

const defaultSettings: Settings = {
  theme: "dark",
  showMistakes: true,
  highlightConflicts: true,
  highlightSameDigit: true,
  highlightDigitLines: true,
  highlightDigitBlocks: true,
  sound: false,
  language: "de",
  hasSeenTutorial: false,
};

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [saveGame, setSaveGame] = useState<SaveGame | null>(null);
  const [profile, setProfile] = useState(() => loadProfile() ?? initialProfile());
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    ...(loadSettings() ?? {}),
  }));
  const [successData, setSuccessData] = useState<{
    save: SaveGame;
    xpEarned: number;
    level: number;
    xp: number;
  } | null>(null);

  useEffect(() => {
    applyTheme(settings.theme);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const saved = loadSaveGame();
    if (saved && !isSolved(saved)) {
      setSaveGame(saved);
    } else if (saved) {
      clearSaveGame();
    }
  }, []);

  useEffect(() => {
    if (!settings.hasSeenTutorial) {
      setScreen("tutorial");
    }
  }, [settings.hasSeenTutorial]);


  useEffect(() => {
    if (!saveGame) return;
    const timeout = setTimeout(() => {
      saveSaveGame(saveGame);
    }, 200);
    return () => clearTimeout(timeout);
  }, [saveGame]);

  useEffect(() => {
    if (!saveGame) return;
    if (!isSolved(saveGame)) return;
    const xpEarned = computeXpEarned(saveGame.puzzle.difficulty, saveGame.mistakes);
    const updatedProfile = addCompletedGame({
      difficulty: saveGame.puzzle.difficulty,
      mistakes: saveGame.mistakes,
      elapsedSeconds: saveGame.elapsedSeconds,
      profile,
    });
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
    setSuccessData({
      save: saveGame,
      xpEarned,
      level: updatedProfile.level,
      xp: updatedProfile.xp,
    });
    clearSaveGame();
    setSaveGame(null);
    setScreen("success");
  }, [saveGame, profile]);

  const canContinue = useMemo(() => !!saveGame, [saveGame]);

  const startNewGame = () => {
    const next = createNewGame(difficulty);
    setSuccessData(null);
    setSaveGame(next);
    setScreen("game");
  };

  if (screen === "tutorial") {
    return (
      <div className="app">
        <Tutorial
          onDone={() => {
            setSettings((s) => ({ ...s, hasSeenTutorial: true }));
            setScreen("start");
          }}
          onBack={() => {
            setSettings((s) => ({ ...s, hasSeenTutorial: true }));
            setScreen("start");
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {screen === "start" ? (
        <Start
          canContinue={canContinue}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onNewGame={startNewGame}
          onContinue={() => setScreen("game")}
          onTutorial={() => setScreen("tutorial")}
          onSettings={() => setScreen("settings")}
        />
      ) : null}

      {screen === "game" && saveGame ? (
        <Game
          save={saveGame}
          profile={profile}
          settings={settings}
          onChange={setSaveGame}
          onMenu={() => setScreen("start")}
        />
      ) : null}

      {screen === "success" && successData ? (
        <Success
          elapsedSeconds={successData.save.elapsedSeconds}
          mistakes={successData.save.mistakes}
          xpEarned={successData.xpEarned}
          level={successData.level}
          xp={successData.xp}
          xpToNext={xpToNext(successData.level)}
          onNextGame={startNewGame}
          onMenu={() => setScreen("start")}
        />
      ) : null}

      {screen === "settings" ? (
        <SettingsScreen
          settings={settings}
          onChange={setSettings}
          onBack={() => setScreen("start")}
        />
      ) : null}
    </div>
  );
}

function isSolved(save: SaveGame): boolean {
  return save.grid.values.every((v, i) => v === save.puzzle.solution[i]);
}

export default App;

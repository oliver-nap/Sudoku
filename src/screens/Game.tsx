import { useEffect, useMemo, useRef, useState } from "react";
import type { CellIndex, Digit, Profile, SaveGame, Settings } from "../game/types";
import { getConflicts } from "../game/validator";
import {
  applySetValue,
  clearCell,
  setElapsedSeconds,
  toggleNote,
  undo,
} from "../state/gameState";
import { Grid } from "../components/Grid";
import { Numpad } from "../components/Numpad";
import { Toolbar } from "../components/Toolbar";
import { Modal } from "../ui/primitives/Modal";
import { Button } from "../ui/primitives/Button";
import { xpToNext } from "../state/profileState";

export interface GameProps {
  save: SaveGame;
  profile: Profile;
  settings: Settings;
  onChange: (next: SaveGame) => void;
  onMenu: () => void;
  onNewGame: () => void;
  onSettings: () => void;
}
export function Game({
  save,
  profile,
  settings,
  onChange,
  onMenu,
  onNewGame,
  onSettings,
}: GameProps) {
  const [selectedIndex, setSelectedIndex] = useState<CellIndex | null>(0);
  const [selectedDigit, setSelectedDigit] = useState<Digit | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showMenuConfirm, setShowMenuConfirm] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const lastTickMsRef = useRef<number | null>(null);

  const conflictIndices = useMemo(() => {
    if (!settings.highlightConflicts) return new Set<CellIndex>();
    if (selectedIndex === null) return new Set<CellIndex>();
    const value = save.grid.values[selectedIndex];
    const conflicts = getConflicts(save.grid.values, selectedIndex, value);
    if (conflicts.size > 0) conflicts.add(selectedIndex);
    return conflicts;
  }, [save.grid.values, selectedIndex, settings.highlightConflicts]);
  const digitAreaSets = useMemo(() => {
    if (selectedDigit === null) {
      return { rows: new Set<number>(), cols: new Set<number>(), blocks: new Set<number>() };
    }
    const rows = new Set<number>();
    const cols = new Set<number>();
    const blocks = new Set<number>();
    save.grid.values.forEach((value, index) => {
      if (value !== selectedDigit) return;
      const row = Math.floor(index / 9);
      const col = index % 9;
      const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      if (settings.highlightDigitLines) {
        rows.add(row);
        cols.add(col);
      }
      if (settings.highlightDigitBlocks) {
        blocks.add(block);
      }
    });
    return { rows, cols, blocks };
  }, [
    save.grid.values,
    selectedDigit,
    settings.highlightDigitLines,
    settings.highlightDigitBlocks,
  ]);

  const applyDigit = (digit: Digit) => {
    if (paused) return;
    if (selectedIndex === null) return;
    if (noteMode) {
      onChange(toggleNote(save, selectedIndex, digit));
      return;
    }
    setSelectedDigit(digit);
    onChange(applySetValue(save, selectedIndex, digit));
  };

  const handleNumpadDigit = (digit: Digit) => {
    applyDigit(digit);
  };

  const handleKeyboardDigit = (digit: Digit) => {
    applyDigit(digit);
  };

  const handleDelete = () => {
    if (paused) return;
    if (selectedIndex === null) return;
    onChange(clearCell(save, selectedIndex));
  };

  const handleSelect = (index: CellIndex) => {
    if (paused) return;
    setSelectedIndex(index);
    const value = save.grid.values[index];
    if (value !== null) {
      setSelectedDigit(value);
    }
  };
  const setPausedState = (next: boolean) => {
    lastTickMsRef.current = Date.now();
    setPaused(next);
  };

  useEffect(() => {
    lastTickMsRef.current = Date.now();
    setPaused(false);
  }, [save.startedAt]);

  useEffect(() => {
    const handle = setInterval(() => {
      const now = Date.now();
      if (paused) {
        lastTickMsRef.current = now;
        return;
      }
      const last = lastTickMsRef.current ?? now;
      const deltaSeconds = Math.floor((now - last) / 1000);
      if (deltaSeconds <= 0) return;
      lastTickMsRef.current = last + deltaSeconds * 1000;
      onChange(setElapsedSeconds(save, save.elapsedSeconds + deltaSeconds));
    }, 250);
    return () => clearInterval(handle);
  }, [paused, save, onChange]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setPausedState(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (paused) return;
    const handler = (event: KeyboardEvent) => {
      if (paused) return;
      if (selectedIndex === null) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        onChange(clearCell(save, selectedIndex));
        return;
      }
      const digit = Number(event.key);
      if (digit >= 1 && digit <= 9) {
        event.preventDefault();
        handleKeyboardDigit(digit as Digit);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, save, noteMode, paused]);

  return (
    <div className="screen game-screen">
      <div className="game-card surface viewport-safe-card">
        <div className="game-header">
          <div className="xp-mini">
            <div className="xp-mini-header">
              <div className="label">Level {profile.level}</div>
              <div className="muted">
                XP: {profile.xp} / {xpToNext(profile.level)}
              </div>
            </div>
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{
                  width: `${Math.min(
                    100,
                    (profile.xp / xpToNext(profile.level)) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="game-header-stats">
            <div className="stat">
              <div className="label">Fehler</div>
              <div className="value">{settings.showMistakes ? save.mistakes : "—"}</div>
            </div>
            <div className="stat">
              <div className="label">Zeit</div>
              <div className="value">{formatSeconds(save.elapsedSeconds)}</div>
            </div>
            <button
              className="menu-button"
              aria-label="Spielmenü öffnen"
              onClick={() => setShowActionMenu(true)}
            >
              ⋯
            </button>
          </div>
        </div>

        <div className={`grid-wrapper ${paused ? "paused" : ""}`}>
          <div className="grid-sizer grid-viewport-safe">
            <Grid
              values={save.grid.values}
              notes={save.grid.notes}
              givens={save.puzzle.givens}
              selectedIndex={selectedIndex}
              conflictIndices={conflictIndices}
              sameDigitValue={settings.highlightSameDigit ? selectedDigit : null}
              digitAreaRows={digitAreaSets.rows}
              digitAreaCols={digitAreaSets.cols}
              digitAreaBlocks={digitAreaSets.blocks}
              selectedDigit={selectedDigit}
              onSelect={handleSelect}
            />
          </div>
          {paused ? (
            <div className="pause-overlay" aria-live="polite">
              <div className="pause-card">
                <div className="pause-title">Pausiert</div>
                <Button onClick={() => setPausedState(false)}>Weiter</Button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="game-controls">
          <Numpad
            values={save.grid.values}
            onDigit={handleNumpadDigit}
            onDelete={handleDelete}
            disabled={paused}
          />
          <Toolbar
            noteMode={noteMode}
            onToggleNotes={() => setNoteMode((v) => !v)}
            onUndo={() => onChange(undo(save))}
            onMenu={() => setShowMenuConfirm(true)}
            paused={paused}
            onTogglePause={() => setPausedState(!paused)}
          />
        </div>
      <Modal
        open={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        title="Aktionen"
      >
        <div className="action-menu">
          <Button
            variant="secondary"
            onClick={() => {
              setPausedState(!paused);
              setShowActionMenu(false);
            }}
          >
            {paused ? "Weiter" : "Pause"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onChange(undo(save));
              setShowActionMenu(false);
            }}
          >
            Undo
          </Button>
          <Button
            variant={noteMode ? "primary" : "secondary"}
            onClick={() => {
              setNoteMode((v) => !v);
              setShowActionMenu(false);
            }}
          >
            {noteMode ? "Notizen aus" : "Notizen an"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleDelete();
              setShowActionMenu(false);
            }}
          >
            Löschen
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onNewGame();
              setShowActionMenu(false);
            }}
          >
            Neues Spiel
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onSettings();
              setShowActionMenu(false);
            }}
          >
            Einstellungen
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setShowMenuConfirm(true);
              setShowActionMenu(false);
            }}
          >
            Hauptmenü
          </Button>
        </div>
      </Modal>
      </div>

      <Modal
        open={showMenuConfirm}
        onClose={() => setShowMenuConfirm(false)}
        title="Spiel verlassen?"
      >
        <p className="muted">Fortschritt wird gespeichert.</p>
        <div className="button-row" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setShowMenuConfirm(false)}>
            Abbrechen
          </Button>
          <Button onClick={onMenu}>Menü</Button>
        </div>
      </Modal>
    </div>
  );
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

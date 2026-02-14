import type { Difficulty } from "../game/types";
import { Button } from "../ui/primitives/Button";

export interface StartProps {
  canContinue: boolean;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onContinue: () => void;
  onTutorial: () => void;
  onSettings: () => void;
}

export function Start({
  canContinue,
  difficulty,
  onDifficultyChange,
  onNewGame,
  onContinue,
  onTutorial,
  onSettings,
}: StartProps) {
  return (
    <div className="screen start-screen">
      <div className="card surface">
        <h1>Sudoku</h1>
        <p className="muted">Ein ruhiges, klares Sudoku für zwischendurch.</p>
      </div>

      <div className="card surface">
        <div className="difficulty">
          {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((level) => (
            <button
              key={level}
              className={`chip ${difficulty === level ? "active" : ""}`}
              onClick={() => onDifficultyChange(level)}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="button-stack">
          <Button onClick={onNewGame}>Neues Spiel</Button>
          {canContinue ? (
            <Button variant="secondary" onClick={onContinue}>
              Fortsetzen
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onTutorial}>
            Tutorial
          </Button>
          <Button variant="ghost" onClick={onSettings}>
            Einstellungen
          </Button>
        </div>
      </div>
    </div>
  );
}

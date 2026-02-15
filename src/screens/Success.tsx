import { Button } from "../ui/primitives/Button";

export interface SuccessProps {
  elapsedSeconds: number;
  mistakes: number;
  xpEarned: number;
  level: number;
  xp: number;
  xpToNext: number;
  onNextGame: () => void;
  onMenu: () => void;
}

export function Success({
  elapsedSeconds,
  mistakes,
  xpEarned,
  level,
  xp,
  xpToNext,
  onNextGame,
  onMenu,
}: SuccessProps) {
  return (
    <div className="screen success-screen">
      <div className="card surface screen-card-compact success-header-card">
        <h1>Gelöst!</h1>
        <p className="muted screen-subtitle">Starke Leistung.</p>
      </div>
      <div className="card surface screen-card-compact success-stats-card">
        <div className="stats-grid">
          <div>
            <div className="label">Zeit</div>
            <div className="value">{formatSeconds(elapsedSeconds)}</div>
          </div>
          <div>
            <div className="label">Fehler</div>
            <div className="value">{mistakes}</div>
          </div>
          <div>
            <div className="label">XP</div>
            <div className="value">+{xpEarned}</div>
          </div>
        </div>

        <div className="xp-bar">
          <div className="xp-bar-label">Level {level}</div>
          <div className="xp-bar-track">
            <div
              className="xp-bar-fill"
              style={{ width: `${Math.min(100, (xp / xpToNext) * 100)}%` }}
            />
          </div>
          <div className="xp-bar-caption">
            {xp} / {xpToNext} XP
          </div>
        </div>
      </div>

      <div className="footer-actions success-footer">
        <Button onClick={onNextGame}>Nächstes Spiel</Button>
        <Button variant="ghost" onClick={onMenu}>
          Menü
        </Button>
      </div>
    </div>
  );
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

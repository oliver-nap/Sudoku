import type { Settings as SettingsType } from "../game/types";
import { Button } from "../ui/primitives/Button";
import { Toggle } from "../ui/primitives/Toggle";

export interface SettingsProps {
  settings: SettingsType;
  onChange: (settings: SettingsType) => void;
  onBack: () => void;
}

export function Settings({ settings, onChange, onBack }: SettingsProps) {
  return (
    <div className="screen settings-screen">
      <div className="card surface">
        <h1>Einstellungen</h1>
        <p className="muted">Passe das Erlebnis an.</p>
      </div>

      <div className="card surface">
        <div className="setting-row">
          <div>
            <div className="label">Theme</div>
            <div className="muted">Light, Dark oder Auto</div>
          </div>
          <div className="segmented">
            {(["light", "dark", "auto"] as const).map((mode) => (
              <button
                key={mode}
                className={`chip ${settings.theme === mode ? "active" : ""}`}
                onClick={() => onChange({ ...settings, theme: mode })}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <SettingToggle
          label="Fehler anzeigen"
          checked={settings.showMistakes}
          onChange={(checked) => onChange({ ...settings, showMistakes: checked })}
        />
        <SettingToggle
          label="Konflikte hervorheben"
          checked={settings.highlightConflicts}
          onChange={(checked) =>
            onChange({ ...settings, highlightConflicts: checked })
          }
        />
        <SettingToggle
          label="Gleiche Zahl hervorheben"
          checked={settings.highlightSameDigit}
          onChange={(checked) =>
            onChange({ ...settings, highlightSameDigit: checked })
          }
        />
        <SettingToggle
          label="Linien/Spalten hervorheben"
          checked={settings.highlightDigitLines}
          onChange={(checked) =>
            onChange({ ...settings, highlightDigitLines: checked })
          }
        />
        <SettingToggle
          label="3x3-Blöcke hervorheben"
          checked={settings.highlightDigitBlocks}
          onChange={(checked) =>
            onChange({ ...settings, highlightDigitBlocks: checked })
          }
        />
        <SettingToggle
          label="Sound"
          checked={settings.sound}
          onChange={(checked) => onChange({ ...settings, sound: checked })}
        />
      </div>

      <div className="button-row">
        <Button onClick={onBack}>Zurück</Button>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <div className="label">{label}</div>
      <Toggle checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

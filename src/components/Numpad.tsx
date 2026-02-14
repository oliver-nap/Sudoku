import type { Digit } from "../game/types";
import { Button } from "../ui/primitives/Button";

export interface NumpadProps {
  values: ReadonlyArray<Digit | null>;
  onDigit: (digit: Digit) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function Numpad({ values, onDigit, onDelete, disabled }: NumpadProps) {
  const counts = new Map<Digit, number>();
  for (let d = 1 as Digit; d <= 9; d++) counts.set(d, 0);
  for (const v of values) {
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  return (
    <div className="numpad">
      {Array.from({ length: 9 }, (_, i) => (i + 1) as Digit).map((d) => {
        const remaining = 9 - (counts.get(d) ?? 0);
        const isDepleted = remaining <= 0;
        return (
          <Button
            key={d}
            variant="secondary"
            className="numpad-button"
            onClick={() => onDigit(d)}
            disabled={isDepleted || disabled}
          >
            {d}
            {remaining > 0 ? (
              <span className="numpad-badge">{remaining}</span>
            ) : null}
          </Button>
        );
      })}
      <Button variant="ghost" onClick={onDelete} disabled={disabled}>
        Löschen
      </Button>
    </div>
  );
}

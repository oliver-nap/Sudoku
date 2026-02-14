import type { CellIndex, Digit, NotesMask } from "../game/types";
import { hasNote } from "../state/gameState";

export interface CellProps {
  index: CellIndex;
  value: Digit | null;
  notes: NotesMask;
  given: boolean;
  selected: boolean;
  highlightSame: boolean;
  scanHighlight: boolean;
  conflict: boolean;
  onSelect: (index: CellIndex) => void;
}

export function Cell({
  index,
  value,
  notes,
  given,
  selected,
  highlightSame,
  scanHighlight,
  conflict,
  onSelect,
}: CellProps) {
  const classes = [
    "cell",
    given ? "given" : "editable",
    selected ? "selected" : "",
    scanHighlight ? "cellScanHighlight" : "",
    highlightSame ? "cellSameDigit" : "",
    conflict ? "conflict" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} onClick={() => onSelect(index)}>
      {value ? (
        <span className="cell-value">{value}</span>
      ) : (
        <span className="cell-notes">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((d) => (
            <span key={d} className="cell-note">
              {hasNote(notes, d as Digit) ? d : ""}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

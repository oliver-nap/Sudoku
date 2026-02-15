import type { CellIndex, Digit, NotesMask } from "../game/types";
import { Cell } from "./Cell";

export interface GridProps {
  values: ReadonlyArray<Digit | null>;
  notes: ReadonlyArray<NotesMask>;
  givens: ReadonlyArray<Digit | null>;
  selectedIndex: CellIndex | null;
  conflictIndices: Set<CellIndex>;
  sameDigitValue: Digit | null;
  digitAreaRows: Set<number>;
  digitAreaCols: Set<number>;
  digitAreaBlocks: Set<number>;
  selectedDigit: Digit | null;
  onSelect: (index: CellIndex) => void;
}

export function Grid({
  values,
  notes,
  givens,
  selectedIndex,
  conflictIndices,
  sameDigitValue,
  digitAreaRows,
  digitAreaCols,
  digitAreaBlocks,
  selectedDigit,
  onSelect,
}: GridProps) {

  return (
    <div className="grid">
      {values.map((value, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        const isSameDigit = sameDigitValue !== null && value === sameDigitValue;
        const isDigitArea =
          digitAreaRows.has(row) ||
          digitAreaCols.has(col) ||
          digitAreaBlocks.has(block);
        const isBlockedForDigit =
          selectedDigit !== null && value !== null && value !== selectedDigit;
        const isConflict = conflictIndices.has(index);
        const scanEnabled =
          digitAreaRows.size > 0 || digitAreaCols.size > 0 || digitAreaBlocks.size > 0;
        const isScanHighlight =
          scanEnabled &&
          selectedDigit !== null &&
          (isDigitArea || isBlockedForDigit) &&
          !isSameDigit &&
          !isConflict;
        return (
        <Cell
          key={index}
          index={index}
          value={value}
          notes={notes[index]}
          given={givens[index] !== null}
          selected={selectedIndex === index}
          highlightSame={isSameDigit}
          scanHighlight={isScanHighlight}
          conflict={isConflict}
          onSelect={onSelect}
        />
        );
      })}
    </div>
  );
}

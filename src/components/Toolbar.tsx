import { Button } from "../ui/primitives/Button";

export interface ToolbarProps {
  noteMode: boolean;
  onToggleNotes: () => void;
  onUndo: () => void;
  onMenu: () => void;
  paused: boolean;
  onTogglePause: () => void;
}

export function Toolbar({
  noteMode,
  onToggleNotes,
  onUndo,
  onMenu,
  paused,
  onTogglePause,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <Button variant="secondary" onClick={onTogglePause}>
        {paused ? "Weiter" : "Pause"}
      </Button>
      <Button variant={noteMode ? "primary" : "secondary"} onClick={onToggleNotes}>
        Notizen
      </Button>
      <Button variant="secondary" onClick={onUndo}>
        Undo
      </Button>
      <Button variant="ghost" onClick={onMenu}>
        Menü
      </Button>
    </div>
  );
}

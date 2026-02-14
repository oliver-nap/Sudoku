import { useState } from "react";
import { Button } from "../ui/primitives/Button";

export interface TutorialProps {
  onDone: () => void;
  onBack: () => void;
}

const steps = [
  {
    title: "Willkommen",
    text: "Sudoku besteht aus 9x9 Feldern. Jede Zeile, Spalte und 3x3-Box muss die Zahlen 1–9 enthalten.",
  },
  {
    title: "Zellen wählen",
    text: "Tippe auf eine Zelle, um sie zu markieren. Gib dann eine Zahl über das Nummernfeld ein.",
  },
  {
    title: "Notizen",
    text: "Im Notizenmodus kannst du kleine Kandidaten notieren. Das hilft beim Logikrätseln.",
  },
  {
    title: "Konflikte",
    text: "Falsche Einträge werden als Konflikte markiert, wenn diese Option aktiv ist.",
  },
  {
    title: "Viel Spaß",
    text: "Nimm dir Zeit, löse ruhig und genieße den Flow.",
  },
];

export function Tutorial({ onDone, onBack }: TutorialProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <div className="screen tutorial-screen">
      <div className="card surface">
        <h1>{current.title}</h1>
        <p className="muted">{current.text}</p>
        <div className="wizard-progress">
          Schritt {step + 1} / {steps.length}
        </div>
      </div>

      <div className="button-row">
        <Button variant="ghost" onClick={step === 0 ? onBack : () => setStep(step - 1)}>
          Zurück
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>Weiter</Button>
        ) : (
          <Button onClick={onDone}>Fertig</Button>
        )}
      </div>
    </div>
  );
}

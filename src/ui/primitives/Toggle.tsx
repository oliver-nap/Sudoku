import type { HTMLAttributes } from "react";

export interface ToggleProps extends HTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange, className, ...rest }: ToggleProps) {
  return (
    <button
      className={`ui-toggle ${checked ? "on" : "off"} ${className ?? ""}`}
      onClick={() => onChange(!checked)}
      {...rest}
    >
      <span className="ui-toggle-thumb" />
    </button>
  );
}

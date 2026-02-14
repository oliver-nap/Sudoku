export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Toggle({ checked, onCheckedChange, className, ...rest }: ToggleProps) {
  return (
    <button
      className={`ui-toggle ${checked ? "on" : "off"} ${className ?? ""}`}
      onClick={() => onCheckedChange(!checked)}
      {...rest}
    >
      <span className="ui-toggle-thumb" />
    </button>
  );
}

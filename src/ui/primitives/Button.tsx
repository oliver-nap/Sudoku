import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  return (
    <button className={`ui-button ${variant} ${className ?? ""}`} {...rest} />
  );
}

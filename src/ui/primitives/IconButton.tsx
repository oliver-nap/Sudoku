import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export interface IconButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {}

export function IconButton({ className, ...rest }: IconButtonProps) {
  return <button className={`ui-icon-button ${className ?? ""}`} {...rest} />;
}

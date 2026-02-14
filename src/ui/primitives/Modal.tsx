import type { PropsWithChildren } from "react";

export interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose?: () => void;
  title?: string;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal-header">
          <div className="ui-modal-title">{title}</div>
          {onClose ? (
            <button className="ui-modal-close" onClick={onClose}>
              ✕
            </button>
          ) : null}
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
}

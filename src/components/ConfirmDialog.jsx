import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible modal dialog.
 * - Escape / backdrop click = cancel (disabled while busy)
 * - Focus moves into the dialog and returns to the trigger on close
 * - Tab is trapped inside the dialog
 * - Pass `cancelLabel={null}` for a single-button (info) dialog
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = '確定',
  cancelLabel = '取消',
  danger = false,
  busy = false,
  busyLabel = '處理中...',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const initialFocusRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  // Remember what had focus, focus the safe button, restore on close.
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    initialFocusRef.current?.focus();
    return () => {
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  // Keyboard handling lives on `document` in the capture phase so it runs
  // before the cart drawer's Escape listener, even when focus has left the
  // dialog (e.g. the confirm button became disabled while busy).
  const latest = useRef({});
  latest.current = { busy, onCancel, onConfirm };

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      const { busy: isBusy, onCancel: cancel, onConfirm: confirm } = latest.current;
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (!isBusy) (cancel ?? confirm)();
        return;
      }
      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        const focusables = dialog.querySelectorAll('button:not([disabled])');
        if (focusables.length === 0) {
          e.preventDefault();
          dialog.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const inside = dialog.contains(document.activeElement);
        if (!inside) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open]);

  // Disabled buttons drop focus; keep it inside the dialog while busy.
  useEffect(() => {
    if (open && busy) dialogRef.current?.focus();
  }, [open, busy]);

  if (!open) return null;

  const hasCancel = cancelLabel != null && onCancel;

  return createPortal(
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) (onCancel ?? onConfirm)();
      }}
    >
      <div
        ref={dialogRef}
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        aria-busy={busy}
        tabIndex={-1}
      >
        <h2 id={titleId} className="dialog-title">{title}</h2>
        <div id={descId} className="dialog-body">{children}</div>
        <div className="dialog-actions">
          {hasCancel && (
            <button
              ref={initialFocusRef}
              type="button"
              className="dialog-btn dialog-btn-secondary"
              onClick={onCancel}
              disabled={busy}
            >
              {cancelLabel}
            </button>
          )}
          <button
            ref={hasCancel ? undefined : initialFocusRef}
            type="button"
            className={`dialog-btn ${danger ? 'dialog-btn-danger' : 'dialog-btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

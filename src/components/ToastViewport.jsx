import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function Toast({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);

  // Restart the full timer whenever the toast is re-triggered.
  useEffect(() => {
    remaining.current = toast.duration;
  }, [toast.updatedAt, toast.duration]);

  // Auto-dismiss, pausing while hovered/focused so it can be read or clicked.
  useEffect(() => {
    if (paused) return undefined;
    startedAt.current = Date.now();
    const timer = setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    };
  }, [paused, toast.id, toast.updatedAt, onDismiss]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <li
      className={`toast toast-${toast.type}`}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <span className="toast-icon" aria-hidden="true">{toast.type === 'warning' ? '⚠️' : '✓'}</span>
      <div className="toast-content">
        <div className="toast-title">
          {toast.title}
          {toast.count > 1 && <span className="toast-count"> ×{toast.count}</span>}
        </div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      {toast.action && (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            toast.action.onClick();
            onDismiss(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button type="button" className="toast-close" aria-label="關閉通知" onClick={() => onDismiss(toast.id)}>
        ×
      </button>
      <span
        key={toast.updatedAt}
        className="toast-progress"
        style={{
          animationDuration: `${toast.duration}ms`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
        aria-hidden="true"
      />
    </li>
  );
}

export default function ToastViewport({ toasts, onDismiss }) {
  // Always rendered (even empty) so screen readers register the live region
  // before the first message arrives.
  return createPortal(
    <ol className="toast-viewport" aria-live="polite" aria-label="通知">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </ol>,
    document.body
  );
}

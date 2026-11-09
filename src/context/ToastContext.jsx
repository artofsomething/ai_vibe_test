import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react';
import ToastViewport from '../components/ToastViewport.jsx';

const MAX_TOASTS = 3;
const ToastContext = createContext(null);

function toastReducer(state, action) {
  switch (action.type) {
    case 'show': {
      const { toast } = action;
      // Same key (e.g. same product added again) -> update in place and bump
      // the counter instead of stacking duplicates.
      const existing = toast.key && state.find((t) => t.key === toast.key);
      if (existing) {
        return state.map((t) =>
          t.key === toast.key ? { ...t, ...toast, id: t.id, count: t.count + 1 } : t
        );
      }
      return [...state, { ...toast, count: 1 }].slice(-MAX_TOASTS);
    }
    case 'dismiss':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const nextId = useRef(1);

  /**
   * show({ key?, type?: 'success' | 'warning', title, message?, action?: { label, onClick }, duration? })
   */
  const show = useCallback((toast) => {
    dispatch({
      type: 'show',
      toast: { type: 'success', duration: 3000, ...toast, id: nextId.current++, updatedAt: Date.now() },
    });
  }, []);

  const dismiss = useCallback((id) => dispatch({ type: 'dismiss', id }), []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

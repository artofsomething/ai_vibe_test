import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

export const MAX_QTY = 99;
const STORAGE_KEY = 'shop-cart-v1';

const clamp = (n) => Math.max(0, Math.min(MAX_QTY, Math.floor(n)));

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, qty = 1 } = action;
      const existing = state.find((i) => i.product.id === product.id);
      if (existing) {
        return state.map((i) =>
          i.product.id === product.id ? { ...i, quantity: clamp(i.quantity + qty) } : i
        );
      }
      return [...state, { product, quantity: clamp(qty) }];
    }
    case 'setQty': {
      const quantity = clamp(action.quantity);
      if (quantity === 0) return state.filter((i) => i.product.id !== action.id);
      return state.map((i) => (i.product.id === action.id ? { ...i, quantity } : i));
    }
    case 'remove':
      return state.filter((i) => i.product.id !== action.id);
    case 'removeMany': {
      const ids = new Set(action.ids);
      return state.filter((i) => !ids.has(i.product.id));
    }
    default:
      return state;
  }
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i?.product && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: cart just won't persist */
    }
  }, [items]);

  const value = useMemo(() => {
    const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    return {
      items,
      totalPrice,
      add: (product, qty) => dispatch({ type: 'add', product, qty }),
      setQty: (id, quantity) => dispatch({ type: 'setQty', id, quantity }),
      remove: (id) => dispatch({ type: 'remove', id }),
      removeMany: (ids) => dispatch({ type: 'removeMany', ids }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

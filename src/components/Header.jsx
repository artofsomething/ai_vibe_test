import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function Header({ onCartClick }) {
  const { totalQuantity } = useCart();
  const [bump, setBump] = useState(false);
  const prev = useRef(totalQuantity);

  // Pop the badge only when the count goes up (adding), not on page load.
  useEffect(() => {
    if (totalQuantity > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 300);
      prev.current = totalQuantity;
      return () => clearTimeout(t);
    }
    prev.current = totalQuantity;
    return undefined;
  }, [totalQuantity]);

  const badge = totalQuantity > 99 ? '99+' : String(totalQuantity);

  return (
    <header className="header">
      <h1>精品商店</h1>
      <button
        type="button"
        className="cart-button"
        onClick={onCartClick}
        aria-label={`購物車，共 ${totalQuantity} 件商品`}
      >
        🛒 購物車
        <span
          className={`cart-count${totalQuantity === 0 ? ' is-empty' : ''}${bump ? ' bump' : ''}`}
          data-testid="cart-count"
          aria-hidden="true"
        >
          {badge}
        </span>
      </button>
      {/* Announce count changes to screen readers */}
      <span className="visually-hidden" aria-live="polite">
        購物車共 {totalQuantity} 件商品
      </span>
    </header>
  );
}

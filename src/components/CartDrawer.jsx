import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import CartItem from './CartItem.jsx';

export default function CartDrawer({ open, onClose, onCheckout, onRequestRemove, checkingOut }) {
  const { items, totalPrice, totalQuantity, setQty } = useCart();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      <div className={`cart-overlay${open ? ' open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`cart-sidebar${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="購物車"
        aria-hidden={!open}
      >
        <div className="cart-header">
          <h2>
            購物車
            {totalQuantity > 0 && <span className="cart-header-count">（{totalQuantity} 件）</span>}
          </h2>
          <button ref={closeRef} type="button" className="close-cart" aria-label="關閉購物車" onClick={onClose}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">購物車是空的</p>
        ) : (
          <ul className="cart-items">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onDecrement={() =>
                  item.quantity <= 1
                    ? onRequestRemove(item) // going to 0 removes the item, so confirm first
                    : setQty(item.product.id, item.quantity - 1)
                }
                onIncrement={() => setQty(item.product.id, item.quantity + 1)}
                onRemove={() => onRequestRemove(item)}
              />
            ))}
          </ul>
        )}

        <div className="cart-total">
          {items.length > 0 && (
            <div className="cart-summary">
              <span>{items.length} 種商品</span>
              <span>共 {totalQuantity} 件</span>
            </div>
          )}
          <div className="total-price">總計: {formatPrice(totalPrice)}</div>
          <button
            type="button"
            className="checkout-btn"
            onClick={onCheckout}
            disabled={items.length === 0 || checkingOut}
          >
            {checkingOut ? '結帳中...' : '結帳'}
          </button>
        </div>
      </aside>
    </>
  );
}

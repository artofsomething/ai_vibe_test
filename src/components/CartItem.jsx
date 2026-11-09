import { formatPrice } from '../utils/formatPrice.js';

export default function CartItem({ item, onDecrement, onIncrement, onRemove }) {
  const { product, quantity } = item;
  return (
    <li className="cart-item">
      <div className="cart-item-image">圖片</div>
      <div className="cart-item-details">
        <div className="cart-item-title">{product.name}</div>
        <div className="cart-item-price">
          {formatPrice(product.price)}
          {quantity > 1 && (
            <span className="cart-item-subtotal"> × {quantity} = {formatPrice(product.price * quantity)}</span>
          )}
        </div>
        <div className="quantity-controls">
          <button type="button" className="quantity-btn" aria-label={`減少 ${product.name} 數量`} onClick={onDecrement}>−</button>
          <span className="quantity-display">{quantity}</span>
          <button type="button" className="quantity-btn" aria-label={`增加 ${product.name} 數量`} onClick={onIncrement}>+</button>
        </div>
      </div>
      <button type="button" className="remove-btn" aria-label={`移除 ${product.name}`} onClick={onRemove}>
        刪除
      </button>
    </li>
  );
}

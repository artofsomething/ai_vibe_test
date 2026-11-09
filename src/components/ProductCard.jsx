import { useState } from 'react';
import { formatPrice } from '../utils/formatPrice.js';
import { highlightParts } from '../utils/search.js';

export default function ProductCard({ product, onAdd, highlight = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article className="product-card">
      <div className="product-image">
        {imgFailed ? (
          <span>圖片</span>
        ) : (
          <img
            src={`/images/${product.image}`}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <h3 className="product-title">
        {highlightParts(product.name, highlight).map((part, i) =>
          part.match ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>
        )}
      </h3>
      <div className="product-price">{formatPrice(product.price)}</div>
      <button type="button" className="add-to-cart-btn" onClick={() => onAdd(product)}>
        加入購物車
      </button>
    </article>
  );
}

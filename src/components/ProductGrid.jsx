import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onAdd, highlight = '' }) {
  return (
    <div className="products-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} highlight={highlight} />
      ))}
    </div>
  );
}

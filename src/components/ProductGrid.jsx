import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onAdd }) {
  return (
    <div className="products-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} />
      ))}
    </div>
  );
}

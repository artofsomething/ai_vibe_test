export default function Header({ onCartClick }) {
  return (
    <header className="header">
      <h1>精品商店</h1>
      <button type="button" className="cart-button" onClick={onCartClick}>
        🛒 購物車
      </button>
    </header>
  );
}

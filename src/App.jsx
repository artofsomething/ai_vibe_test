import { useCallback, useEffect, useState } from 'react';
import { fetchProducts, submitCheckout } from './api/products.js';
import { useCart, MAX_QTY } from './context/CartContext.jsx';
import { useToast } from './context/ToastContext.jsx';
import { formatPrice } from './utils/formatPrice.js';
import Header from './components/Header.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';

export default function App() {
  const { items, totalPrice, totalQuantity, add, remove, removeMany } = useCart();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [cartOpen, setCartOpen] = useState(false);

  // Dialog state:
  //   null
  //   { type: 'remove', item }
  //   { type: 'checkout' } -> { type: 'checkout', busy: true } -> { type: 'checkoutDone' } | { type: 'checkoutFailed' }
  const [dialog, setDialog] = useState(null);
  const toast = useToast();
  const checkingOut = dialog?.type === 'checkout' && dialog.busy;

  const load = useCallback(() => {
    let cancelled = false;
    setStatus('loading');
    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeDialog = () => setDialog(null);

  const handleAdd = (product) => {
    const inCart = items.find((i) => i.product.id === product.id)?.quantity ?? 0;
    if (inCart >= MAX_QTY) {
      toast.show({
        key: `max-${product.id}`,
        type: 'warning',
        title: '已達購買上限',
        message: `「${product.name}」每人最多購買 ${MAX_QTY} 件`,
      });
      return;
    }
    add(product, 1);
    toast.show({
      key: `added-${product.id}`,
      title: '已加入購物車',
      message: `${product.name}（購物車內共 ${inCart + 1} 件）`,
      action: { label: '查看購物車', onClick: () => setCartOpen(true) },
    });
  };

  const requestRemove = (item) => setDialog({ type: 'remove', item });

  const confirmRemove = () => {
    remove(dialog.item.product.id);
    setDialog(null);
  };

  const requestCheckout = () => {
    if (items.length === 0 || checkingOut) return;
    setDialog({ type: 'checkout' });
  };

  const confirmCheckout = async () => {
    if (checkingOut) return;
    // Snapshot what the user agreed to pay for; items added meanwhile are kept.
    const snapshot = items.map((i) => i.product.id);
    setDialog({ type: 'checkout', busy: true });
    try {
      await submitCheckout(items);
      removeMany(snapshot);
      closeCart();
      setDialog({ type: 'checkoutDone' });
    } catch {
      setDialog({ type: 'checkoutFailed' });
    }
  };

  return (
    <div className="container">
      <Header onCartClick={() => setCartOpen((o) => !o)} />

      {status === 'loading' && <div className="loading">載入中...</div>}
      {status === 'error' && (
        <div className="loading">
          商品載入失敗。<button type="button" onClick={load}>重試</button>
        </div>
      )}
      {status === 'ready' && <ProductGrid products={products} onAdd={handleAdd} />}

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        onCheckout={requestCheckout}
        onRequestRemove={requestRemove}
        checkingOut={checkingOut}
      />

      <ConfirmDialog
        open={dialog?.type === 'remove'}
        title="移除商品"
        confirmLabel="移除"
        danger
        onConfirm={confirmRemove}
        onCancel={closeDialog}
      >
        確定要將「{dialog?.item?.product.name}」（數量 {dialog?.item?.quantity}）從購物車移除嗎？
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog?.type === 'checkout'}
        title="確認結帳"
        confirmLabel="確認結帳"
        busy={checkingOut}
        busyLabel="結帳中..."
        onConfirm={confirmCheckout}
        onCancel={closeDialog}
      >
        <p>共 {totalQuantity} 件商品，總計 <strong>{formatPrice(totalPrice)}</strong>。</p>
        <p>確定要結帳嗎？</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog?.type === 'checkoutDone'}
        title="結帳成功"
        confirmLabel="好的"
        cancelLabel={null}
        onConfirm={closeDialog}
      >
        感謝您的購買！
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog?.type === 'checkoutFailed'}
        title="結帳失敗"
        confirmLabel="重試"
        onConfirm={confirmCheckout}
        onCancel={closeDialog}
      >
        結帳時發生錯誤，您的購物車內容已保留。
      </ConfirmDialog>
    </div>
  );
}

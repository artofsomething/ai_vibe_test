const PRODUCTS = [
  { id: 1, name: '無線藍牙耳機', price: 2999, image: 'earphones.jpg' },
  { id: 2, name: '智慧手錶', price: 8999, image: 'smartwatch.jpg' },
  { id: 3, name: '便攜式充電器', price: 1299, image: 'powerbank.jpg' },
  { id: 4, name: '無線滑鼠', price: 899, image: 'mouse.jpg' },
  { id: 5, name: '機械鍵盤', price: 3999, image: 'keyboard.jpg' },
  { id: 6, name: '網路攝影機', price: 2199, image: 'webcam.jpg' },
  { id: 7, name: 'USB隨身碟', price: 599, image: 'usb.jpg' },
  { id: 8, name: '桌面擴音器', price: 1599, image: 'speaker.jpg' },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Keep only well-formed products and drop duplicate ids. */
function sanitize(list) {
  const seen = new Set();
  return list.filter((p) => {
    const key = String(p.id);
    const valid =
      p && p.id != null && typeof p.name === 'string' &&
      Number.isFinite(p.price) && p.price >= 0 && !seen.has(key);
    if (valid) seen.add(key);
    return valid;
  });
}

export async function fetchProducts() {
  await wait(1500);
  return sanitize(PRODUCTS);
}

export async function submitCheckout(items) {
  await wait(2000);
  return { ok: true, count: items.length };
}

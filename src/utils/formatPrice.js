const formatter = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 });

/** Formats a TWD amount like the original page: "NT$ 8,999". */
export function formatPrice(value) {
  return `NT$ ${formatter.format(Number.isFinite(value) ? value : 0)}`;
}

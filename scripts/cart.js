/**
 * Island House — Cart Module
 * Port of src/lib/cart.tsx — plain ES module with localStorage persistence.
 * No React context; uses a simple event-emitter pattern so any block can subscribe.
 *
 * @typedef {Object} CartLine
 * @property {string} productId
 * @property {string} size
 * @property {string} color
 * @property {number} qty
 */

import { products } from './products.js';

const STORAGE_KEY = 'island-house-cart';
const CHANGE_EVENT = 'cart:change';

/** @type {CartLine[]} */
let lines = [];

// ─── Persistence ────────────────────────────────────────────────────────────

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) lines = JSON.parse(raw);
  } catch {
    lines = [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch { /* quota exceeded */ }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: getCart() }));
}

load();

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Add a line to the cart (or increase qty if the same product/size/color exists).
 * @param {CartLine} line
 */
export function addToCart(line) {
  const idx = lines.findIndex(
    (l) => l.productId === line.productId && l.size === line.size && l.color === line.color,
  );
  if (idx >= 0) {
    lines[idx] = { ...lines[idx], qty: lines[idx].qty + line.qty };
  } else {
    lines = [...lines, line];
  }
  persist();
}

/**
 * Remove a line by index.
 * @param {number} index
 */
export function removeFromCart(index) {
  lines = lines.filter((_, i) => i !== index);
  persist();
}

/**
 * Set the quantity of a line by index (minimum 1).
 * @param {number} index
 * @param {number} qty
 */
export function setQty(index, qty) {
  lines = lines.map((l, i) => (i === index ? { ...l, qty: Math.max(1, qty) } : l));
  persist();
}

/**
 * Clear all lines.
 */
export function clearCart() {
  lines = [];
  persist();
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Get the enriched cart state.
 * @returns {{ lines: CartLine[], itemsDetailed: Array<CartLine & {product: import('./products.js').Product}>, count: number, subtotal: number }}
 */
export function getCart() {
  const itemsDetailed = lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId);
      return product ? { ...l, product } : null;
    })
    .filter(Boolean);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = itemsDetailed.reduce((s, l) => s + l.product.price * l.qty, 0);

  return { lines, itemsDetailed, count, subtotal };
}

/**
 * Subscribe to cart changes.
 * @param {(cart: ReturnType<typeof getCart>) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onCartChange(callback) {
  const handler = (/** @type {CustomEvent} */ e) => callback(e.detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

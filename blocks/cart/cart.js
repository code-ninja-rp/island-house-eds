/**
 * Island House — Cart Block
 * Port of src/routes/cart.tsx
 *
 * Renders:
 *  - Empty state: "Nothing here yet" + link
 *  - Line items: image, name, colour/size, qty stepper, price, remove button
 *  - Order summary sidebar: subtotal, shipping, total, Checkout CTA
 *  - AEP hooks: data-aep-event="begin-checkout", data-aep-slot="cart-offer"
 */

import { getCart, removeFromCart, setQty } from '../../scripts/cart.js';
import { onCartChange } from '../../scripts/cart.js';
import { trackBeginCheckout } from '../../scripts/aep.js';

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  function render() {
    const { itemsDetailed, subtotal } = getCart();
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
    const total = subtotal + shipping;

    block.innerHTML = `
      <div class="cart-wrap container-x max-w-site">
        <div class="cart-header">
          <div class="eyebrow cart-eyebrow">Your Bag</div>
          <h1 class="cart-title">${itemsDetailed.length === 0 ? 'Nothing here yet' : 'Almost yours'}</h1>
        </div>

        ${itemsDetailed.length === 0
          ? `<div class="cart-empty">
              <p class="cart-empty-msg">Your bag is as empty as a beach at sunrise.</p>
              <a href="/index.html" class="btn-primary">Start shopping</a>
            </div>`
          : `<div class="cart-layout">
              <!-- Line items -->
              <div class="cart-lines">
                ${itemsDetailed.map((line, i) => `
                  <div class="cart-line" data-aep-product-id="${line.product.id}" data-index="${i}">
                    <a href="/product.html?slug=${line.product.slug}" class="cart-line-img-link">
                      <img src="${line.product.image}" alt="${line.product.name}" class="cart-line-img" loading="lazy" width="96" height="128"/>
                    </a>
                    <div class="cart-line-body">
                      <div class="cart-line-top">
                        <a href="/product.html?slug=${line.product.slug}" class="cart-line-name">${line.product.name}</a>
                        <button type="button" class="cart-remove-btn" data-index="${i}" aria-label="Remove ${line.product.name}">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <div class="cart-line-meta">${line.color} · Size ${line.size}</div>
                      <div class="cart-line-footer">
                        <div class="cart-qty">
                          <button type="button" class="cart-qty-btn cart-qty-dec" data-index="${i}" aria-label="Decrease quantity">−</button>
                          <span class="cart-qty-val">${line.qty}</span>
                          <button type="button" class="cart-qty-btn cart-qty-inc" data-index="${i}" aria-label="Increase quantity">+</button>
                        </div>
                        <div class="cart-line-price">$${line.product.price * line.qty}</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Summary sidebar -->
              <aside class="cart-summary">
                <div class="eyebrow cart-summary-heading">Order Summary</div>
                <div class="cart-summary-rows">
                  <div class="cart-summary-row">
                    <span>Subtotal</span><span>$${subtotal}</span>
                  </div>
                  <div class="cart-summary-row">
                    <span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : `$${shipping}`}</span>
                  </div>
                </div>
                <div class="cart-summary-total">
                  <span>Total</span><span>$${total}</span>
                </div>
                <button
                  type="button"
                  class="cart-checkout-btn btn-primary"
                  data-aep-event="begin-checkout"
                >
                  Checkout
                </button>
                <!-- AEP cart offer slot -->
                <div data-aep-slot="cart-offer" class="cart-offer-slot"></div>
              </aside>
            </div>`
        }
      </div>
    `;

    // Wire up buttons
    block.querySelectorAll('.cart-remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.index)));
    });
    block.querySelectorAll('.cart-qty-dec').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index);
        const { itemsDetailed: items } = getCart();
        setQty(i, items[i].qty - 1);
      });
    });
    block.querySelectorAll('.cart-qty-inc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index);
        const { itemsDetailed: items } = getCart();
        setQty(i, items[i].qty + 1);
      });
    });

    // ── AEP: begin checkout ────────────────────────────────────────────
    const checkoutBtn = block.querySelector('.cart-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const { itemsDetailed, subtotal } = getCart();
        const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
        trackBeginCheckout(itemsDetailed, subtotal + shipping);
      });
    }
  }

  render();
  onCartChange(render);
}

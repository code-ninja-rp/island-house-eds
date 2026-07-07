/**
 * Island House — Product Detail Block (PDP)
 * Port of src/routes/product.$slug.tsx
 *
 * Reads ?slug=... from the URL to find the product.
 * Renders: breadcrumb, image, name, price, description,
 *          colour selector, size selector, Add to Bag button, details list.
 * AEP hooks: data-aep-event="add-to-cart", data-aep-slot="pdp-offer",
 *            data-aep-slot="pdp-recommendations"
 */

import { getProduct, products } from '../../scripts/products.js';
import { addToCart } from '../../scripts/cart.js';
import { trackProductView, trackAddToCart } from '../../scripts/aep.js';

/** Read a single URL search param. */
const getParam = (name) => new URLSearchParams(window.location.search).get(name);

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  const slug = getParam('slug');
  const product = slug ? getProduct(slug) : null;

  if (!product) {
    block.innerHTML = `
      <div class="pdp-not-found container-x max-w-site">
        <h1 class="pdp-not-found-title">Product not found</h1>
        <a href="/" class="btn-primary">Back to shop</a>
      </div>
    `;
    return;
  }

  // Update page <title>
  document.title = `${product.name} — Island House`;

  // ── AEP: product detail view ─────────────────────────────────────────────
  trackProductView(product);

  // Related products (exclude current)
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  block.innerHTML = `
    <div class="pdp-wrap container-x max-w-site">
      <!-- Breadcrumb -->
      <nav class="pdp-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/category.html?category=${product.category}" class="pdp-breadcrumb-cat">${cap(product.category)}</a>
        <span aria-hidden="true">/</span>
        <span>${product.name}</span>
      </nav>

      <!-- Main grid -->
      <div class="pdp-grid" data-aep-product-id="${product.id}">
        <!-- Image -->
        <div class="pdp-image-wrap">
          <img
            src="${product.image}"
            alt="${product.name}"
            class="pdp-image"
            width="1024"
            height="1280"
          />
        </div>

        <!-- Info panel -->
        <div class="pdp-info">
          ${product.isNew ? '<div class="eyebrow pdp-new-badge">Just landed</div>' : ''}

          <h1 class="pdp-name">${product.name}</h1>
          <div class="pdp-price">$${product.price}</div>
          <p class="pdp-description">${product.description}</p>

          <!-- Colour selector -->
          <div class="pdp-option-group" id="pdp-colors">
            <div class="eyebrow pdp-option-label">Color · <span id="pdp-selected-color">${product.colors[0]}</span></div>
            <div class="pdp-option-btns">
              ${product.colors.map((c, i) => `
                <button
                  type="button"
                  class="pdp-color-btn ${i === 0 ? 'selected' : ''}"
                  data-color="${c}"
                  aria-pressed="${i === 0}"
                >
                  ${c}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Size selector -->
          <div class="pdp-option-group" id="pdp-sizes">
            <div class="eyebrow pdp-option-label">Size</div>
            <div class="pdp-option-btns">
              ${product.sizes.map((s, i) => `
                <button
                  type="button"
                  class="pdp-size-btn ${i === 0 ? 'selected' : ''}"
                  data-size="${s}"
                  aria-pressed="${i === 0}"
                >
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Add to Bag -->
          <button
            type="button"
            class="pdp-atb-btn btn-primary"
            id="pdp-atb"
            data-aep-event="add-to-cart"
          >
            Add to bag — $${product.price}
          </button>

          <!-- Details -->
          <div class="pdp-details">
            <div class="eyebrow pdp-details-label">The Details</div>
            <ul class="pdp-details-list">
              ${product.details.map((d) => `<li>· ${d}</li>`).join('')}
            </ul>
          </div>

          <!-- AEP PDP offer slot -->
          <div data-aep-slot="pdp-offer" class="aep-slot"></div>
        </div>
      </div>

      <!-- Related products -->
      <section class="pdp-related">
        <div class="eyebrow pdp-related-eyebrow">You may also love</div>
        <h2 class="pdp-related-heading">Wear it with</h2>
        <div class="pdp-related-grid" data-aep-slot="pdp-recommendations">
          ${related.map((p) => `
            <a href="/product.html?slug=${p.slug}" class="product-card" data-aep-product-id="${p.id}">
              <div class="product-card-media">
                <img src="${p.image}" alt="${p.name}" loading="lazy" class="product-card-img" width="400" height="500"/>
                ${p.isNew ? '<span class="product-card-badge eyebrow">New</span>' : ''}
              </div>
              <div class="product-card-info">
                <div class="product-card-name">${p.name}</div>
                <div class="product-card-price">$${p.price}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </section>
    </div>
  `;

  // State
  let selectedColor = product.colors[0];
  let selectedSize = product.sizes[0];
  let added = false;

  // Colour selection
  block.querySelectorAll('.pdp-color-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.pdp-color-btn').forEach((b) => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedColor = btn.dataset.color;
      block.querySelector('#pdp-selected-color').textContent = selectedColor;
    });
  });

  // Size selection
  block.querySelectorAll('.pdp-size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.pdp-size-btn').forEach((b) => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedSize = btn.dataset.size;
    });
  });

  // Add to bag
  const atbBtn = block.querySelector('#pdp-atb');
  atbBtn.addEventListener('click', () => {
    if (added) return;
    addToCart({ productId: product.id, size: selectedSize, color: selectedColor, qty: 1 });

    // ── AEP: add to cart ───────────────────────────────────────────────────
    trackAddToCart(product, { size: selectedSize, color: selectedColor, qty: 1 });
    atbBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Added to bag
    `;
    added = true;
    setTimeout(() => {
      atbBtn.innerHTML = `Add to bag — $${product.price}`;
      added = false;
    }, 1800);
  });
}

/** @param {string} s */
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

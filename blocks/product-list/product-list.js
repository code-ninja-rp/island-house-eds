/**
 * Island House — Product List Block
 * Port of src/components/product-card.tsx + category/index page grids.
 *
 * Accepts optional data attributes on the block element:
 *   data-category="women|men|accessories"  — filter by category
 *   data-limit="4"                          — limit number shown (default: all)
 *   data-heading="Just landed"              — optional section heading
 *   data-eyebrow="The Editor's Table"       — optional eyebrow
 *
 * Each card: 4:5 image, "New" badge, serif name, price.
 * Includes data-aep-product-id on each card.
 */

import { products, byCategory } from '../../scripts/products.js';

/**
 * Build a single product card element.
 * @param {import('../../scripts/products.js').Product} product
 * @returns {HTMLElement}
 */
function buildCard(product) {
  const card = document.createElement('a');
  card.href = `/product.html?slug=${product.slug}`;
  card.className = 'product-card';
  card.dataset.aepProductId = product.id;
  card.setAttribute('aria-label', product.name);

  card.innerHTML = `
    <div class="product-card-media">
      <img
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
        class="product-card-img"
        width="400"
        height="500"
      />
      ${product.isNew ? '<span class="product-card-badge eyebrow">New</span>' : ''}
    </div>
    <div class="product-card-info">
      <div class="product-card-name">${product.name}</div>
      <div class="product-card-price">$${product.price}</div>
    </div>
  `;

  return card;
}

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  // category: from data attr (set by page) or from ?category= URL param
  const category = block.dataset.category
    || new URLSearchParams(window.location.search).get('category')
    || null;

  const limit = block.dataset.limit ? parseInt(block.dataset.limit, 10) : undefined;
  const heading = block.dataset.heading;
  const eyebrow = block.dataset.eyebrow;
  const viewAllHref = block.dataset.viewAll;

  let items = category ? byCategory(/** @type {any} */(category)) : products;
  if (limit) items = items.slice(0, limit);

  // Optional header row (used on homepage featured section)
  let headerHTML = '';
  if (eyebrow || heading) {
    headerHTML = `
      <div class="product-list-header">
        <div>
          ${eyebrow ? `<div class="eyebrow product-list-eyebrow">${eyebrow}</div>` : ''}
          ${heading ? `<h2 class="product-list-heading">${heading}</h2>` : ''}
        </div>
        ${viewAllHref ? `<a href="${viewAllHref}" class="product-list-view-all">View all →</a>` : ''}
      </div>
    `;
  }

  // Build grid
  const grid = document.createElement('div');
  grid.className = 'product-list-grid';
  items.forEach((p) => grid.append(buildCard(p)));

  // Wrap in container
  const wrap = document.createElement('div');
  wrap.className = 'product-list-inner container-x max-w-site';
  wrap.innerHTML = headerHTML;
  wrap.append(grid);

  block.innerHTML = '';
  block.append(wrap);
}


/**
 * Island House — Product List Block
 * Port of src/components/product-card.tsx + category/index page grids.
 *
 * Supports TWO authoring paths:
 *   1. Static/code pages (category.html): values set as data-* attributes
 *      on the block element before decoration runs (data-category,
 *      data-limit, data-heading, data-eyebrow, data-view-all).
 *   2. Universal Editor (xwalk): field values authored via component-models.json
 *      are written as child row divs in field-definition order — this block
 *      reads and strips those rows the same way Hero does.
 *
 * data-* attributes always win when present, so the static path is untouched.
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
 * Read a UE-authored row's content as trimmed text, or the href of an
 * anchor inside it if one exists (link/reference fields sometimes render
 * as an <a>, plain text fields render as inner text).
 * @param {Element | undefined} row
 * @returns {string | undefined}
 */
function readRowValue(row) {
  if (!row) return undefined;
  const link = row.querySelector('a[href]');
  if (link) return link.getAttribute('href') || undefined;
  const text = row.textContent?.trim();
  return text || undefined;
}

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  // Capture UE-authored row children BEFORE any mutation. Field order here
  // must match the field order in component-models.json's "product-list"
  // model: eyebrow, heading, limit, viewAll. Confirm via view-source if
  // this ever drifts from what's actually authored.
  const rows = [...block.children];

  // category: static data attr, or ?category= URL param (category.html path).
  // Not authored via UE on the homepage — stays null there, which is correct
  // (the homepage "Just landed" section shows the full catalog, unfiltered).
  const category = block.dataset.category
    || new URLSearchParams(window.location.search).get('category')
    || null;

  const eyebrow = block.dataset.eyebrow || readRowValue(rows[0]);
  const heading = block.dataset.heading || readRowValue(rows[1]);

  const rawLimit = block.dataset.limit || readRowValue(rows[2]);
  const limit = rawLimit ? parseInt(rawLimit, 10) : undefined;

  const viewAllHref = block.dataset.viewAll || readRowValue(rows[3]);

  let items = category ? byCategory(/** @type {any} */(category)) : products;
  if (limit && !Number.isNaN(limit)) items = items.slice(0, limit);

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
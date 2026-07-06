/**
 * Island House — Header Block
 * Port of src/components/site-header.tsx
 *
 * Renders:
 *  - Promo bar (ocean bg)
 *  - Logo centred "Island House"
 *  - Left nav: Women / Men / Accessories
 *  - Right nav: Journal / Stores + Search / Account / Cart icons
 *  - Mobile hamburger + slide-down nav
 *  - AEP personalization hook: data-aep-slot="global-banner"
 */

import { getMetadata } from '../../scripts/aem.js';
import { getCart, onCartChange } from '../../scripts/cart.js';

const NAV = [
  { href: '/category.html?category=women',      label: 'Women' },
  { href: '/category.html?category=men',        label: 'Men' },
  { href: '/category.html?category=accessories', label: 'Accessories' },
  { href: '/journal.html',                       label: 'Journal' },
  { href: '/stores.html',                        label: 'Stores' },
];

function buildHeader(block) {
  const { count } = getCart();

  block.innerHTML = `
    <div class="header-promo eyebrow">
      Complimentary shipping on orders over $150 · Island returns within 60 days
    </div>

    <div class="header-inner container-x max-w-site">
      <button class="header-menu-btn" id="header-menu-btn" aria-label="Menu" aria-expanded="false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <nav class="header-nav-left" aria-label="Primary">
        ${NAV.slice(0, 3).map((n) => `<a href="${n.href}" class="header-nav-link">${n.label}</a>`).join('')}
      </nav>

      <a href="/index.html" class="header-logo">Island House</a>

      <div class="header-actions">
        <nav class="header-nav-right" aria-label="Secondary">
          ${NAV.slice(3).map((n) => `<a href="${n.href}" class="header-nav-link">${n.label}</a>`).join('')}
        </nav>

        <button class="header-icon-btn" aria-label="Search" id="header-search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        <button class="header-icon-btn header-account-btn" aria-label="Account">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </button>

        <a href="/cart.html" class="header-icon-btn header-cart-btn" aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span class="header-cart-count ${count > 0 ? '' : 'hidden'}" id="header-cart-count">${count}</span>
        </a>
      </div>
    </div>

    <!-- Mobile nav -->
    <div class="header-mobile-nav hidden" id="header-mobile-nav">
      <nav class="container-x" aria-label="Mobile primary">
        ${NAV.map((n) => `<a href="${n.href}" class="header-mobile-link">${n.label}</a>`).join('')}
      </nav>
    </div>

    <!-- AEP personalization hook -->
    <div id="aep-personalization-banner" data-aep-slot="global-banner"></div>
  `;

  // Mobile hamburger toggle
  const menuBtn = block.querySelector('#header-menu-btn');
  const mobileNav = block.querySelector('#header-mobile-nav');
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('hidden', !mobileNav.classList.contains('hidden'));
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  // Highlight active nav link
  const currentPath = window.location.pathname;
  block.querySelectorAll('.header-nav-link, .header-mobile-link').forEach((a) => {
    if (a.getAttribute('href') === currentPath) a.classList.add('active');
  });

  // Cart count subscription
  const countEl = block.querySelector('#header-cart-count');
  onCartChange(({ count: c }) => {
    countEl.textContent = String(c);
    countEl.classList.toggle('hidden', c === 0);
  });
}

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  buildHeader(block);
}

/**
 * Island House — Delayed script
 * Runs ~3 s after page load (imported by scripts.js loadDelayed()).
 * Ideal for analytics initialisation — page is fully interactive by now.
 */

import { trackPageView } from './aep.js';

// ── Page View ────────────────────────────────────────────────────────────────
// Fires once per page load after Alloy is ready.
trackPageView();

// ── Cart view tracking ───────────────────────────────────────────────────────
// If we're on the cart page, fire the shopping-cart-view event.
// Import is dynamic so it only runs on /cart.html.
if (window.location.pathname.includes('cart')) {
  import('./cart.js').then(({ getCart }) => {
    import('./aep.js').then(({ trackCartView }) => {
      const { itemsDetailed } = getCart();
      trackCartView(itemsDetailed);
    });
  });
}

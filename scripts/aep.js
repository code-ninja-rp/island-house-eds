/**
 * Island House — AEP Data Layer (aep.js)
 *
 * Fires Adobe Experience Platform Web SDK (Alloy) XDM events for every
 * meaningful interaction on the site. The Launch/Tags library in head.html
 * initialises `window.alloy` — this module waits for it and then sends events.
 *
 * Events covered:
 *  - page:view          → pageView (all pages)
 *  - product:view       → productDetailViews (PDP)
 *  - product:click      → productListClicks (product cards)
 *  - product:impression → productListViews (product-list / recommendations)
 *  - cart:add           → purchases / productListAdds (PDP add-to-bag)
 *  - cart:begin-checkout→ checkouts (Cart page checkout btn)
 *  - cart:view          → shopping cart view
 */

// ─── Alloy helper ─────────────────────────────────────────────────────────────

/**
 * Wait for the Alloy Web SDK to be ready then send an event.
 * Alloy is loaded async by the Launch library — poll with backoff.
 * @param {Object} xdm  XDM-structured payload
 * @param {Object} [data] Free-form data object (for data elements)
 */
function sendEvent(xdm, data = {}) {
  const dispatch = () => {
    if (typeof window.alloy === 'function') {
      window.alloy('sendEvent', { xdm, data }).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[AEP] sendEvent failed:', err);
      });
    }
  };

  if (typeof window.alloy === 'function') {
    dispatch();
  } else {
    // Alloy may still be loading — wait up to 5 s
    let tries = 0;
    const iv = setInterval(() => {
      tries += 1;
      if (typeof window.alloy === 'function') {
        clearInterval(iv);
        dispatch();
      } else if (tries > 50) {
        clearInterval(iv);
        // eslint-disable-next-line no-console
        console.warn('[AEP] alloy not available after 5 s — event dropped:', xdm);
      }
    }, 100);
  }
}

// ─── XDM builders ─────────────────────────────────────────────────────────────

/**
 * Build a minimal product item for XDM productListItems.
 * @param {{ id: string, name: string, price: number, category: string, qty?: number }} p
 */
function xdmProduct(p) {
  return {
    SKU: p.id,
    name: p.name,
    priceTotal: p.price * (p.qty || 1),
    quantity: p.qty || 1,
    currencyCode: 'USD',
    productAddMethod: 'regular',
    _experience: {
      analytics: {
        customDimensions: { eVars: { eVar1: p.category || '' } },
      },
    },
  };
}

// ─── Page View ────────────────────────────────────────────────────────────────

/**
 * Fire a page-view event. Called once per page load from delayed.js.
 * Reads meta tags for page name / category.
 */
export function trackPageView() {
  const pageName = document.title.replace(' — Island House', '').trim();
  const path = window.location.pathname;

  sendEvent({
    eventType: 'web.webpagedetails.pageViews',
    web: {
      webPageDetails: {
        name: pageName,
        URL: window.location.href,
        pageViews: { value: 1 },
      },
      webReferrer: { URL: document.referrer },
    },
    _experience: {
      analytics: {
        customDimensions: {
          props: { prop1: path },
        },
      },
    },
  });
}

// ─── Product Detail View ───────────────────────────────────────────────────────

/**
 * Fire productDetailViews. Called from the PDP block after product data is loaded.
 * @param {{ id: string, name: string, price: number, category: string }} product
 */
export function trackProductView(product) {
  sendEvent({
    eventType: 'commerce.productViews',
    commerce: {
      productViews: { value: 1 },
    },
    productListItems: [xdmProduct(product)],
  });
}

// ─── Product List Impression ──────────────────────────────────────────────────

/**
 * Fire productListViews when a product grid becomes visible.
 * @param {Array<{ id: string, name: string, price: number, category: string }>} productList
 * @param {string} listName  e.g. "home-featured", "category-women", "recommendations"
 */
export function trackProductListView(productList, listName) {
  if (!productList.length) return;
  sendEvent({
    eventType: 'commerce.productListViews',
    commerce: {
      productListViews: { value: 1 },
    },
    productListItems: productList.map((p) => ({
      ...xdmProduct(p),
      productListItemsType: listName,
    })),
  });
}

// ─── Product Click ────────────────────────────────────────────────────────────

/**
 * Fire productListClicks when a product card is clicked.
 * @param {{ id: string, name: string, price: number, category: string }} product
 * @param {string} listName  e.g. "home-featured", "category-women"
 */
export function trackProductClick(product, listName) {
  sendEvent({
    eventType: 'commerce.productListClicks',
    commerce: {
      productListClicks: { value: 1 },
    },
    productListItems: [{
      ...xdmProduct(product),
      productListItemsType: listName,
    }],
  });
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────

/**
 * Fire productListAdds when a product is added to the bag.
 * @param {{ id: string, name: string, price: number, category: string }} product
 * @param {{ size: string, color: string, qty: number }} options
 */
export function trackAddToCart(product, options) {
  sendEvent({
    eventType: 'commerce.productListAdds',
    commerce: {
      productListAdds: { value: 1 },
    },
    productListItems: [{
      ...xdmProduct({ ...product, qty: options.qty }),
      selectedOptions: [
        { attribute: 'size', value: options.size },
        { attribute: 'color', value: options.color },
      ],
    }],
  });
}

// ─── Cart View ────────────────────────────────────────────────────────────────

/**
 * Fire shopping cart view event.
 * @param {Array<{ product: {id,name,price,category}, qty: number }>} cartLines
 */
export function trackCartView(cartLines) {
  if (!cartLines.length) return;
  sendEvent({
    eventType: 'commerce.backOfficeCreditMemoItems',
    commerce: {
      order: {
        priceTotal: cartLines.reduce((s, l) => s + l.product.price * l.qty, 0),
        currencyCode: 'USD',
      },
    },
    productListItems: cartLines.map((l) => xdmProduct({ ...l.product, qty: l.qty })),
  });
}

// ─── Begin Checkout ───────────────────────────────────────────────────────────

/**
 * Fire checkouts event when user clicks the Checkout button.
 * @param {Array<{ product: {id,name,price,category}, qty: number }>} cartLines
 * @param {number} total
 */
export function trackBeginCheckout(cartLines, total) {
  sendEvent({
    eventType: 'commerce.checkouts',
    commerce: {
      checkouts: { value: 1 },
      order: {
        priceTotal: total,
        currencyCode: 'USD',
      },
    },
    productListItems: cartLines.map((l) => xdmProduct({ ...l.product, qty: l.qty })),
  });
}

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

// ─── Logger ───────────────────────────────────────────────────────────────────

const AEP_PREFIX = '%c[AEP]';
const AEP_STYLE  = 'color:#eb1000;font-weight:bold;'; // Adobe red

/**
 * Pretty-print every AEP event to the browser console so you can verify
 * what is being sent without opening the Network tab.
 *
 * @param {string} label  Short human-readable event name
 * @param {Object} xdm    The full XDM payload being dispatched
 */
// eslint-disable-next-line no-console
const log = (label, xdm) => console.log(AEP_PREFIX, AEP_STYLE, label, xdm);

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
    category: p.category || '',
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

  const xdm = {
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
  };

  log('📄 pageView', { pageName, path, xdm });
  sendEvent(xdm);
}

// ─── Product Detail View ───────────────────────────────────────────────────────

/**
 * Fire productDetailViews. Called from the PDP block after product data is loaded.
 * @param {{ id: string, name: string, price: number, category: string }} product
 */
export function trackProductView(product) {
  const xdm = {
    eventType: 'commerce.productViews',
    commerce: {
      productViews: { value: 1 },
    },
    productListItems: [xdmProduct(product)],
  };

  log('🛍️  productView', { product, xdm });
  sendEvent(xdm);
}

// ─── Product List Impression ──────────────────────────────────────────────────

/**
 * Fire productListViews when a product grid becomes visible.
 * @param {Array<{ id: string, name: string, price: number, category: string }>} productList
 * @param {string} listName  e.g. "home-featured", "category-women", "recommendations"
 */
export function trackProductListView(productList, listName) {
  if (!productList.length) return;

  const xdm = {
    eventType: 'commerce.productListViews',
    commerce: {
      productListViews: { value: 1 },
    },
    productListItems: productList.map((p) => xdmProduct(p)),
    _experience: {
      analytics: {
        customDimensions: { eVars: { eVar6: listName } },
      },
    },
  };

  log('👁️  productListView', { listName, count: productList.length, products: productList.map((p) => p.name), xdm });
  sendEvent(xdm);
}

// ─── Product Click ────────────────────────────────────────────────────────────

/**
 * Fire productListClicks when a product card is clicked.
 * @param {{ id: string, name: string, price: number, category: string }} product
 * @param {string} listName  e.g. "home-featured", "category-women"
 */
export function trackProductClick(product, listName) {
  const xdm = {
    eventType: 'commerce.productListClicks',
    commerce: {
      productListClicks: { value: 1 },
    },
    productListItems: [xdmProduct(product)],
    _experience: {
      analytics: {
        customDimensions: { eVars: { eVar6: listName } },
      },
    },
  };

  log('🖱️  productClick', { product: product.name, listName, xdm });
  sendEvent(xdm);
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────

/**
 * Fire productListAdds when a product is added to the bag.
 * @param {{ id: string, name: string, price: number, category: string }} product
 * @param {{ size: string, color: string, qty: number }} options
 */
export function trackAddToCart(product, options) {
  const xdm = {
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
  };

  log('🛒 addToCart', { product: product.name, ...options, xdm });
  sendEvent(xdm);
}

// ─── Cart View ────────────────────────────────────────────────────────────────

/**
 * Fire shopping cart view event.
 * @param {Array<{ product: {id,name,price,category}, qty: number }>} cartLines
 */
export function trackCartView(cartLines) {
  if (!cartLines.length) return;

  const total = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const xdm = {
    eventType: 'commerce.productListOpens',
    commerce: {
      productListOpens: { value: 1 },
      cart: { priceTotal: total, currencyCode: 'USD' },
    },
    productListItems: cartLines.map((l) => xdmProduct({ ...l.product, qty: l.qty })),
  };

  log('🛍️  cartView', { lines: cartLines.length, total, items: cartLines.map((l) => l.product.name), xdm });
  sendEvent(xdm);
}

// ─── Begin Checkout ───────────────────────────────────────────────────────────

/**
 * Fire checkouts event when user clicks the Checkout button.
 * @param {Array<{ product: {id,name,price,category}, qty: number }>} cartLines
 * @param {number} total
 */
export function trackBeginCheckout(cartLines, total) {
  const xdm = {
    eventType: 'commerce.checkouts',
    commerce: {
      checkouts: { value: 1 },
      order: {
        priceTotal: total,
        currencyCode: 'USD',
      },
    },
    productListItems: cartLines.map((l) => xdmProduct({ ...l.product, qty: l.qty })),
  };

  log('💳 beginCheckout', { lines: cartLines.length, total, items: cartLines.map((l) => l.product.name), xdm });
  sendEvent(xdm);
}

// ─── Auth Events ──────────────────────────────────────────────────────────────

/**
 * Fire when the login form is submitted with valid inputs.
 * @param {string} email
 */
export function trackLoginAttempt(email) {
  const xdm = {
    eventType: 'web.formFilledOut',
    web: {
      webInteraction: {
        name: 'login-attempt',
        type: 'other',
        linkClicks: { value: 1 },
      },
    },
    _experience: {
      analytics: {
        customDimensions: { eVars: { eVar2: email } },
      },
    },
  };

  log('🔑 loginAttempt', { email, xdm });
  sendEvent(xdm);
}

/**
 * Fire on successful login. Sends authenticated identity to AEP.
 * @param {{ name: string, email: string }} user
 */
export function trackLoginSuccess(user) {
  const xdm = {
    eventType: 'web.formFilledOut',
    web: {
      webInteraction: {
        name: 'login-success',
        type: 'other',
        linkClicks: { value: 1 },
      },
    },
    identityMap: {
      Email: [{ id: user.email, primary: true, authenticatedState: 'authenticated' }],
    },
    _experience: {
      analytics: {
        customDimensions: { eVars: { eVar2: user.email, eVar3: user.name } },
      },
    },
  };

  log('✅ loginSuccess', { user, xdm });
  sendEvent(xdm);
}

// ─── Checkout Step ────────────────────────────────────────────────────────────

/**
 * Fire when the user advances to a checkout step.
 * @param {number} step   1 = Shipping, 2 = Payment, 3 = Review
 * @param {string} [method]  Payment method for step 2+: 'card' | 'paypal'
 */
export function trackCheckoutStep(step, method) {
  const xdm = {
    eventType: 'commerce.checkouts',
    commerce: {
      checkouts: { value: 1 },
    },
    _experience: {
      analytics: {
        customDimensions: {
          eVars: { eVar4: String(step), eVar5: method || '' },
        },
      },
    },
  };
  log(`🛒 checkoutStep${step}`, { step, method, xdm });
  sendEvent(xdm);
}

// ─── Order Complete ───────────────────────────────────────────────────────────

/**
 * Fire on successful order placement.
 * @param {{ orderNumber: string, items: Array, total: number }} order
 */
export function trackOrderComplete(order) {
  const xdm = {
    eventType: 'commerce.purchases',
    commerce: {
      purchases: { value: 1 },
      order: {
        priceTotal: order.total,
        currencyCode: 'USD',
        payments: [{ transactionID: order.orderNumber, paymentAmount: order.total, currencyCode: 'USD', paymentType: 'other' }],
      },
    },
    productListItems: order.items.map((l) => xdmProduct({ ...l.product, qty: l.qty })),
  };
  log('🎉 orderComplete', { orderNumber: order.orderNumber, total: order.total, xdm });
  sendEvent(xdm);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Fire when the user clicks Log out.
 * @param {{ name: string, email: string }} user
 */
export function trackLogout(user) {
  const xdm = {
    eventType: 'web.webinteraction.linkClicks',
    web: {
      webInteraction: {
        name: 'logout',
        type: 'other',
        linkClicks: { value: 1 },
      },
    },
    identityMap: {
      Email: [{ id: user.email, primary: true, authenticatedState: 'loggedOut' }],
    },
  };

  log('👋 logout', { user, xdm });
  sendEvent(xdm);
}

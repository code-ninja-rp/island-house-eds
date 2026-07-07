/**
 * Island House — Checkout Block
 *
 * Three-step checkout:
 *   1. Contact & Shipping   (auto-filled with demo data)
 *   2. Payment              (Credit Card auto-filled | PayPal mock overlay)
 *   3. Review & Place Order
 *
 * On "Place Order": saves order to sessionStorage, clears cart,
 * fires AEP trackOrderComplete, then redirects to /order-confirmation.html.
 */

import { getCart, clearCart } from '../../scripts/cart.js';
import { getUser } from '../../scripts/auth.js';
import { trackCheckoutStep, trackOrderComplete } from '../../scripts/aep.js';

// ─── Demo data ────────────────────────────────────────────────────────────────
function demoData() {
  const user = getUser();
  return {
    name:        user?.name  || 'Alex Rivera',
    email:       user?.email || 'alex.rivera@example.com',
    phone:       '+1 (305) 555-0147',
    addr1:       '2847 Ocean Drive',
    addr2:       'Unit 14',
    city:        'Miami Beach',
    state:       'FL',
    zip:         '33139',
    country:     'United States',
    cardNum:     '4242 4242 4242 4242',
    cardExp:     '12/26',
    cardCvv:     '123',
    cardName:    user?.name  || 'Alex Rivera',
    paypalEmail: user?.email || 'alex.rivera@example.com',
  };
}

// ─── Order helpers ────────────────────────────────────────────────────────────
function orderNumber() {
  return `IH-${Math.floor(100000 + Math.random() * 900000)}`;
}

function estDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ─── Module state ─────────────────────────────────────────────────────────────
let currentStep = 1;
let shippingData = {};
let paymentData  = { method: 'card' };

// ─── Step progress bar HTML ───────────────────────────────────────────────────
function stepsBarHTML() {
  const steps = ['Shipping', 'Payment', 'Review'];
  return `
    <ol class="co-steps-bar">
      ${steps.map((label, i) => {
        const n = i + 1;
        return `
          <li class="co-step-item ${n === currentStep ? 'is-active' : ''} ${n < currentStep ? 'is-done' : ''}">
            <span class="co-step-num">${n < currentStep ? '✓' : n}</span>
            <span class="co-step-label">${label}</span>
          </li>
          ${n < steps.length ? '<li class="co-step-sep" aria-hidden="true"></li>' : ''}
        `;
      }).join('')}
    </ol>`;
}

// ─── Sidebar HTML ─────────────────────────────────────────────────────────────
function sidebarHTML() {
  const { itemsDetailed, subtotal } = getCart();
  const shipping = subtotal > 150 ? 0 : 12;
  const total    = subtotal + shipping;

  return `
    <div class="eyebrow co-sidebar-eyebrow">Your Bag</div>
    <ul class="co-sidebar-items">
      ${itemsDetailed.map((l) => `
        <li class="co-sidebar-item">
          <div class="co-sidebar-img-wrap">
            <img src="${l.product.image}" alt="${l.product.name}" class="co-sidebar-img" width="64" height="85" loading="lazy"/>
            <span class="co-sidebar-qty">${l.qty}</span>
          </div>
          <div class="co-sidebar-item-body">
            <p class="co-sidebar-item-name">${l.product.name}</p>
            <p class="co-sidebar-item-meta">${l.color} · Size ${l.size}</p>
          </div>
          <p class="co-sidebar-item-price">$${l.product.price * l.qty}</p>
        </li>
      `).join('')}
    </ul>
    <div class="co-sidebar-totals">
      <div class="co-sidebar-row"><span>Subtotal</span><span>$${subtotal}</span></div>
      <div class="co-sidebar-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : `$${shipping}`}</span></div>
      <div class="co-sidebar-total"><span>Total</span><span>$${total}</span></div>
    </div>`;
}

// ─── Step 1: Shipping ─────────────────────────────────────────────────────────
function step1HTML() {
  return `
    <div class="co-panel" id="co-panel-1">
      <h2 class="co-panel-title">Contact & Shipping</h2>

      <fieldset class="co-fieldset">
        <legend class="co-legend">Contact</legend>
        <div class="co-grid">
          <div class="co-field co-field-full">
            <label class="co-label" for="co-name">Full Name</label>
            <input class="co-input" type="text" id="co-name" autocomplete="name" placeholder="Alex Rivera"/>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-email">Email</label>
            <input class="co-input" type="email" id="co-email" autocomplete="email" placeholder="you@example.com"/>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-phone">Phone</label>
            <input class="co-input" type="tel" id="co-phone" autocomplete="tel" placeholder="+1 (305) 555-0147"/>
          </div>
        </div>
      </fieldset>

      <fieldset class="co-fieldset">
        <legend class="co-legend">Shipping Address</legend>
        <div class="co-grid">
          <div class="co-field co-field-full">
            <label class="co-label" for="co-addr1">Street Address</label>
            <input class="co-input" type="text" id="co-addr1" autocomplete="address-line1" placeholder="2847 Ocean Drive"/>
          </div>
          <div class="co-field co-field-full">
            <label class="co-label" for="co-addr2">Apt / Suite <span class="co-opt">(optional)</span></label>
            <input class="co-input" type="text" id="co-addr2" autocomplete="address-line2" placeholder="Unit 14"/>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-city">City</label>
            <input class="co-input" type="text" id="co-city" autocomplete="address-level2" placeholder="Miami Beach"/>
          </div>
          <div class="co-field co-field-sm">
            <label class="co-label" for="co-state">State</label>
            <input class="co-input" type="text" id="co-state" autocomplete="address-level1" placeholder="FL" maxlength="2"/>
          </div>
          <div class="co-field co-field-sm">
            <label class="co-label" for="co-zip">ZIP</label>
            <input class="co-input" type="text" id="co-zip" autocomplete="postal-code" placeholder="33139" maxlength="10"/>
          </div>
          <div class="co-field co-field-full">
            <label class="co-label" for="co-country">Country</label>
            <select class="co-input co-select" id="co-country" autocomplete="country-name">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>France</option>
              <option>Germany</option>
            </select>
          </div>
        </div>
      </fieldset>

      <p class="co-error hidden" id="co-error-1" role="alert"></p>
      <div class="co-actions">
        <button class="btn-primary co-continue-btn" id="co-to-2">Continue to Payment</button>
      </div>
    </div>`;
}

// ─── Step 2: Payment ──────────────────────────────────────────────────────────
function step2HTML(d) {
  return `
    <div class="co-panel hidden" id="co-panel-2">
      <h2 class="co-panel-title">Payment</h2>

      <div class="co-pay-tabs" role="tablist" aria-label="Payment method">
        <button class="co-pay-tab is-active" role="tab" aria-selected="true"  id="co-tab-card"   data-method="card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Card
        </button>
        <button class="co-pay-tab" role="tab" aria-selected="false" id="co-tab-paypal" data-method="paypal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.077 11.717c-.066.43.252.8.694.8h1.52c.367 0 .68-.268.736-.63l.81-5.13c.055-.362.368-.63.736-.63h2.37c2.42 0 4.16 1.57 3.89 4.12-.29 2.7-2.33 4.04-4.73 4.04H11.6l-.71 4.5a.743.743 0 01-.735.63H8.637a.694.694 0 01-.694-.8l1.134-7.9z"/></svg>
          PayPal
        </button>
      </div>

      <!-- Credit / Debit Card panel -->
      <div class="co-pay-panel" id="co-pay-card">
        <div class="co-card-vis">
          <div class="co-card-vis-chip"></div>
          <div class="co-card-vis-number">•••• •••• •••• <span id="co-vis-last4">4242</span></div>
          <div class="co-card-vis-foot">
            <span id="co-vis-name">${d.cardName}</span>
            <span id="co-vis-exp">${d.cardExp}</span>
          </div>
          <div class="co-card-vis-brand">VISA</div>
        </div>
        <div class="co-grid">
          <div class="co-field co-field-full">
            <label class="co-label" for="co-card-num">Card Number</label>
            <input class="co-input" type="text" id="co-card-num" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="19"/>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-card-exp">Expiry (MM/YY)</label>
            <input class="co-input" type="text" id="co-card-exp" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5"/>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-card-cvv">CVV</label>
            <input class="co-input" type="text" id="co-card-cvv" autocomplete="cc-csc" placeholder="123" maxlength="4"/>
          </div>
          <div class="co-field co-field-full">
            <label class="co-label" for="co-card-name">Name on Card</label>
            <input class="co-input" type="text" id="co-card-name" autocomplete="cc-name" placeholder="Alex Rivera"/>
          </div>
        </div>
      </div>

      <!-- PayPal panel -->
      <div class="co-pay-panel hidden" id="co-pay-paypal">
        <div class="co-paypal-info-box">
          <p class="co-paypal-blurb">
            You'll be redirected to PayPal to securely complete your purchase.<br/>
            Your PayPal account: <strong>${d.paypalEmail}</strong>
          </p>
          <button type="button" class="co-paypal-cta" id="co-paypal-btn">
            Pay with
            <span class="co-pp-logo"><em>Pay</em><strong>Pal</strong></span>
          </button>
        </div>
      </div>

      <p class="co-error hidden" id="co-error-2" role="alert"></p>
      <div class="co-actions">
        <button type="button" class="co-back-btn" id="co-back-1">← Back</button>
        <button type="button" class="btn-primary co-continue-btn" id="co-to-3">Review Order</button>
      </div>
    </div>`;
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────
function step3HTML() {
  const { itemsDetailed, subtotal } = getCart();
  const shipping = subtotal > 150 ? 0 : 12;
  const total    = subtotal + shipping;

  const addrLine = [
    shippingData.addr1,
    shippingData.addr2,
    `${shippingData.city}, ${shippingData.state} ${shippingData.zip}`,
    shippingData.country,
  ].filter(Boolean).join('\n');

  const payLabel = paymentData.method === 'paypal'
    ? `PayPal · ${paymentData.paypalEmail || ''}`
    : `Visa •••• ${(paymentData.cardNum || '').replace(/\s/g, '').slice(-4)} · ${paymentData.cardExp || ''}`;

  return `
    <div class="co-panel hidden" id="co-panel-3">
      <h2 class="co-panel-title">Review Your Order</h2>

      <div class="co-review-card">
        <div class="co-review-row">
          <div class="co-review-label">Ships to</div>
          <div class="co-review-value">
            <strong>${shippingData.name}</strong><br/>
            <span class="co-review-addr">${addrLine.replace(/\n/g, '<br/>')}</span>
          </div>
          <button type="button" class="co-edit-btn" id="co-edit-ship">Edit</button>
        </div>
        <div class="co-review-row">
          <div class="co-review-label">Payment</div>
          <div class="co-review-value">${payLabel}</div>
          <button type="button" class="co-edit-btn" id="co-edit-pay">Edit</button>
        </div>
        <div class="co-review-row co-review-row-last">
          <div class="co-review-label">Delivers</div>
          <div class="co-review-value">Est. ${estDelivery()} · Standard ground</div>
          <span></span>
        </div>
      </div>

      <ul class="co-review-items">
        ${itemsDetailed.map((l) => `
          <li class="co-review-item">
            <img src="${l.product.image}" alt="${l.product.name}" class="co-review-img" width="56" height="72"/>
            <div class="co-review-item-body">
              <p class="co-review-item-name">${l.product.name}</p>
              <p class="co-review-item-meta">${l.color} · Size ${l.size} · Qty ${l.qty}</p>
            </div>
            <p class="co-review-item-price">$${l.product.price * l.qty}</p>
          </li>
        `).join('')}
      </ul>

      <div class="co-review-totals">
        <div class="co-review-total-row"><span>Subtotal</span><span>$${subtotal}</span></div>
        <div class="co-review-total-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : `$${shipping}`}</span></div>
        <div class="co-review-total-row co-review-grand"><span>Total</span><span>$${total}</span></div>
      </div>

      <div class="co-actions">
        <button type="button" class="co-back-btn" id="co-back-2">← Back</button>
        <button type="button" class="btn-primary co-place-btn" id="co-place-order">Place Order</button>
      </div>
    </div>`;
}

// ─── PayPal overlay (appended to body) ───────────────────────────────────────
function ensurePaypalOverlay(paypalEmail) {
  let overlay = document.getElementById('co-paypal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'co-paypal-overlay';
    overlay.className = 'co-paypal-overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'PayPal payment');
    overlay.innerHTML = `
      <div class="co-paypal-modal">
        <div class="co-paypal-modal-hd">
          <span class="co-pp-logo co-pp-logo-lg"><em>Pay</em><strong>Pal</strong></span>
        </div>
        <div class="co-paypal-modal-bd">
          <p class="co-pp-signing">Signing in as</p>
          <p class="co-pp-email" id="co-pp-email-display">${paypalEmail}</p>
          <div class="co-pp-status" id="co-pp-status">
            <div class="co-pp-spinner"></div>
            <span class="co-pp-status-text">Authorising payment…</span>
          </div>
          <div class="co-pp-approved hidden" id="co-pp-approved">
            <span class="co-pp-check">✓</span>
            <span>Payment approved</span>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }
  return overlay;
}

// ─── Main init ────────────────────────────────────────────────────────────────
export default function init(block) {
  const { itemsDetailed } = getCart();
  if (itemsDetailed.length === 0) {
    window.location.replace('/cart.html');
    return;
  }

  const d = demoData();

  // ── Build skeleton ──────────────────────────────────────────────────────────
  block.innerHTML = `
    <div class="co-wrap container-x max-w-site">

      <div class="co-header">
        <h1 class="co-title">Checkout</h1>
        ${stepsBarHTML()}
      </div>

      <div class="co-demo-notice">
        Demo details auto-filled — feel free to edit any field.
      </div>

      <div class="co-layout">
        <div class="co-main" id="co-main">
          ${step1HTML()}
          ${step2HTML(d)}
          <!-- Step 3 injected when reached -->
        </div>
        <aside class="co-sidebar" id="co-sidebar">
          ${sidebarHTML()}
        </aside>
      </div>

    </div>`;

  // ── Auto-fill Step 1 ────────────────────────────────────────────────────────
  const fill = (idValPairs) => idValPairs.forEach(([id, val]) => {
    const el = block.querySelector(`#${id}`);
    if (el) el.value = val;
  });

  fill([
    ['co-name',    d.name],
    ['co-email',   d.email],
    ['co-phone',   d.phone],
    ['co-addr1',   d.addr1],
    ['co-addr2',   d.addr2],
    ['co-city',    d.city],
    ['co-state',   d.state],
    ['co-zip',     d.zip],
    ['co-country', d.country],
  ]);

  // ── Auto-fill Step 2 ────────────────────────────────────────────────────────
  fill([
    ['co-card-num',  d.cardNum],
    ['co-card-exp',  d.cardExp],
    ['co-card-cvv',  d.cardCvv],
    ['co-card-name', d.cardName],
  ]);

  // ── Live card preview ────────────────────────────────────────────────────────
  function syncCardPreview() {
    const numEl  = block.querySelector('#co-card-num');
    const expEl  = block.querySelector('#co-card-exp');
    const nameEl = block.querySelector('#co-card-name');
    if (!numEl) return;
    const digits = (numEl.value || '').replace(/\s/g, '');
    const last4  = digits.slice(-4) || '····';
    const vis4   = block.querySelector('#co-vis-last4');
    const visExp = block.querySelector('#co-vis-exp');
    const visNm  = block.querySelector('#co-vis-name');
    if (vis4)   vis4.textContent   = last4;
    if (visExp) visExp.textContent = expEl?.value || '';
    if (visNm)  visNm.textContent  = nameEl?.value || '';
  }

  ['co-card-num', 'co-card-exp', 'co-card-name'].forEach((id) => {
    const el = block.querySelector(`#${id}`);
    if (el) el.addEventListener('input', syncCardPreview);
  });
  syncCardPreview();

  // ── Step navigation helpers ─────────────────────────────────────────────────
  function showPanel(n) {
    currentStep = n;
    // Rebuild the steps bar with updated state
    const stepsEl = block.querySelector('.co-steps-bar');
    if (stepsEl) stepsEl.outerHTML = stepsBarHTML();

    block.querySelectorAll('.co-panel').forEach((p) => p.classList.add('hidden'));
    const panel = block.querySelector(`#co-panel-${n}`);
    if (panel) {
      panel.classList.remove('hidden');
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function showError(id, msg) {
    const el = block.querySelector(`#${id}`);
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }
  function clearError(id) {
    const el = block.querySelector(`#${id}`);
    if (el) el.classList.add('hidden');
  }

  function readVal(id) { return (block.querySelector(`#${id}`)?.value || '').trim(); }

  // ── Step 1 → 2 ─────────────────────────────────────────────────────────────
  block.querySelector('#co-to-2').addEventListener('click', () => {
    clearError('co-error-1');
    const name   = readVal('co-name');
    const email  = readVal('co-email');
    const phone  = readVal('co-phone');
    const addr1  = readVal('co-addr1');
    const city   = readVal('co-city');
    const state  = readVal('co-state');
    const zip    = readVal('co-zip');

    if (!name)  { showError('co-error-1', 'Please enter your full name.');   return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(readVal('co-email'))) {
      showError('co-error-1', 'Please enter a valid email address.'); return;
    }
    if (!phone) { showError('co-error-1', 'Please enter a phone number.');  return; }
    if (!addr1) { showError('co-error-1', 'Please enter your street address.'); return; }
    if (!city)  { showError('co-error-1', 'Please enter your city.'); return; }
    if (!state) { showError('co-error-1', 'Please enter your state.'); return; }
    if (!zip)   { showError('co-error-1', 'Please enter your ZIP code.'); return; }

    shippingData = {
      name, email, phone,
      addr1, addr2: readVal('co-addr2'),
      city, state, zip,
      country: readVal('co-country') || 'United States',
    };

    trackCheckoutStep(2);
    showPanel(2);
    // Rebuild card preview after panel becomes visible
    syncCardPreview();
  });

  // ── Payment tabs ────────────────────────────────────────────────────────────
  block.querySelectorAll('.co-pay-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      block.querySelectorAll('.co-pay-tab').forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const method = tab.dataset.method;
      paymentData.method = method;
      block.querySelectorAll('.co-pay-panel').forEach((p) => p.classList.add('hidden'));
      block.querySelector(`#co-pay-${method}`)?.classList.remove('hidden');
    });
  });

  // ── PayPal mock flow ────────────────────────────────────────────────────────
  block.querySelector('#co-paypal-btn').addEventListener('click', () => {
    const overlay = ensurePaypalOverlay(d.paypalEmail);
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // After 1.5 s: show "approved"
    setTimeout(() => {
      block.querySelector && overlay.querySelector('#co-pp-status')?.classList.add('hidden');
      overlay.querySelector('#co-pp-approved')?.classList.remove('hidden');
    }, 1500);

    // After 2.5 s: close overlay, advance to step 3
    setTimeout(() => {
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      paymentData = { method: 'paypal', paypalEmail: d.paypalEmail };
      finishStep2();
    }, 2500);
  });

  // ── Step 2 → 3 ─────────────────────────────────────────────────────────────
  function finishStep2() {
    // Build step 3 panel if not yet in DOM
    if (!block.querySelector('#co-panel-3')) {
      block.querySelector('#co-main').insertAdjacentHTML('beforeend', step3HTML());
      wireStep3();
    } else {
      // Refresh the review content
      block.querySelector('#co-panel-3').outerHTML = step3HTML().trim().replace(/^<div/, '<div');
      wireStep3();
    }
    trackCheckoutStep(3, paymentData.method);
    showPanel(3);
  }

  block.querySelector('#co-to-3').addEventListener('click', () => {
    clearError('co-error-2');
    if (paymentData.method === 'card') {
      const num  = readVal('co-card-num').replace(/\s/g, '');
      const exp  = readVal('co-card-exp');
      const cvv  = readVal('co-card-cvv');
      const name = readVal('co-card-name');
      if (num.length < 15)  { showError('co-error-2', 'Please enter a valid card number.'); return; }
      if (!/^\d{2}\/\d{2}$/.test(exp)) { showError('co-error-2', 'Please enter expiry as MM/YY.'); return; }
      if (cvv.length < 3)   { showError('co-error-2', 'Please enter your CVV.'); return; }
      if (!name)             { showError('co-error-2', 'Please enter the name on your card.'); return; }
      paymentData = {
        method: 'card',
        cardNum:  readVal('co-card-num'),
        cardExp:  exp,
        cardName: name,
      };
    }
    finishStep2();
  });

  // ── Back buttons ────────────────────────────────────────────────────────────
  block.addEventListener('click', (e) => {
    if (e.target.closest('#co-back-1')) {
      trackCheckoutStep(1);
      showPanel(1);
    }
    if (e.target.closest('#co-back-2')) {
      trackCheckoutStep(2);
      showPanel(2);
    }
    if (e.target.closest('#co-edit-ship')) {
      trackCheckoutStep(1);
      showPanel(1);
    }
    if (e.target.closest('#co-edit-pay')) {
      trackCheckoutStep(2);
      showPanel(2);
    }
  });

  // ── Step 3 event wiring ─────────────────────────────────────────────────────
  function wireStep3() {
    const placeBtn = block.querySelector('#co-place-order');
    if (!placeBtn) return;
    placeBtn.addEventListener('click', () => {
      placeBtn.disabled    = true;
      placeBtn.textContent = 'Placing order…';

      const { itemsDetailed: items, subtotal } = getCart();
      const shippingCost = subtotal > 150 ? 0 : 12;
      const total        = subtotal + shippingCost;
      const num          = orderNumber();

      const order = {
        orderNumber:    num,
        items,
        subtotal,
        shipping:       shippingCost,
        total,
        shippingData,
        paymentData,
        placedAt:       new Date().toISOString(),
        estDelivery:    estDelivery(),
      };

      trackOrderComplete(order);
      sessionStorage.setItem('ih_last_order', JSON.stringify(order));
      clearCart();

      setTimeout(() => {
        window.location.replace('/order-confirmation.html');
      }, 600);
    });
  }
}

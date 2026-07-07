/**
 * Island House — Order Confirmation Block
 *
 * Reads the completed order from sessionStorage (key: ih_last_order).
 * If no order is found the visitor is sent home.
 * Clears the stored order after rendering so refreshes don't replay it.
 */

export default function init(block) {
  const raw = sessionStorage.getItem('ih_last_order');
  if (!raw) {
    window.location.replace('/index.html');
    return;
  }

  let order;
  try {
    order = JSON.parse(raw);
  } catch {
    window.location.replace('/index.html');
    return;
  }

  sessionStorage.removeItem('ih_last_order');

  const { orderNumber, items, subtotal, shipping, total, shippingData, paymentData, estDelivery } = order;

  const payLabel = paymentData?.method === 'paypal'
    ? `PayPal · ${paymentData.paypalEmail || ''}`
    : `Visa •••• ${(paymentData?.cardNum || '').replace(/\s/g, '').slice(-4)}`;

  const addrLine = [
    shippingData?.addr1,
    shippingData?.addr2,
    `${shippingData?.city || ''}, ${shippingData?.state || ''} ${shippingData?.zip || ''}`,
    shippingData?.country,
  ].filter(Boolean).join('<br/>');

  block.innerHTML = `
    <div class="oc-wrap container-x max-w-site">

      <!-- Success header -->
      <div class="oc-hero">
        <div class="oc-checkmark" aria-hidden="true">✓</div>
        <p class="eyebrow oc-eyebrow">Order Confirmed</p>
        <h1 class="oc-title">Your island wear is on its way.</h1>
        <p class="oc-order-num">Order <strong>${orderNumber}</strong></p>
      </div>

      <!-- Confirmation card -->
      <div class="oc-card">

        <!-- Delivery & payment recap -->
        <div class="oc-meta-grid">
          <div class="oc-meta-block">
            <p class="oc-meta-label">Ships to</p>
            <p class="oc-meta-value"><strong>${shippingData?.name || ''}</strong><br/>${addrLine}</p>
          </div>
          <div class="oc-meta-block">
            <p class="oc-meta-label">Paid with</p>
            <p class="oc-meta-value">${payLabel}</p>
          </div>
          <div class="oc-meta-block">
            <p class="oc-meta-label">Est. delivery</p>
            <p class="oc-meta-value">${estDelivery || '3–5 business days'}</p>
          </div>
        </div>

        <!-- Items -->
        <div class="oc-items-heading eyebrow">Items Ordered</div>
        <ul class="oc-items">
          ${(items || []).map((l) => `
            <li class="oc-item">
              <img
                src="${l.product?.image || ''}"
                alt="${l.product?.name || ''}"
                class="oc-item-img"
                width="72" height="96"
                loading="lazy"
              />
              <div class="oc-item-body">
                <p class="oc-item-name">${l.product?.name || ''}</p>
                <p class="oc-item-meta">${l.color} · Size ${l.size} · Qty ${l.qty}</p>
              </div>
              <p class="oc-item-price">$${(l.product?.price || 0) * l.qty}</p>
            </li>
          `).join('')}
        </ul>

        <!-- Totals -->
        <div class="oc-totals">
          <div class="oc-total-row"><span>Subtotal</span><span>$${subtotal}</span></div>
          <div class="oc-total-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : `$${shipping}`}</span></div>
          <div class="oc-total-row oc-grand"><span>Total</span><span>$${total}</span></div>
        </div>

      </div>

      <!-- CTA -->
      <div class="oc-actions">
        <a href="/index.html" class="btn-primary oc-cta">Continue Shopping</a>
      </div>

    </div>`;
}

/**
 * Island House — Footer Block
 * Port of src/components/site-footer.tsx
 *
 * Four-column grid:
 *  Col 1: Brand / tagline
 *  Col 2: Shop links
 *  Col 3: Care links
 *  Col 4: Newsletter signup
 */

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  block.innerHTML = `
    <div class="footer-inner container-x max-w-site">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">Island House</div>
          <p class="footer-tagline">
            Resort wear made for the long way home. Cut in linen, silk, and easy cotton since a Tuesday in 2014.
          </p>
        </div>

        <!-- Shop -->
        <div class="footer-col">
          <div class="eyebrow footer-col-heading">Shop</div>
          <ul class="footer-links">
            <li><a href="/category.html?category=women">Women</a></li>
            <li><a href="/category.html?category=men">Men</a></li>
            <li><a href="/category.html?category=accessories">Accessories</a></li>
            <li><a href="/category.html?category=accessories">The Home</a></li>
            <li><a href="/category.html?category=women">New Arrivals</a></li>
          </ul>
        </div>

        <!-- Care -->
        <div class="footer-col">
          <div class="eyebrow footer-col-heading">Care</div>
          <ul class="footer-links">
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Size guide</a></li>
            <li><a href="#">Gift cards</a></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div class="footer-col">
          <div class="eyebrow footer-col-heading">Stay in the shade</div>
          <p class="footer-newsletter-desc">
            Subscribe for early access to drops and one very quiet newsletter a month.
          </p>
          <form class="footer-form" id="footer-newsletter-form" novalidate>
            <input
              type="email"
              id="footer-email"
              name="email"
              placeholder="your@email.com"
              class="footer-email-input"
              autocomplete="email"
              required
            />
            <button type="submit" class="footer-join-btn">Join</button>
          </form>
        </div>
      </div>

      <div class="footer-copy">
        &copy; <span id="footer-year"></span> Island House Trading Co. · A demonstration storefront
      </div>
    </div>
  `;

  // Dynamic year
  block.querySelector('#footer-year').textContent = new Date().getFullYear();

  // Newsletter form (no-op)
  block.querySelector('#footer-newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = block.querySelector('#footer-email');
    if (email.value) {
      email.value = '';
      email.placeholder = 'Thanks — see you soon!';
    }
  });
}

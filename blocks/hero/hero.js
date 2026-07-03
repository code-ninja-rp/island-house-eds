/**
 * Island House — Hero Block
 * Port of the hero section from src/routes/index.tsx
 *
 * Renders a full-bleed 85vh image with:
 *  - Gradient overlay (bottom)
 *  - Eyebrow "The Summer Voyage 2026"
 *  - Serif headline "Made for the long way home."
 *  - Sub-copy
 *  - Shop Women / Shop Men CTAs
 *  - AEP hook: data-aep-slot="home-hero"
 */

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  block.innerHTML = `
    <div class="hero-media">
      <img
        src="/media/hero-beach.jpg"
        alt="Sunlit beach at golden hour"
        class="hero-img"
        width="1920"
        height="1200"
        loading="eager"
        fetchpriority="high"
      />
      <div class="hero-overlay" aria-hidden="true"></div>
    </div>

    <div class="hero-content container-x max-w-site">
      <div class="eyebrow hero-eyebrow">The Summer Voyage 2026</div>
      <h1 class="hero-headline">
        Made for the<br>long way home.
      </h1>
      <p class="hero-sub">
        Featherweight linen. Hand-drawn island prints. Clothes for the hours between the last swim and the first pour.
      </p>
      <div class="hero-ctas">
        <a href="/category.html?category=women" class="btn-primary">Shop Women</a>
        <a href="/category.html?category=men" class="btn-outline">Shop Men</a>
      </div>
    </div>

    <!-- AEP hook: hero personalization -->
    <div data-aep-slot="home-hero" class="aep-slot" aria-hidden="true"></div>
  `;
}

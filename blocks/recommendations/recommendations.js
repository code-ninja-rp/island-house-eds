/**
 * Island House — Recommendations Block
 * Port of the AEP recommendations section from src/routes/index.tsx
 *
 * This is an AEP personalization placeholder. In production, AEP Target
 * would swap this container's content with a live offer or product carousel.
 *
 * Includes data-aep-slot="home-recommendations".
 */

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  block.innerHTML = `
    <div
      class="recommendations-inner container-x max-w-site"
      data-aep-slot="home-recommendations"
    >
      <div class="recommendations-content">
        <div class="eyebrow recommendations-eyebrow">Personalised for you</div>
        <h3 class="recommendations-heading">Recommendations appear here</h3>
        <p class="recommendations-desc">
          AEP Target decisioning slot — swap this container's contents with a live offer or product carousel.
        </p>
      </div>
    </div>
  `;
}

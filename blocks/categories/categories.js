/**
 * Island House — Categories Block
 * Port of the categories section from src/routes/index.tsx
 *
 * Three-column image tiles: Women / Men / The Home
 * Each tile: background image, serif label, eyebrow "Shop the edit →", hover scale + overlay.
 */

const CATEGORIES = [
  { img: '/media/cat-women.jpg', label: 'Women',    slug: 'women' },
  { img: '/media/cat-men.jpg',   label: 'Men',      slug: 'men' },
  { img: '/media/cat-home.jpg',  label: 'The Home', slug: 'accessories' },
];

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  block.innerHTML = `
    <div class="categories-grid container-x max-w-site">
      ${CATEGORIES.map((c) => `
        <a
          href="/category.html?category=${c.slug}"
          class="category-tile"
          aria-label="Shop ${c.label}"
        >
          <img
            src="${c.img}"
            alt="${c.label}"
            class="category-tile-img"
            loading="lazy"
            width="600"
            height="750"
          />
          <div class="category-tile-overlay" aria-hidden="true"></div>
          <div class="category-tile-body">
            <div class="category-tile-label">${c.label}</div>
            <div class="eyebrow category-tile-cta">Shop the edit →</div>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

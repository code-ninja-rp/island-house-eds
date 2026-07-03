/**
 * Island House — Product Catalogue
 * Port of src/lib/products.ts — plain ES module, no TypeScript.
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {'men'|'women'|'accessories'} category
 * @property {number} price
 * @property {string} image
 * @property {string[]} colors
 * @property {string[]} sizes
 * @property {string} description
 * @property {string[]} details
 * @property {boolean} [isNew]
 */

/** @type {Product[]} */
export const products = [
  {
    id: 'p-001',
    slug: 'palm-frond-camp-shirt',
    name: 'Palm Frond Silk Camp Shirt',
    category: 'men',
    price: 148,
    image: '/media/product-shirt.jpg',
    colors: ['Palm Green', 'Sand', 'Midnight'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Cut from a fluid silk-blend that drapes like a sea breeze. The camp collar and relaxed shoulder are made for long lunches that turn into longer sunsets.',
    details: [
      '70% silk, 30% viscose',
      'Camp collar, chest pocket',
      'Machine wash cold, line dry',
      'Imported',
    ],
    isNew: true,
  },
  {
    id: 'p-002',
    slug: 'havana-linen-trouser',
    name: 'Havana Linen Trouser',
    category: 'men',
    price: 168,
    image: '/media/product-pants.jpg',
    colors: ['Cream', 'Driftwood', 'Ink'],
    sizes: ['30', '32', '34', '36', '38'],
    description:
      'A pure Belgian linen trouser with a relaxed straight leg. Deep pockets, hidden waist adjusters, and just enough weight to hold a crease through humidity.',
    details: [
      '100% Belgian linen',
      'Flat front, side adjusters',
      'Dry clean recommended',
    ],
  },
  {
    id: 'p-003',
    slug: 'hibiscus-sun-dress',
    name: 'Hibiscus Sun Dress',
    category: 'women',
    price: 138,
    image: '/media/product-dress.jpg',
    colors: ['Coral Bloom', 'Ivory'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'An airy V-neck sundress printed with hand-illustrated hibiscus. A drawstring waist and gentle A-line skirt catch every trade wind.',
    details: [
      '100% viscose',
      'Adjustable straps, tie waist',
      'Hand wash cold',
    ],
    isNew: true,
  },
  {
    id: 'p-004',
    slug: 'coconut-cove-fedora',
    name: 'Coconut Cove Straw Fedora',
    category: 'accessories',
    price: 78,
    image: '/media/product-hat.jpg',
    colors: ['Natural / Navy'],
    sizes: ['S/M', 'L/XL'],
    description:
      'A packable paper-straw fedora finished with a navy grosgrain band. Wide enough to shade a long lunch, structured enough to travel well.',
    details: [
      'Paper straw, cotton band',
      'UPF 50+',
      'Packable crown',
    ],
  },
  {
    id: 'p-005',
    slug: 'marlin-run-aloha-shirt',
    name: 'Marlin Run Aloha Shirt',
    category: 'men',
    price: 158,
    image: '/media/product-aloha.jpg',
    colors: ['Deep Ocean', 'Reef'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      'A modern take on the classic aloha in a lustrous ocean blue. The marlin print is drawn by hand and printed to feel like it\'s swimming across you.',
    details: [
      '60% silk, 40% cotton',
      'Coconut buttons, matched pockets',
      'Machine wash cold',
    ],
  },
];

/**
 * Find a product by slug.
 * @param {string} slug
 * @returns {Product|undefined}
 */
export function getProduct(slug) {
  return products.find((p) => p.slug === slug);
}

/**
 * Filter products by category.
 * @param {'men'|'women'|'accessories'} cat
 * @returns {Product[]}
 */
export function byCategory(cat) {
  return products.filter((p) => p.category === cat);
}

/**
 * Island House — EDS Entry Point (scripts.js)
 * Bootstraps the page: loads critical CSS, decorates sections & blocks,
 * loads the header + footer blocks, then lazy-loads non-critical resources.
 */

import {
  decorateSections,
  decorateBlocksInSections,
  decorateBlock,
  loadCSS,
  waitForLCP,
} from './aem.js';

const LCP_BLOCKS = ['hero'];

/**
 * Load and decorate the header block.
 */
async function loadHeader() {
  const headerEl = document.querySelector('header');
  if (!headerEl || headerEl.querySelector('.header')) return; // guard against double-call
  const headerBlock = document.createElement('div');
  headerBlock.classList.add('header', 'block');
  // NOTE: do NOT pre-set blockStatus here — decorateBlock sets it itself.
  // Pre-setting causes decorateBlock's guard to bail immediately.
  headerEl.append(headerBlock);
  await decorateBlock(headerBlock);
}

/**
 * Load and decorate the footer block.
 */
async function loadFooter() {
  const footerEl = document.querySelector('footer');
  if (!footerEl || footerEl.querySelector('.footer')) return; // guard against double-call
  const footerBlock = document.createElement('div');
  footerBlock.classList.add('footer', 'block');
  // NOTE: do NOT pre-set blockStatus here — decorateBlock sets it itself.
  footerEl.append(footerBlock);
  await decorateBlock(footerBlock);
}

/**
 * Decorate the main element: sections → blocks.
 * @param {HTMLElement} main
 */
function decorateMain(main) {
  decorateSections(main);
  decorateBlocksInSections(main);
}

/**
 * Lazy-load non-critical styles and remaining blocks.
 * @param {HTMLElement} main
 */
async function loadLazy(main) {
  await loadCSS('/styles/lazy-styles.css');
  // Only pick up blocks that haven't started loading yet
  const pending = main.querySelectorAll('.block:not([data-block-status])');
  await Promise.all([...pending].map((b) => decorateBlock(b)));
}

/**
 * Main page load sequence.
 */
async function loadPage() {
  const main = document.querySelector('main');
  if (!main) return;

  // 1. Mark section structure and identify blocks
  decorateMain(main);

  // 2. Load header + footer (parallel)
  await Promise.all([loadHeader(), loadFooter()]);

  // 3. Eagerly load LCP blocks — mark loading status first so lazy pass skips them
  const lcpBlocks = [...main.querySelectorAll(LCP_BLOCKS.map((b) => `.${b}.block`).join(', '))];
  // NOTE: do NOT pre-set blockStatus — decorateBlock sets it itself and guards against double-load.
  await Promise.all(lcpBlocks.map((b) => decorateBlock(b)));

  // 4. Wait for LCP image
  await waitForLCP();

  // 5. Lazy-load everything else — only blocks with no status yet
  loadLazy(main).catch(console.error);
}

loadPage();

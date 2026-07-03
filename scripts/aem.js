/**
 * Island House — EDS Core AEM Helpers
 * Lightweight port of the standard @adobe/aem aem.js helpers used by scripts.js.
 * Original: https://github.com/adobe/aem-boilerplate/blob/main/scripts/aem.js
 */

/**
 * Load a CSS file from the given href.
 * @param {string} href
 * @returns {Promise<void>}
 */
export function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) { resolve(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.append(link);
  });
}

/**
 * Load a JS module from the given path.
 * @param {string} src
 * @returns {Promise<module>}
 */
export async function loadScript(src) {
  return import(src);
}

/**
 * Get the block name from a block element's first class.
 * @param {HTMLElement} block
 * @returns {string}
 */
export function getBlockName(block) {
  return block.classList[0];
}

/**
 * Build a block element from the given name and content.
 * @param {string} blockName
 * @param {string|HTMLElement|Array} content
 * @returns {HTMLElement}
 */
export function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    [...row].forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col instanceof Element ? [col] : [col];
      vals.forEach((v) => {
        if (v instanceof Element) colEl.append(v);
        else colEl.innerHTML += v;
      });
      rowEl.append(colEl);
    });
    blockEl.append(rowEl);
  });
  return blockEl;
}

/**
 * Decorate a block: load its CSS and JS, call its default export.
 * @param {HTMLElement} block
 */
export async function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (!shortBlockName) return;
  // Skip if already claimed by another load pass
  if (block.dataset.blockStatus) return;
  // Claim immediately to prevent concurrent decoration
  block.dataset.blockStatus = 'loading';
  const blockCSSPath = `/blocks/${shortBlockName}/${shortBlockName}.css`;
  const blockJSPath = `/blocks/${shortBlockName}/${shortBlockName}.js`;
  try {
    await loadCSS(blockCSSPath);
  } catch {
    // block CSS may not exist
  }
  try {
    const { default: init } = await loadScript(blockJSPath);
    if (typeof init === 'function') await init(block);
  } catch (err) {
    console.error(`Failed to load block: ${shortBlockName}`, err);
  }
  block.dataset.blockStatus = 'loaded';
}

/**
 * Decorate all blocks found in the element.
 * @param {HTMLElement} el
 */
export async function decorateBlocks(el) {
  const blocks = el.querySelectorAll('[data-block-name], .block:not([data-block-status])');
  const blockEls = el.querySelectorAll(':scope > div > div');
  const allBlocks = [...blockEls].filter((b) => b.classList.length > 0 && !b.dataset.blockStatus);
  await Promise.all(allBlocks.map(decorateBlock));
}

/**
 * Decorate sections: wrap each <main> direct child <div> as a section.
 * @param {HTMLElement} main
 */
export function decorateSections(main) {
  [...main.children].forEach((section) => {
    if (section.tagName === 'DIV') section.classList.add('section');
  });
}

/** Known EDS block names — only these first-class names are treated as blocks. */
const KNOWN_BLOCKS = new Set([
  'hero', 'header', 'footer', 'categories', 'product-list',
  'product-detail', 'cart', 'recommendations',
]);

/**
 * Decorate blocks inside the given element.
 * Only div elements whose first CSS class exactly matches a registered block
 * name are treated as blocks. Layout-only utility divs (e.g. container-x,
 * story-strip, journal-wrap) are skipped.
 * @param {HTMLElement} main
 */
export function decorateBlocksInSections(main) {
  main.querySelectorAll('.section > div').forEach((block) => {
    const firstName = block.classList[0];
    if (firstName && KNOWN_BLOCKS.has(firstName) && !block.dataset.blockStatus) {
      block.classList.add('block');
    }
  });
}

/**
 * Wait for LCP image to load.
 * @returns {Promise<void>}
 */
export function waitForLCP() {
  return new Promise((resolve) => {
    const lcpImg = document.querySelector('img');
    if (!lcpImg || lcpImg.complete) { resolve(); return; }
    lcpImg.addEventListener('load', resolve);
    lcpImg.addEventListener('error', resolve);
  });
}

/**
 * Convert a string to a slug.
 * @param {string} str
 * @returns {string}
 */
export function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Get the value of a URL param.
 * @param {string} name
 * @returns {string|null}
 */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Decorate icons: replace :icon-name: syntax with <img> or SVG.
 * (Stub — not used in Island House but standard in EDS.)
 * @param {HTMLElement} el
 */
export function decorateIcons(el) {
  el.querySelectorAll('span.icon').forEach((span) => {
    const icon = span.dataset.icon || [...span.classList].find((c) => c.startsWith('icon-'))?.slice(5);
    if (!icon) return;
    const img = document.createElement('img');
    img.src = `/icons/${icon}.svg`;
    img.alt = icon;
    img.loading = 'lazy';
    span.append(img);
  });
}

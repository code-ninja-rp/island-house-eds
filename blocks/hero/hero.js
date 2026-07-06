/**
 * Island House — Hero Block (xwalk-compatible)
 *
 * When served via AEM / xwalk the block DOM looks like:
 *
 *   <div class="hero block" data-block-name="hero" data-aue-resource="…">
 *     <div><div>                   ← row 0, col 0: <picture> (background image)
 *       <picture>…</picture>
 *     </div></div>
 *     <div><div>                   ← row 1, col 0: rich-text (eyebrow + headline + copy + CTAs)
 *       <p>The Summer Voyage 2026</p>
 *       <h1>Made for the long way home.</h1>
 *       <p>Featherweight linen…</p>
 *       <p><strong><a href="/women">Shop Women</a></strong> <em><a href="/men">Shop Men</a></em></p>
 *     </div></div>
 *   </div>
 *
 * When running locally without AEM (static HTML), the block is empty and we
 * fall back to a hardcoded demo so the page still looks correct.
 *
 * Renders:
 *  - Full-bleed 85vh picture (object-fit: cover)
 *  - Gradient overlay (bottom)
 *  - Eyebrow (first <p> before the <h1>)
 *  - Serif h1 headline
 *  - Sub-copy paragraphs
 *  - CTA buttons (styled via .btn-primary / .btn-outline from styles.css)
 *  - data-aep-slot hook for AEP personalization
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/** Fallback content used when there is no AEM-delivered DOM content. */
const FALLBACK = {
  img: '/media/hero-beach.jpg',
  alt: 'Sunlit beach at golden hour',
  eyebrow: 'The Summer Voyage 2026',
  headline: 'Made for the<br>long way home.',
  copy: 'Featherweight linen. Hand-drawn island prints. Clothes for the hours between the last swim and the first pour.',
  ctas: [
    { href: '/category.html?category=women', label: 'Shop Women', style: 'btn-primary' },
    { href: '/category.html?category=men',   label: 'Shop Men',   style: 'btn-outline' },
  ],
};

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  // ── Read AEM-delivered rows ──────────────────────────────────────────────────
  const rows = [...block.querySelectorAll(':scope > div')];

  let picture = rows[0]?.querySelector('picture') || null;
  const textRow = rows[1] || rows[0]; // fallback: single-row block
  const textCell = textRow?.querySelector('div') || textRow;

  // Collect text nodes from the content cell
  let eyebrow = '';
  let headline = '';
  const copyParas = [];
  const ctaLinks = [];

  if (textCell) {
    const children = [...textCell.children];
    let foundH1 = false;
    children.forEach((el) => {
      const tag = el.tagName;
      if (!foundH1 && (tag === 'H1' || tag === 'H2' || tag === 'H3')) {
        if (!eyebrow && copyParas.length === 0) {
          // The paragraph just before the heading is treated as the eyebrow
          const prev = el.previousElementSibling;
          if (prev && prev.tagName === 'P') eyebrow = prev.innerHTML;
        }
        headline = el.innerHTML;
        foundH1 = true;
      } else if (foundH1) {
        const links = [...el.querySelectorAll('a')];
        if (links.length) {
          ctaLinks.push(...links);
        } else {
          copyParas.push(el.innerHTML);
        }
      }
    });
  }

  // ── Use fallback when running locally without AEM content ───────────────────
  const hasDOMContent = picture || headline;

  if (!hasDOMContent) {
    // static local fallback
    const fallbackPic = document.createElement('picture');
    const img = document.createElement('img');
    img.src = FALLBACK.img;
    img.alt = FALLBACK.alt;
    img.width = 1920;
    img.height = 1200;
    img.loading = 'eager';
    img.fetchPriority = 'high';
    fallbackPic.append(img);
    picture = fallbackPic;
    eyebrow = FALLBACK.eyebrow;
    headline = FALLBACK.headline;
    copyParas.push(FALLBACK.copy);
    FALLBACK.ctas.forEach(({ href, label, style }) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      a.className = style;
      ctaLinks.push(a);
    });
  }

  // ── Optimise picture if it came from AEM ────────────────────────────────────
  if (picture && hasDOMContent) {
    const img = picture.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 600px)', width: '1920' },
        { width: '750' },
      ]);
      moveInstrumentation(img, optimized.querySelector('img'));
      picture.replaceWith(optimized);
      picture = optimized;
    }
  }

  // ── Build block DOM ──────────────────────────────────────────────────────────
  block.innerHTML = '';

  // Media layer
  const media = document.createElement('div');
  media.className = 'hero-media';
  if (picture) {
    picture.querySelectorAll('img').forEach((img) => {
      img.className = 'hero-img';
      img.loading = 'eager';
    });
    media.append(picture);
  }
  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  media.append(overlay);
  block.append(media);

  // Content layer
  const content = document.createElement('div');
  content.className = 'hero-content container-x max-w-site';

  if (eyebrow) {
    const ew = document.createElement('div');
    ew.className = 'eyebrow hero-eyebrow';
    ew.innerHTML = eyebrow;
    content.append(ew);
  }

  if (headline) {
    const h1 = document.createElement('h1');
    h1.className = 'hero-headline';
    h1.innerHTML = headline;
    content.append(h1);
  }

  copyParas.forEach((html) => {
    const p = document.createElement('p');
    p.className = 'hero-sub';
    p.innerHTML = html;
    content.append(p);
  });

  if (ctaLinks.length) {
    const ctas = document.createElement('div');
    ctas.className = 'hero-ctas';
    ctaLinks.forEach((link, i) => {
      const a = link.cloneNode(true);
      // preserve any existing btn classes; otherwise apply defaults
      if (!a.className) {
        a.className = i === 0 ? 'btn-primary' : 'btn-outline';
      }
      ctas.append(a);
    });
    content.append(ctas);
  }

  block.append(content);

  // AEP slot hook (invisible placeholder for personalization engine)
  const aepSlot = document.createElement('div');
  aepSlot.dataset.aepSlot = 'home-hero';
  aepSlot.className = 'aep-slot';
  aepSlot.setAttribute('aria-hidden', 'true');
  block.append(aepSlot);
}

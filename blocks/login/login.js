/**
 * Island House — Login Block
 * Renders the sign-in form, validates inputs, persists session, and
 * fires AEP events for attempt and success. Redirects to the saved
 * return URL (or homepage) after a successful login.
 */

import { getUser, saveUser, getReturnUrl, clearReturnUrl } from '../../scripts/auth.js';
import { trackLoginAttempt, trackLoginSuccess } from '../../scripts/aep.js';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(el, msg) {
  // eslint-disable-next-line no-param-reassign
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearError(el) {
  // eslint-disable-next-line no-param-reassign
  el.textContent = '';
  el.classList.add('hidden');
}

/**
 * @param {HTMLElement} block
 */
export default function init(block) {
  // Already logged in — send straight to the return destination
  if (getUser()) {
    window.location.replace(getReturnUrl());
    return;
  }

  block.innerHTML = `
    <div class="login-card">

      <div class="login-brand">
        <div class="login-brand-inner">
          <p class="eyebrow login-eyebrow">Island House</p>
          <h2 class="login-brand-heading">Dressed for the long&nbsp;way home.</h2>
          <p class="login-brand-sub">
            Featherweight linen. Hand-drawn island prints.
            Clothes for the hours between the last swim and the first pour.
          </p>
        </div>
      </div>

      <div class="login-form-panel">
        <h1 class="login-heading">Sign In</h1>

        <form class="login-form" id="login-form" novalidate>

          <div class="login-field">
            <label class="login-label" for="login-name">Your Name</label>
            <input
              class="login-input"
              type="text"
              id="login-name"
              name="name"
              required
              autocomplete="name"
              placeholder="Alex Rivera"
            />
          </div>

          <div class="login-field">
            <label class="login-label" for="login-email">Email Address</label>
            <input
              class="login-input"
              type="email"
              id="login-email"
              name="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div class="login-field">
            <label class="login-label" for="login-password">Password</label>
            <input
              class="login-input"
              type="password"
              id="login-password"
              name="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <p class="login-error hidden" id="login-error" role="alert"></p>

          <button type="submit" class="btn-primary login-submit" id="login-submit">
            Sign In
          </button>

        </form>
      </div>

    </div>
  `;

  const form      = block.querySelector('#login-form');
  const errorEl   = block.querySelector('#login-error');
  const submitBtn = block.querySelector('#login-submit');
  const nameInput  = block.querySelector('#login-name');
  const emailInput = block.querySelector('#login-email');
  const pwInput    = block.querySelector('#login-password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError(errorEl);

    const name     = nameInput.value.trim();
    const email    = emailInput.value.trim();
    const password = pwInput.value;

    if (!name) {
      showError(errorEl, 'Please enter your name.');
      nameInput.focus();
      return;
    }
    if (!validateEmail(email)) {
      showError(errorEl, 'Please enter a valid email address.');
      emailInput.focus();
      return;
    }
    if (password.length < 6) {
      showError(errorEl, 'Password must be at least 6 characters.');
      pwInput.focus();
      return;
    }

    trackLoginAttempt(email);

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Signing in…';

    // Simulate a brief auth round-trip
    await new Promise((r) => { setTimeout(r, 500); });

    const user = { name, email };
    saveUser(user);
    trackLoginSuccess(user);

    const dest = getReturnUrl();
    clearReturnUrl();
    window.location.replace(dest);
  });
}

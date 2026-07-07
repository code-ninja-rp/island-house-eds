/**
 * Island House — Auth Utilities
 * Manages user session in localStorage and return-URL in sessionStorage.
 */

const USER_KEY   = 'ih_user';
const RETURN_KEY = 'ih_return_url';

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

/** URL to return to after login. Falls back to homepage. */
export function getReturnUrl() {
  return sessionStorage.getItem(RETURN_KEY) || '/index.html';
}

export function setReturnUrl(url) {
  sessionStorage.setItem(RETURN_KEY, url);
}

export function clearReturnUrl() {
  sessionStorage.removeItem(RETURN_KEY);
}

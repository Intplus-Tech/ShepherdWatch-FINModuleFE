/**
 * CSRF token generation, using Web Crypto only.
 *
 * This is deliberately separate from `lib/csrf.ts`: `middleware.ts` and
 * `auth.ts` both need to mint a token, and both are pulled into the Edge
 * bundle, where `node:crypto` is unavailable. `crypto.getRandomValues` exists
 * on Edge, Node and the browser alike.
 */
export function createCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

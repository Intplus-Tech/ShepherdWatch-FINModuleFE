"use client";

import axios from "axios";
import { getCsrfTokenFromCookie } from "@/lib/csrf";

const CSRF_HEADER_NAME = "x-csrf-token";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let installed = false;

function isSameOriginApiRequest(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.origin);
    return resolved.origin === window.location.origin && resolved.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

/**
 * Attach the double-submit CSRF token to every mutating same-origin `/api/*`
 * request the browser makes.
 *
 * Doing this centrally rather than per call site is what lets `isCsrfValid`
 * fail closed: 113 mutating call sites exist across the app and only 26 files
 * set the header by hand, so a per-file approach would have left the rest
 * returning 403 — and every new call site would have to remember.
 *
 * The token is read at request time, not at install time, because the cookie is
 * seeded by `middleware.ts` on the first page response and can be rotated.
 */
export function installCsrfInterceptors() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

    if (!UNSAFE_METHODS.has(method) || !isSameOriginApiRequest(url)) {
      return nativeFetch(input, init);
    }

    const token = getCsrfTokenFromCookie();
    if (!token) return nativeFetch(input, init);

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    if (!headers.has(CSRF_HEADER_NAME)) headers.set(CSRF_HEADER_NAME, token);

    return nativeFetch(input, { ...init, headers });
  };

  // Several hooks use axios, which goes through XMLHttpRequest and so never
  // reaches the fetch wrapper above.
  axios.interceptors.request.use((config) => {
    const method = String(config.method ?? "GET").toUpperCase();
    if (!UNSAFE_METHODS.has(method)) return config;
    if (config.url && !isSameOriginApiRequest(config.url)) return config;

    const token = getCsrfTokenFromCookie();
    if (token) config.headers.set(CSRF_HEADER_NAME, token);
    return config;
  });
}

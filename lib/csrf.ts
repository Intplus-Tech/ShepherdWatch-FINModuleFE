import type { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME } from "./auth-config";

const CSRF_HEADER_NAME = "x-csrf-token";

export const getCsrfTokenFromRequest = (req: NextRequest) => {
  return {
    cookie: req.cookies.get(CSRF_COOKIE_NAME)?.value ?? "",
    header: req.headers.get(CSRF_HEADER_NAME) ?? "",
  };
};

/**
 * Double-submit check: the `csrf_token` cookie must match the `x-csrf-token`
 * header. `middleware.ts` seeds the cookie on every page response and
 * `lib/csrf-client.ts` copies it into the header for mutating same-origin
 * requests, so both halves are present on any request that came from the app.
 *
 * This used to return `true` when the cookie AND the header were both absent —
 * which, since nothing ever issued the cookie, was every single request.
 */
export const isCsrfValid = (req: NextRequest) => {
  const { cookie, header } = getCsrfTokenFromRequest(req);
  if (!cookie || !header) return false;
  return cookie === header;
};

export { createCsrfToken } from "./csrf-token";

export const setCsrfCookie = (res: NextResponse, token: string) => {
  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

/**
 * Browser-side helper: reads the `csrf_token` cookie from `document.cookie`.
 * Returns "" when called on the server or when the cookie is unset.
 */
export const getCsrfTokenFromCookie = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${CSRF_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
};


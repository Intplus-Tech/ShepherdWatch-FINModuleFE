import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CSRF_COOKIE_NAME } from "@/lib/auth-config";
import { createCsrfToken } from "@/lib/csrf-token";

/**
 * Route gate for everything the matcher below covers.
 *
 * The redirect is issued here rather than through `callbacks.authorized`
 * because next-auth's middleware wrapper only falls through to its own
 * redirect branch when no handler function is supplied
 * (`next-auth/lib/index.js` — `else if (userMiddlewareOrRoute)` runs first and
 * returns this handler's response). Previously neither existed, `authorized`
 * defaulted to `true`, and the matcher blocked nothing at all.
 */
export default auth((req) => {
  const session = req.auth;
  // A session whose refresh token has expired carries `RefreshAccessTokenError`;
  // treat it as signed out rather than letting it onto a screen that cannot load.
  const signedIn = Boolean(session?.user) && session?.error !== "RefreshAccessTokenError";

  if (!signedIn) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/login";
    signInUrl.search = "";
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  const res = NextResponse.next();

  // Seed the double-submit CSRF cookie when the browser has none. Nothing in
  // the app ever issued it, so `isCsrfValid` saw an empty cookie AND an empty
  // header on every request and took its fail-open branch — the mechanism was
  // inert. Readable by JS on purpose: `lib/csrf-client.ts` copies it into the
  // `x-csrf-token` header on mutating requests.
  if (!req.cookies.get(CSRF_COOKIE_NAME)?.value) {
    res.cookies.set({
      name: CSRF_COOKIE_NAME,
      value: createCsrfToken(),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
});

export const config = {
  matcher: [
    /*
     * Protect dashboards and screens. Skip Next.js internals, public assets,
     * every API route, and the public auth pages.
     *
     * `api` is excluded wholesale — not just `api/auth` — because the proxy
     * handlers under `app/api/v1/**` must answer an unauthenticated caller with
     * a JSON 401 that `fetch()` can read, not with the HTML redirect to /login
     * that this middleware issues. Those handlers do their own auth check.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|login|signin|sign-up|signup|forgot-password|verify-email|reset-password|reset-success).*)",
  ],
};

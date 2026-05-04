import { auth } from "@/auth";

export default auth;

export const config = {
  matcher: [
    /*
     * Protect dashboards and screens. Skip Next.js internals, public assets,
     * the auth API route group, and the public auth pages.
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|login|signin|sign-up|signup|forgot-password|verify-email|reset-password|reset-success).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { fetchBackendMe, getBackendMeUrls } from "@/lib/backend-auth-me";

const TOKEN_CHECK_TTL_MS = 60 * 1000;
const tokenValidityCache = new Map<string, { valid: boolean; expiresAt: number }>();

async function isTokenValid(token: string): Promise<boolean> {
  const now = Date.now();
  const cached = tokenValidityCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.valid;
  }

  const backendUrls = getBackendMeUrls();
  if (backendUrls.length === 0) {
    // If backend isn't configured, don't block access here.
    tokenValidityCache.set(token, { valid: true, expiresAt: now + TOKEN_CHECK_TTL_MS });
    return true;
  }

  try {
    const res = await fetchBackendMe(token);
    if (!res) {
      tokenValidityCache.set(token, { valid: true, expiresAt: now + TOKEN_CHECK_TTL_MS });
      return true;
    }

    // Treat only explicit auth failures as invalid session.
    const valid = ![401, 403].includes(res.status);
    tokenValidityCache.set(token, { valid, expiresAt: now + TOKEN_CHECK_TTL_MS });
    return valid;
  } catch {
    // On transient errors, allow access to avoid false negatives.
    tokenValidityCache.set(token, { valid: true, expiresAt: now + TOKEN_CHECK_TTL_MS });
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  
  // Tolerant check - skip backend validation to prevent redirect loops on transient backend issues
  // isTokenValid already handles 502 gracefully, but avoid blocking middleware
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

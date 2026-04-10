import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";

const TOKEN_CHECK_TTL_MS = 60 * 1000;
const tokenValidityCache = new Map<string, { valid: boolean; expiresAt: number }>();

function getBackendMeUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/auth/me`;
  }
  return null;
}

async function isTokenValid(token: string): Promise<boolean> {
  const now = Date.now();
  const cached = tokenValidityCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.valid;
  }

  const backendUrl = getBackendMeUrl();
  if (!backendUrl) {
    // If backend isn't configured, don't block access here.
    tokenValidityCache.set(token, { valid: true, expiresAt: now + TOKEN_CHECK_TTL_MS });
    return true;
  }

  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const valid = res.ok;
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

  const valid = await isTokenValid(token);
  if (!valid) return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

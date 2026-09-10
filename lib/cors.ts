import type { NextRequest, NextResponse } from "next/server";
import { FRONTEND_ORIGIN } from "./auth-config";
import { flushAuthCookies } from "./backend-refresh";

const allowedOrigins = FRONTEND_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const isOriginAllowed = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  const forwardedHostRaw = req.headers.get("x-forwarded-host");
  const forwardedHost = forwardedHostRaw?.split(",")[0]?.trim();
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    if (host && originHost === host) return true;
    if (forwardedHost && originHost === forwardedHost) return true;
  } catch {
    return false;
  }

  // If no explicit allow-list is configured, do not block same-app deployments.
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
};

export const getCorsHeaders = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  if (!origin || allowedOrigins.length === 0) return null;
  if (!allowedOrigins.includes(origin)) return null;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    Vary: "Origin",
  };
};

/**
 * Finalise a proxied response: write back any access/refresh cookies that were
 * renewed while serving this request, then apply CORS headers.
 *
 * The cookie flush lives here because every proxy handler already funnels its
 * responses through `applyCors`. Without it a handler that silently refreshed
 * mid-request would send the browser a stale access-token cookie and refresh
 * again on the very next call.
 */
export const applyCors = (res: NextResponse, req: NextRequest) => {
  flushAuthCookies(res, req);

  const headers = getCorsHeaders(req);
  if (!headers) return res;

  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }

  return res;
};

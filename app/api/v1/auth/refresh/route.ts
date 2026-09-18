import { NextRequest, NextResponse } from "next/server";
import { BACKEND_REFRESH_TOKEN_COOKIE } from "@/lib/auth-config";
import { getAuthEndpoint } from "@/lib/backend-auth-url";
import { applyAuthCookies, refreshAccessToken } from "@/lib/backend-refresh";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function parseRefreshTokenBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;
  const refreshToken = String(source.refreshToken ?? "").trim();
  return refreshToken.length > 0 ? refreshToken : null;
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const rawText = await req.text();
    let tokenFromBody: string | null = null;
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      tokenFromBody = parseRefreshTokenBody(parsed);
    } catch {
      tokenFromBody = null;
    }

    const tokenFromCookie = req.cookies.get(BACKEND_REFRESH_TOKEN_COOKIE)?.value ?? "";
    const refreshToken = tokenFromBody ?? tokenFromCookie;
    if (!refreshToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Refresh token missing" }, { status: 401 }),
        req
      );
    }

    if (!getAuthEndpoint("refresh-token")) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    // Through the shared refresh so a burst of requests for one session makes
    // one backend call: the backend counts refreshes against its sign-in limit.
    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens?.accessToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unable to refresh the session. Please sign in again." }, { status: 401 }),
        req
      );
    }

    const response = NextResponse.json({ success: true, message: "Token refreshed.", data: { tokens } }, { status: 200 });
    applyAuthCookies(response, tokens);
    return applyCors(response, req);
  } catch {
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

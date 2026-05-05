import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { isCsrfValid } from "@/lib/csrf";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendRegionsUrl(search?: string): string | null {
  const url = getBackendUrl(`${API_V1}/regions`);
  if (!url) return null;
  return search ? `${url}${search}` : url;
}

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
        req
      );
    }

    const backendUrl = getBackendRegionsUrl(req.nextUrl.search);
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const { res: backendResponse, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      })
    );

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to fetch regions",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    const response = NextResponse.json(payload, { status: 200 });
    applyAuthCookies(response, refreshedTokens);
    return applyCors(response, req);
  } catch (error) {
    console.error("Regions proxy error:", error);
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
        req
      );
    }

    if (!isCsrfValid(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "CSRF token invalid" }, { status: 403 }),
        req
      );
    }

    const backendUrl = getBackendRegionsUrl("");
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }
    
    const body = await req.json().catch(() => null);

    const { res: backendResponse, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body ?? {}),
        cache: "no-store",
      })
    );

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to create region",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    const response = NextResponse.json(payload, { status: 201 });
    applyAuthCookies(response, refreshedTokens);
    return applyCors(response, req);
  } catch (error) {
    console.error("Create region proxy error:", error);
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

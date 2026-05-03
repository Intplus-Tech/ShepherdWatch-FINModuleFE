import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { isCsrfValid } from "@/lib/csrf";

function getBackendRegionUrl(regionId: string): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) return `${baseUrl}/api/v1/core/regions/${encodeURIComponent(regionId)}`;
  
  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;
  if (loginUrl.includes("/auth/login")) return loginUrl.replace("/auth/login", `/core/regions/${encodeURIComponent(regionId)}`);
  if (loginUrl.endsWith("/login")) return loginUrl.replace(/\/login$/, `/core/regions/${encodeURIComponent(regionId)}`);
  return null;
}

function getBackendRegionStatusUrl(regionId: string): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) return `${baseUrl}/api/v1/regions/${encodeURIComponent(regionId)}/status`;
  
  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;
  if (loginUrl.includes("/auth/login")) return loginUrl.replace("/auth/login", `/regions/${encodeURIComponent(regionId)}/status`);
  if (loginUrl.endsWith("/login")) return loginUrl.replace(/\/login$/, `/regions/${encodeURIComponent(regionId)}/status`);
  return null;
}

export async function GET(req: NextRequest, context: { params: Promise<{ regionId: string }> }) {
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

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      );
    }

    const regionId = (await context.params).regionId;
    const backendUrl = getBackendRegionUrl(regionId);
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }
    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to fetch region",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Region proxy error:", error);
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    );
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ regionId: string }> }) {
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

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      );
    }

    const regionId = (await context.params).regionId;
    const backendUrl = getBackendRegionUrl(regionId);
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }
    const body = await req.json().catch(() => null);

    const backendResponse = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to update region",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Update region proxy error:", error);
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ regionId: string }> }) {
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

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      );
    }

    const regionId = (await context.params).regionId;
    const backendUrl = getBackendRegionStatusUrl(regionId);
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }
    const body = await req.json().catch(() => null);

    const backendResponse = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to update region status",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Update region status proxy error:", error);
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

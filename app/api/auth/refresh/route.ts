import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_REFRESH_TOKEN_COOKIE,
  BACKEND_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendRefreshUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/auth/refresh-token`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/auth/refresh-token");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/refresh-token");
  }

  return null;
}

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

    const backendUrl = getBackendRefreshUrl();
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    const responseText = await backendResponse.text();
    const contentType = backendResponse.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      return applyCors(
        new NextResponse(responseText, {
          status: backendResponse.status,
          headers: contentType ? { "Content-Type": contentType } : undefined,
        }),
        req
      );
    }

    let responseData: Record<string, unknown> | null = null;
    try {
      responseData = responseText ? (JSON.parse(responseText) as Record<string, unknown>) : null;
    } catch {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid response received from authentication service" },
          { status: 502 }
        ),
        req
      );
    }

    const response = NextResponse.json(responseData, { status: backendResponse.status });

    if (backendResponse.ok) {
      const data =
        responseData && typeof responseData.data === "object" && responseData.data !== null
          ? (responseData.data as Record<string, unknown>)
          : null;
      const accessToken = typeof data?.accessToken === "string" ? data.accessToken : "";
      const newRefreshToken = typeof data?.refreshToken === "string" ? data.refreshToken : "";

      if (accessToken) {
        response.cookies.set({
          name: BACKEND_TOKEN_COOKIE,
          value: accessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
        });
      }

      if (newRefreshToken) {
        response.cookies.set({
          name: BACKEND_REFRESH_TOKEN_COOKIE,
          value: newRefreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
        });
      }
    }

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

import { NextRequest, NextResponse } from "next/server";
import { BACKEND_REFRESH_TOKEN_COOKIE, BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendLogoutUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/auth/logout`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/auth/logout");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/logout");
  }

  return null;
}

function parseRefreshTokenBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;
  const refreshToken = String(source.refreshToken ?? "").trim();
  return refreshToken.length > 0 ? refreshToken : null;
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(BACKEND_TOKEN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  response.cookies.set(BACKEND_REFRESH_TOKEN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
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
    let refreshTokenFromBody: string | null = null;
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      refreshTokenFromBody = parseRefreshTokenBody(parsed);
    } catch {
      refreshTokenFromBody = null;
    }

    const accessToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value ?? "";
    const refreshTokenFromCookie = req.cookies.get(BACKEND_REFRESH_TOKEN_COOKIE)?.value ?? "";
    const refreshToken = refreshTokenFromBody ?? refreshTokenFromCookie;

    if (!accessToken || !refreshToken) {
      const unauthorizedResponse = NextResponse.json(
        { success: false, message: "Unauthorized. Please log in again." },
        { status: 401 }
      );
      clearAuthCookies(unauthorizedResponse);
      return applyCors(unauthorizedResponse, req);
    }

    const backendUrl = getBackendLogoutUrl();
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    const responseText = await backendRes.text();
    const contentType = backendRes.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    let response: NextResponse;
    if (isJson) {
      try {
        const responseData = responseText ? JSON.parse(responseText) : null;
        response = NextResponse.json(responseData, { status: backendRes.status });
      } catch {
        response = NextResponse.json(
          { success: false, message: "Invalid response received from authentication service" },
          { status: 502 }
        );
      }
    } else {
      response = new NextResponse(responseText, {
        status: backendRes.status,
        headers: contentType ? { "Content-Type": contentType } : undefined,
      });
    }

    clearAuthCookies(response);
    return applyCors(response, req);
  } catch {
    const errorResponse = NextResponse.json(
      { success: false, message: "Server error occurred while logging out" },
      { status: 502 }
    );
    clearAuthCookies(errorResponse);
    return applyCors(errorResponse, req);
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

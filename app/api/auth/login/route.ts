import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  BACKEND_TOKEN_COOKIE,
  BACKEND_REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  REMEMBER_ME_COOKIE,
} from "@/lib/auth-config";
import { getAuthEndpoint } from "@/lib/backend-auth-url";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendLoginUrls(): string[] {
  const urls: string[] = [];

  const loginUrl = getAuthEndpoint("login");
  if (loginUrl) {
    urls.push(loginUrl);
  }

  const fallbackBase = process.env.BACKEND_API_URL?.trim();
  if (fallbackBase) {
    const normalized = fallbackBase.replace(/\/+$/, "").replace(/\/api-docs(?:\/.*)?$/i, "");
    if (normalized) {
      urls.push(normalized.endsWith("/api/v1") ? `${normalized}/auth/login` : `${normalized}/api/v1/auth/login`);
    }
  }

  return Array.from(new Set(urls));
}

type LoginPayload = {
  email: string
  password: string
}

function normalizeLoginPayload(body: unknown): LoginPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const email = String(source.email ?? "").trim().toLowerCase()
  const password = String(source.password ?? "")
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk || !password) return null
  return { email, password }
}

function pickToken(source: unknown, keys: string[]): string {
  if (!source || typeof source !== "object") return "";
  const sourceRecord = source as Record<string, unknown>;
  for (const key of keys) {
    const value = sourceRecord[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const backendLoginUrls = getBackendLoginUrls();
    if (backendLoginUrls.length === 0) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const rawText = await req.text();
    let rememberMe: boolean | undefined;
    let payloadToSend: LoginPayload | null = null;
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      if (parsed && typeof parsed === "object") {
        const parsedRecord = parsed as Record<string, unknown>;
        rememberMe = Boolean(parsedRecord.rememberMe);
        const rest = { ...parsedRecord };
        delete rest.rememberMe;
        payloadToSend = normalizeLoginPayload(rest);
      }
    } catch {
      payloadToSend = null;
    }

    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid payload. Email and password are required." },
          { status: 400 }
        ),
        req
      );
    }

    let backendResponse: Response | null = null;
    let lastNetworkError: unknown = null;
    for (const backendLoginUrl of backendLoginUrls) {
      try {
        const candidate = await fetch(backendLoginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payloadToSend),
          cache: "no-store",
        });
        backendResponse = candidate;
      } catch (err) {
        lastNetworkError = err;
        continue;
      }

      if (backendResponse && ![404, 405, 502, 503, 504].includes(backendResponse.status)) break;
    }

    if (!backendResponse) {
      const message =
        lastNetworkError instanceof Error
          ? lastNetworkError.message
          : "Authentication service is currently unavailable";
      return applyCors(
        NextResponse.json(
          { success: false, message: `Unable to reach authentication service: ${message}` },
          { status: 502 }
        ),
        req
      );
    }

    const responseText = await backendResponse.text();
    const contentType = backendResponse.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      if (!backendResponse.ok) {
        return applyCors(
          NextResponse.json(
            { success: false, message: `Authentication service error: ${backendResponse.status} ${backendResponse.statusText}` },
            { status: backendResponse.status }
          ),
          req
        );
      }
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
      responseData = responseText ? JSON.parse(responseText) : null;
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
      const data = (responseData?.data ?? {}) as Record<string, unknown>;
      const tokens = (data.tokens ?? {}) as Record<string, unknown>;
      const tokenShapeFromData = data.token;
      const tokenShapeFromRoot = responseData?.token;
      const accessToken =
        pickToken(tokens, ["accessToken", "access_token", "token"]) ||
        (typeof tokenShapeFromData === "string" ? tokenShapeFromData : "") ||
        (typeof tokenShapeFromRoot === "string" ? tokenShapeFromRoot : "") ||
        pickToken(data, ["accessToken", "access_token", "token"]) ||
        pickToken(responseData, ["accessToken", "access_token", "token"]);
      const refreshToken =
        pickToken(tokens, ["refreshToken", "refresh_token"]) ||
        pickToken(data, ["refreshToken", "refresh_token"]) ||
        pickToken(responseData, ["refreshToken", "refresh_token"]);

      if (accessToken) {
        response.cookies.set({
          name: BACKEND_TOKEN_COOKIE,
          value: accessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
        });
      }

      if (refreshToken) {
        response.cookies.set({
          name: BACKEND_REFRESH_TOKEN_COOKIE,
          value: refreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
        });
      }
    }

    if (rememberMe !== undefined) {
      response.cookies.set({
        name: REMEMBER_ME_COOKIE,
        value: rememberMe ? "true" : "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: rememberMe ? 60 * 60 * 24 * 90 : 0,
      });
    }

    return applyCors(response, req);
  } catch {
    return applyCors(
      NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
      ),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

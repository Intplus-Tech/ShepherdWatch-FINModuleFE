import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  BACKEND_REFRESH_TOKEN_COOKIE,
  BACKEND_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  REMEMBER_ME_COOKIE,
} from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendLoginUrl } from "@/lib/backend-auth-url";

type LoginPayload = {
  email: string;
  password: string;
};

function normalizeLoginPayload(body: unknown): LoginPayload | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;
  const email = String(source.email ?? "").trim();
  const password = String(source.password ?? "");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk || !password.trim()) return null;
  return { email, password };
}

function pickToken(source: unknown, keys: string[]): string {
  if (!source || typeof source !== "object") return "";
  const sourceRecord = source as Record<string, unknown>;
  for (const key of keys) {
    const value = sourceRecord[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function extractBackendErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const source = payload as Record<string, unknown>;
  const direct = source.message ?? source.error ?? source.detail;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  if (Array.isArray(direct)) {
    const text = direct.filter((item) => typeof item === "string").join(", ").trim();
    if (text) return text;
  }

  const data = source.data && typeof source.data === "object"
    ? (source.data as Record<string, unknown>)
    : null;
  const dataMessage = data?.message;
  if (typeof dataMessage === "string" && dataMessage.trim()) return dataMessage.trim();
  if (Array.isArray(dataMessage)) {
    const text = dataMessage.filter((item) => typeof item === "string").join(", ").trim();
    if (text) return text;
  }

  const errors = Array.isArray(source.errors) ? source.errors : [];
  const normalizedErrors = errors
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry === "object") {
        const msg = (entry as Record<string, unknown>).message;
        return typeof msg === "string" ? msg.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
  return normalizedErrors.length > 0 ? normalizedErrors.join(", ") : null;
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const backendUrl = getBackendLoginUrl();
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend login URL not configured" }, { status: 500 }),
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

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payloadToSend),
      cache: "no-store",
    });

    const responseText = await backendResponse.text();
    const contentType = backendResponse.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: `Authentication service error: ${backendResponse.status} ${backendResponse.statusText}`,
          },
          { status: backendResponse.ok ? 502 : backendResponse.status }
        ),
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

    if (!backendResponse.ok) {
      const backendMessage = extractBackendErrorMessage(responseData);
      const fallbackMessage =
        backendResponse.status === 400
          ? "Validation failed. Ensure email and password are provided in the expected format."
          : `Authentication service error: ${backendResponse.status} ${backendResponse.statusText}`;

      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: backendMessage ?? fallbackMessage,
            ...(responseData && typeof responseData === "object" ? { data: responseData } : {}),
          },
          { status: backendResponse.status }
        ),
        req
      );
    }

    const response = NextResponse.json(responseData, { status: backendResponse.status });

    const data = responseData && typeof responseData.data === "object"
      ? (responseData.data as Record<string, unknown>)
      : null;
    const tokens = data && typeof data.tokens === "object"
      ? (data.tokens as Record<string, unknown>)
      : null;

    const accessToken =
      pickToken(tokens, ["accessToken", "access_token", "token"]) ||
      pickToken(data, ["accessToken", "access_token", "token"]) ||
      pickToken(responseData, ["accessToken", "access_token", "token"]);
    const refreshToken =
      pickToken(tokens, ["refreshToken", "refresh_token"]) ||
      pickToken(data, ["refreshToken", "refresh_token"]) ||
      pickToken(responseData, ["refreshToken", "refresh_token"]);

    if (!accessToken) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: "Authentication succeeded but no access token was returned by the authentication service",
          },
          { status: 502 }
        ),
        req
      );
    }

    response.cookies.set({
      name: BACKEND_TOKEN_COOKIE,
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

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
  } catch (error) {
    console.error("Login proxy error:", error);
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

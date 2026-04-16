import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_TOKEN_COOKIE,
  BACKEND_REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  REMEMBER_ME_COOKIE,
} from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendLoginUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/auth/login`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl;
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/auth/login");
  }

  return null;
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

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const backendLoginUrl = getBackendLoginUrl();
    if (!backendLoginUrl) {
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

    const backendResponse = await fetch(backendLoginUrl, {
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
      const accessToken = typeof tokens.accessToken === "string" ? tokens.accessToken : "";
      const refreshToken = typeof tokens.refreshToken === "string" ? tokens.refreshToken : "";

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

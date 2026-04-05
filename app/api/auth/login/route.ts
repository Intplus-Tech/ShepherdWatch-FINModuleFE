import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  BACKEND_TOKEN_COOKIE,
  BACKEND_REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { refreshStore } from "@/lib/refresh-store";
import { randomUUID } from "crypto";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { createCsrfToken, setCsrfCookie } from "@/lib/csrf";

const LoginSchema = z.strictObject({
  email: z.email({ message: "Please enter a valid email address" })
    .min(1, "Email is required")
    .trim(),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  rememberMe: z.boolean().optional(),
});


const BackendUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
});

const BackendSuccessSchema = z.object({
  success: z.literal(true),
  statusCode: z.number().optional(),
  message: z.string().optional(),
  data: z.object({
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    token: z.string().optional(),
    user: BackendUserSchema.optional(),
  }),
});

const BackendErrorSchema = z.object({
  success: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});

const BACKEND_TIMEOUT_MS = 150000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRequiredEnv(name: "JWT_SECRET" | "BACKEND_API_URL"): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function getBackendLoginUrl(): string {
  const explicitUrl = process.env.BACKEND_LOGIN_URL;
  const baseUrl = getRequiredEnv("BACKEND_API_URL").replace(/\/+$/, "");
  const url = explicitUrl ?? `${baseUrl}/auth/login`;
  if (process.env.NODE_ENV === "production" && url.startsWith("http://")) {
    throw new Error("BACKEND_LOGIN_URL must use https in production");
  }
  return url.replace(/\/+$/, "");
}

function getErrorMessage(payload: unknown, fallback: string): string {
  const parsed = BackendErrorSchema.safeParse(payload);
  return parsed.success && parsed.data.message ? parsed.data.message : fallback;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function hitRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
}
function logAuthEvent(details: Record<string, unknown>) {
  console.info(JSON.stringify({ event: "auth.login", ...details }));
}

export async function POST(req: NextRequest) {
  try {
    getRequiredEnv("JWT_SECRET");
    const backendLoginUrl = getBackendLoginUrl();

    if (!isOriginAllowed(req)) {
      logAuthEvent({ status: "blocked", reason: "invalid_origin" });
      return applyCors(
        NextResponse.json(
        { success: false, message: "Invalid request origin" },
        { status: 403 }
        ),
        req
      );
    }

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? "";
    if (hitRateLimit(ip)) {
      logAuthEvent({ status: "blocked", reason: "rate_limited", ip, userAgent });
      return applyCors(
        NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { status: 429 }
        ),
        req
      );
    }

    const rawBody = await req.json().catch(() => null);

    const parsedBody = LoginSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      logAuthEvent({ status: "failed", reason: "invalid_body", ip, userAgent });
      return applyCors(
        NextResponse.json(
        {
          success: false,
          message: parsedBody.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 }
        ),
        req
      );
    }

    const { email, password } = parsedBody.data;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    let backendResponse: Response;

    try {
      backendResponse = await fetch(backendLoginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);

      const isAbortError =
        error instanceof Error && error.name === "AbortError";

      logAuthEvent({ status: "failed", reason: "backend_unreachable", ip, userAgent });
      return applyCors(
        NextResponse.json(
        {
          success: false,
          message: isAbortError
            ? "Authentication service timed out. Please try again."
            : "Unable to reach authentication service. Please try again.",
        },
        { status: 502 }
        ),
        req
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const backendPayload = await backendResponse.json().catch(() => null);

    if (backendResponse.status === 400) {
      logAuthEvent({ status: "failed", reason: "backend_bad_request", ip, userAgent, email });
      return applyCors(
        NextResponse.json(
        {
          success: false,
          message: getErrorMessage(backendPayload, "Invalid request"),
        },
        { status: 400 }
        ),
        req
      );
    }

    if (backendResponse.status === 401) {
      logAuthEvent({ status: "failed", reason: "invalid_credentials", ip, userAgent, email });
      return applyCors(
        NextResponse.json(
        {
          success: false,
          message: getErrorMessage(backendPayload, "Invalid credentials"),
        },
        { status: 401 }
        ),
        req
      );
    }

    if (!backendResponse.ok) {
      logAuthEvent({ status: "failed", reason: "backend_error", ip, userAgent, email, backendStatus: backendResponse.status });
      return applyCors(
        NextResponse.json(
        {
          success: false,
          message: getErrorMessage(
            backendPayload,
            "Authentication failed. Please try again later."
          ),
        },
        { status: backendResponse.status || 500 }
        ),
        req
      );
    }

    const parsedBackendSuccess = BackendSuccessSchema.safeParse(backendPayload);

    if (!parsedBackendSuccess.success) {
      logAuthEvent({ status: "failed", reason: "invalid_backend_payload", ip, userAgent, email });
      return applyCors(
        NextResponse.json(
        {
          success: false,
          message: "Invalid response received from authentication service",        },
        { status: 502 }
        ),
        req
      );
    }

    const {
      accessToken,
      refreshToken: backendRefreshToken,
      token,
      user,
    } = parsedBackendSuccess.data.data;
    const backendToken = accessToken ?? token;

    if (!backendToken) {
      logAuthEvent({ status: "failed", reason: "missing_access_token", ip, userAgent, email });
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: "Authentication response missing access token",
          },
          { status: 502 }
        ),
        req
      );
    }

    let userId = "unknown";
    const tokenParts = backendToken.split(".");
    if (tokenParts.length === 3) {
      try {
        const payloadStr = Buffer.from(tokenParts[1], "base64").toString("utf-8");
        const payloadObj = JSON.parse(payloadStr);
        if (payloadObj.userId) userId = payloadObj.userId;
      } catch (e) {
        // ignore
      }
    }

    const sessionUser = {
      id: user?.id || userId,
      email: user?.email || email,
      name: user?.name || "User",
      role: user?.role || "user",
    };

    const accessTokenId = randomUUID();
    const refreshTokenId = randomUUID();
    const frontendToken = signAccessToken(sessionUser, accessTokenId);
    const refreshToken = signRefreshToken(sessionUser, refreshTokenId);

    await refreshStore.add(
      refreshTokenId,
      sessionUser.id,
      Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000
    );

    const csrfToken = createCsrfToken();

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: sessionUser,
          token: frontendToken,
        },
      },
      { status: 200 }
    );

    setCsrfCookie(response, csrfToken);

    response.cookies.set({
      name: BACKEND_TOKEN_COOKIE,
      value: backendToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    if (backendRefreshToken) {
      response.cookies.set({
        name: BACKEND_REFRESH_TOKEN_COOKIE,
        value: backendRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }

    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: frontendToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    logAuthEvent({ status: "success", ip, userAgent, userId: sessionUser.id, email });

    return applyCors(response, req);
  } catch (error) {
    console.error("Login route error:", error);

    logAuthEvent({ status: "failed", reason: "server_error" });

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

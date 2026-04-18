import { NextRequest, NextResponse } from "next/server";
import { REMEMBER_ME_COOKIE } from "@/lib/auth-config";
import { getAuthEndpoint } from "@/lib/backend-auth-url";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendRegisterUrls(): string[] {
  const urls: string[] = [];
  const explicit = process.env.BACKEND_REGISTER_URL?.trim().replace(/\/+$/, "");
  if (explicit) {
    urls.push(explicit);
  }

  const derived = getAuthEndpoint("register");
  if (derived) {
    urls.push(derived);
  }

  const fallbackBase = process.env.BACKEND_API_URL?.trim();
  if (fallbackBase) {
    const normalized = fallbackBase.replace(/\/+$/, "").replace(/\/api-docs(?:\/.*)?$/i, "");
    if (normalized) {
      urls.push(normalized.endsWith("/api/v1") ? `${normalized}/auth/register` : `${normalized}/api/v1/auth/register`);
      urls.push(`${normalized}/auth/register`);
    }
  }

  return Array.from(new Set(urls));
}

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
};

function normalizeRegisterPayload(body: unknown): RegisterPayload | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;

  const firstName = String(source.firstName ?? "").trim();
  const lastName = String(source.lastName ?? "").trim();
  const email = String(source.email ?? "").trim().toLowerCase();
  const password = String(source.password ?? "");
  const phone = String(source.phone ?? "").trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordOk =
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);

  if (firstName.length < 2 || lastName.length < 2 || !emailOk || !passwordOk) {
    return null;
  }

  return {
    firstName,
    lastName,
    email,
    password,
    ...(phone ? { phone } : {}),
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const backendUrls = getBackendRegisterUrls();
    if (backendUrls.length === 0) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend register URL not configured" }, { status: 500 }),
        req
      );
    }

    const rawText = await req.text();
    let rememberMe: boolean | undefined;
    let forwardPayload: RegisterPayload | null = null;

    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      if (parsed && typeof parsed === "object") {
        const parsedRecord = parsed as Record<string, unknown>;
        rememberMe = Boolean(parsedRecord.rememberMe);
        const rest = { ...parsedRecord };
        delete rest.rememberMe;
        forwardPayload = normalizeRegisterPayload(rest);
      }
    } catch {
      forwardPayload = null;
    }

    if (!forwardPayload) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid payload. firstName, lastName, valid email, and password (min 8 with upper/lower/number) are required.",
          },
          { status: 400 }
        ),
        req
      );
    }

    let backendRes: Response | null = null;
    let lastErrorMessage = "fetch failed";
    let attemptedUrl = "";
    for (const backendUrl of backendUrls) {
      attemptedUrl = backendUrl;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const candidate = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(forwardPayload),
          cache: "no-store",
          signal: controller.signal,
        });
        backendRes = candidate;
        if (![404, 405, 502, 503, 504].includes(candidate.status)) {
          break;
        }
      } catch (err) {
        lastErrorMessage = err instanceof Error ? err.message : "fetch failed";
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!backendRes) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: `Unable to complete registration: ${lastErrorMessage}`,
            detail: `Attempted URLs: ${backendUrls.join(", ")}`,
          },
          { status: 502 }
        ),
        req
      );
    }

    const responseText = await backendRes.text();
    const contentType = backendRes.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      const fallbackMessage = responseText?.trim() || backendRes.statusText || "Registration failed";
      return applyCors(
        NextResponse.json(
          {
            success: backendRes.ok,
            message: fallbackMessage,
            detail: `Backend URL: ${attemptedUrl}`,
          },
          { status: backendRes.status }
        ),
        req
      );
    }

    let responseData: Record<string, unknown> | null = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid response received from authentication service",
            detail: `Backend URL: ${attemptedUrl}`,
          },
          { status: 502 }
        ),
        req
      );
    }

    const response = NextResponse.json(responseData, { status: backendRes.status });
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
        { success: false, message: "Server error occurred while registering user" },
        { status: 502 }
      ),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthEndpoint } from "@/lib/backend-auth-url";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendVerifyEmailUrls(): string[] {
  const urls: string[] = [];

  const verifyUrl = getAuthEndpoint("verify-email");
  if (verifyUrl) {
    urls.push(verifyUrl);
    if (verifyUrl.includes("/api/v1/auth/verify-email")) {
      urls.push(verifyUrl.replace("/api/v1/auth/verify-email", "/api/v1/identity/auth/verify-email"));
    } else if (verifyUrl.includes("/api/v1/identity/auth/verify-email")) {
      urls.push(verifyUrl.replace("/api/v1/identity/auth/verify-email", "/api/v1/auth/verify-email"));
    }
  }

  const fallbackBase = process.env.BACKEND_API_URL?.trim();
  if (fallbackBase) {
    const normalized = fallbackBase.replace(/\/+$/, "").replace(/\/api-docs(?:\/.*)?$/i, "");
    if (normalized) {
      if (normalized.endsWith("/api/v1")) {
        urls.push(`${normalized}/auth/verify-email`);
        urls.push(`${normalized}/identity/auth/verify-email`);
      } else {
        urls.push(`${normalized}/api/v1/auth/verify-email`);
        urls.push(`${normalized}/api/v1/identity/auth/verify-email`);
      }
    }
  }

  return Array.from(new Set(urls));
}

type VerifyEmailPayload = {
  email: string
  code: string
}
const AUTH_REQUEST_TIMEOUT_MS = 7000;

function normalizeVerifyEmailPayload(body: unknown): VerifyEmailPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const email = String(source.email ?? "").trim().toLowerCase()
  const code = String(source.code ?? "").trim()
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk || code.length !== 6) return null
  return { email, code }
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
    let payloadToSend: VerifyEmailPayload | null = null
    try {
      const parsed = rawText ? JSON.parse(rawText) : null
      payloadToSend = normalizeVerifyEmailPayload(parsed)
    } catch {
      payloadToSend = null
    }

    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid payload. Email and 6-digit code are required." },
          { status: 400 }
        ),
        req
      );
    }

    const backendUrls = getBackendVerifyEmailUrls();
    if (backendUrls.length === 0) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    let backendRes: Response | null = null;
    let lastNetworkError: unknown = null;
    for (const backendUrl of backendUrls) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);
      try {
        const candidate = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payloadToSend),
          cache: "no-store",
          signal: controller.signal,
        });
        backendRes = candidate;
      } catch (err) {
        lastNetworkError = err;
        continue;
      } finally {
        clearTimeout(timeoutId);
      }

      if (backendRes && ![404, 405, 502, 503, 504].includes(backendRes.status)) break;
    }

    if (!backendRes) {
      const message =
        lastNetworkError instanceof Error
          ? lastNetworkError.message
          : "Verification service is currently unavailable";
      return applyCors(
        NextResponse.json(
          { success: false, message: `Unable to reach verification service: ${message}` },
          { status: 502 }
        ),
        req
      );
    }

    const responseText = await backendRes.text();
    const contentType = backendRes.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      try {
        const responseData = responseText ? JSON.parse(responseText) : null;
        return applyCors(NextResponse.json(responseData, { status: backendRes.status }), req);
      } catch {
        return applyCors(
          NextResponse.json(
            { success: false, message: "Invalid response received from authentication service" },
            { status: 502 }
          ),
          req
        );
      }
    }

    return applyCors(
      new NextResponse(responseText, {
        status: backendRes.status,
        headers: contentType ? { "Content-Type": contentType } : undefined,
      }),
      req
    );
  } catch {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Server error occurred while verifying email" },
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

import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendCheckEmailUrls(): string[] {
  const urls = [
    getBackendUrl(`${API_V1}/auth/check-email`),
    getBackendUrl("auth/check-email"),
  ].filter((u): u is string => Boolean(u));
  return Array.from(new Set(urls));
}

function normalizeEmail(value: string | null): string {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const email = normalizeEmail(req.nextUrl.searchParams.get("email"));
    if (!isValidEmail(email)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid email format." }, { status: 400 }),
        req
      );
    }

    const backendUrls = getBackendCheckEmailUrls();
    if (backendUrls.length === 0) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    let response: Response | null = null;
    try {
      for (const backendUrl of backendUrls) {
        const candidate = await fetch(`${backendUrl}?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });
        response = candidate;
        if (candidate.status !== 404) break;
      }
    } catch {
      return applyCors(
        NextResponse.json(
          {
            success: true,
            message: "Email validation is temporarily unavailable.",
            data: { exists: false, validationSkipped: true },
          },
          { status: 200 }
        ),
        req
      );
    }
    if (!response) {
      return applyCors(
        NextResponse.json(
          {
            success: true,
            message: "Email validation is temporarily unavailable.",
            data: { exists: false, validationSkipped: true },
          },
          { status: 200 }
        ),
        req
      );
    }

    if (response.status === 404) {
      return applyCors(
        NextResponse.json(
          {
            success: true,
            message: "Email validation is temporarily unavailable.",
            data: { exists: false, validationSkipped: true },
          },
          { status: 200 }
        ),
        req
      );
    }

    const responseText = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      try {
        const responseData = responseText ? JSON.parse(responseText) : null;
        return applyCors(NextResponse.json(responseData, { status: response.status }), req);
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
        status: response.status,
        headers: contentType ? { "Content-Type": contentType } : undefined,
      }),
      req
    );
  } catch {
    return applyCors(
      NextResponse.json({
        success: true,
        message: "Email validation is temporarily unavailable.",
        data: { exists: false, validationSkipped: true },
      }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

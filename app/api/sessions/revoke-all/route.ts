import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendRevokeAllUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/sessions/revoke-all`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/sessions/revoke-all");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/sessions/revoke-all");
  }

  return null;
}

type RevokeAllPayload = {
  currentSessionId?: string
}

function normalizePayload(body: unknown): RevokeAllPayload | null {
  if (!body || typeof body !== "object") return {};
  const source = body as Record<string, unknown>;
  const currentSessionId = String(source.currentSessionId ?? "").trim();
  if (!currentSessionId) return {};
  return { currentSessionId };
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const accessToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthorized. Please log in again." }, { status: 401 }),
        req
      );
    }

    const backendUrl = getBackendRevokeAllUrl();
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const rawText = await req.text();
    let payloadToSend: RevokeAllPayload = {};
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      payloadToSend = normalizePayload(parsed) ?? {};
    } catch {
      payloadToSend = {};
    }

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payloadToSend),
      cache: "no-store",
    });

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
            { success: false, message: "Invalid response received from session service" },
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
        { success: false, message: "Server error occurred while revoking sessions." },
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

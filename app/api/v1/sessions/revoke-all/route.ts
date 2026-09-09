import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";
import { executeWithRefreshRetry } from "@/lib/backend-refresh";

function getBackendRevokeAllUrl(): string | null {
  return getBackendUrl(`${API_V1}/sessions/revoke-all`);
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

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendRes } = await executeWithRefreshRetry(req, (accessToken) =>
      fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payloadToSend),
        cache: "no-store",
      })
    )

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

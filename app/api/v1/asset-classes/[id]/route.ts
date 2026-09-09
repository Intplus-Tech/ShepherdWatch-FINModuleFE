import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh";
function getBackendAssetClassUrl(id: string): string | null {
  const baseUrl = getBackendApiUrl();
  if (!baseUrl) return null;
  return `${baseUrl}/asset-classes/${encodeURIComponent(id)}`;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const { id } = await context.params;
    if (!id?.trim()) {
      return applyCors(
        NextResponse.json({ success: false, message: "Asset class id is required." }, { status: 400 }),
        req
      );
    }

    const backendUrl = getBackendAssetClassUrl(id);
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendRes } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
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
            { success: false, message: "Invalid response received from asset class service" },
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
        { success: false, message: "Server error occurred while fetching asset class details." },
        { status: 502 }
      ),
      req
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const { id } = await context.params;
    if (!id?.trim()) {
      return applyCors(
        NextResponse.json({ success: false, message: "Asset class id is required." }, { status: 400 }),
        req
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 }),
        req
      );
    }

    const backendUrl = getBackendAssetClassUrl(id);
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendRes } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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
            { success: false, message: "Invalid response received from asset class service" },
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
        { success: false, message: "Server error occurred while updating asset class." },
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

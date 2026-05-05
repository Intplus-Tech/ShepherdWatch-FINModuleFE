import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";

import { getBackendApiUrl } from "@/lib/env"
function getBackendBranchesSummaryUrl(): string {
  const baseUrl = getBackendApiUrl();
  if (!baseUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  return `${baseUrl}/branches/summary`;
}

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(getBackendBranchesSummaryUrl(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    );

    const responseText = await backendRes.text();
    const contentType = backendRes.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      try {
        const responseData = responseText ? JSON.parse(responseText) : null;
        const response = NextResponse.json(responseData, { status: backendRes.status });
        applyAuthCookies(response, refreshedTokens);
        return applyCors(response, req);
      } catch {
        return applyCors(
          NextResponse.json(
            { success: false, message: "Invalid response received from branches summary service" },
            { status: 502 }
          ),
          req
        );
      }
    }

    const response = new NextResponse(responseText, {
      status: backendRes.status,
      headers: contentType ? { "Content-Type": contentType } : undefined,
    });
    applyAuthCookies(response, refreshedTokens);
    return applyCors(response, req);
  } catch (error) {
    console.error("Branches summary proxy error:", error);
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

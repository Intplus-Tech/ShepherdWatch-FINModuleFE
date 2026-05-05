import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";

function getBackendUrl(searchParams: URLSearchParams): string {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  const queryString = searchParams.toString();
  return `${baseUrl}/api/v1/dashboard/income-distribution${queryString ? `?${queryString}` : ""}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const { searchParams } = new URL(req.url);
    const backendUrl = getBackendUrl(searchParams);

    const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl, {
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
            { success: false, message: "Invalid response received from income distribution service" },
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
    console.error("Dashboard income-distribution proxy error:", error);
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

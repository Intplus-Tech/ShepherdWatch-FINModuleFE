import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";
import { executeWithRefreshRetry } from "@/lib/backend-refresh";

function getBackendAuditLogsUrl(): string | null {
  return getBackendUrl(`${API_V1}/audit-logs`);
}

function buildQuery(searchParams: URLSearchParams): string {
  const query = new URLSearchParams();
  const limit = searchParams.get("limit") || searchParams.get("size");
  const page = searchParams.get("page");
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const search = searchParams.get("search");

  if (page) query.set("page", page);
  if (limit) query.set("limit", limit);
  if (action) query.set("action", action);
  if (userId) query.set("userId", userId);
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);
  if (search) query.set("search", search);

  return query.toString();
}

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const backendUrl = getBackendAuditLogsUrl();
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const query = buildQuery(req.nextUrl.searchParams);
    const url = query ? `${backendUrl}?${query}` : backendUrl;

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendRes } = await executeWithRefreshRetry(req, (accessToken) =>
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
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
            { success: false, message: "Invalid response received from audit service" },
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
      NextResponse.json({ success: false, message: "Server error occurred while fetching audit logs." }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

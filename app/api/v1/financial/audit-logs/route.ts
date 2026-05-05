import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

import { getBackendApiUrl } from "@/lib/env"
function getBackendAuditLogsUrl(): string {
  const baseUrl = getBackendApiUrl();
  if (!baseUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  return `${baseUrl}/audit-logs`;
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

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      );
    }

    const query = buildQuery(req.nextUrl.searchParams);
    const backendUrl = getBackendAuditLogsUrl();
    const url = query ? `${backendUrl}?${query}` : backendUrl;

    const backendResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await backendResponse.json().catch(() => null);
    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: payload?.message ?? "Unable to fetch audit logs" },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Get audit logs proxy error:", error);
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

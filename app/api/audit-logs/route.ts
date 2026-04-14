import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders } from "@/lib/cors";

function getBackendAuditLogsUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/audit-logs`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/audit-logs");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/audit-logs");
  }

  return null;
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return applyCors(
      NextResponse.json({ success: false, message: "Unauthorized. Please log in again." }, { status: 401 }),
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

  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  ["page", "limit", "action", "userId", "startDate", "endDate", "search"].forEach((key) => {
    const val = searchParams.get(key);
    if (val !== null && val !== "") query.set(key, val);
  });
  const url = query.toString() ? `${backendUrl}?${query}` : backendUrl;

  const backendRes = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
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
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

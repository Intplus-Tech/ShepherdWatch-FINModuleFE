import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders } from "@/lib/cors";

function getBackendHeaderFooterTypeUrl(type: string): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/templates/header-footer/${type}`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", `/templates/header-footer/${type}`);
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, `/templates/header-footer/${type}`);
  }

  return null;
}

export async function GET(req: NextRequest, context: { params: Promise<{ type: string }> }) {
  const accessToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return applyCors(
      NextResponse.json({ success: false, message: "Unauthorized. Please log in again." }, { status: 401 }),
      req
    );
  }

  const { type } = context.params;
  const backendUrl = getBackendHeaderFooterTypeUrl(type);
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  const backendRes = await fetch(backendUrl, {
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
          { success: false, message: "Invalid response received from template service" },
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

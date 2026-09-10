import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";
import { executeWithRefreshRetry } from "@/lib/backend-refresh";

function getBackendTemplatePurposesUrl(): string | null {
  return getBackendUrl("templates/purposes");
}

export async function POST(req: NextRequest) {
  const backendUrl = getBackendTemplatePurposesUrl();
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  const rawText = await req.text();

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
      body: rawText,
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

export async function GET(req: NextRequest) {
  const backendUrl = getBackendTemplatePurposesUrl();
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  ["page", "limit"].forEach((key) => {
    const val = searchParams.get(key);
    if (val !== null && val !== "") query.set(key, val);
  });
  const url = query.toString() ? `${backendUrl}?${query}` : backendUrl;

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

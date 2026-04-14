import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendTenantUrl(id: string): string {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  return `${baseUrl}/v1/branches/${encodeURIComponent(id)}`;
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
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

    const branchId = context.params.id;
    const backendUrl = getBackendTenantUrl(branchId);
    
    // Some routes might use body parsing
    const textBody = await req.text();

    const backendResponse = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: textBody || "{}",
      cache: "no-store",
    });

    const bodyText = await backendResponse.text();
    let payload;
    try {
      payload = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to update branch",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req);
  } catch (error) {
    console.error("Update branch proxy error:", error);
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

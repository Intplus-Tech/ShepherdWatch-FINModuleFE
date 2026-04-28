import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";

function getBackendUrl() {
  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;
  // Replace auth/login with core/users/invite
  return loginUrl.replace("/auth/login", "/core/users/invite");
}

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }), req);
  }

  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return applyCors(NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }), req);
  }

  try {
    const body = await req.json().catch(() => null);

    const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
    );

    const responseData = await backendRes.json().catch(() => null);

    let response: NextResponse;
    if (!backendRes.ok) {
      response = NextResponse.json(
        { success: false, message: responseData?.message || "Failed to invite user" },
        { status: backendRes.status }
      );
    } else {
      response = NextResponse.json(responseData, { status: 201 });
    }

    applyAuthCookies(response, refreshedTokens);
    return applyCors(response, req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while inviting user" }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";
import { executeWithRefreshRetry } from "@/lib/backend-refresh"

// The backend serves the current user under /auth/me; there is no
// /users/profile route (Express would match it as GET /users/:id with
// id = "profile" and reject it as a malformed ObjectId).
function getBackendUserUrl() {
  return getBackendUrl(`${API_V1}/auth/me`);
}

export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    );
  }

  const backendUrl = getBackendUserUrl();
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  try {
    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendRes } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(backendUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
      })
    )

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: responseData?.message || "Failed to fetch user profile" },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(responseData, { status: 200 }), req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while fetching profile" }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

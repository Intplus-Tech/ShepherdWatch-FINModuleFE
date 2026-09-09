import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";
import { executeWithRefreshRetry } from "@/lib/backend-refresh"

function getBackendUserUrl(userId: string) {
  return getBackendUrl(`${API_V1}/users/${userId}/role`);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    );
  }

  const backendUrl = getBackendUserUrl((await params).userId);
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  try {
    const body = await req.json().catch(() => null);

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendRes } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(backendUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify(body),
      })
    )

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: responseData?.message || "Failed to update user role" },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(responseData, { status: 200 }), req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while updating role" }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

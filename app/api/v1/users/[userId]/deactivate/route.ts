import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendUserUrl(userId: string) {
  return getBackendUrl(`${API_V1}/users/${userId}/deactivate`);
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

  const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
  if (!backendToken) {
    return applyCors(
      NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }),
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
    const backendRes = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    });

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: responseData?.message || "Failed to deactivate user" },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(NextResponse.json({ success: true, message: responseData?.message || "User deactivated successfully", data: responseData?.data }, { status: 200 }), req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while deactivating user" }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

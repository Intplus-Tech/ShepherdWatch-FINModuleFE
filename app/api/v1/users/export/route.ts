import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";
import { executeWithRefreshRetry } from "@/lib/backend-refresh"

function getBackendUserUrl() {
  return getBackendUrl(`${API_V1}/users/export`);
}

export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }), req);
  }

  const backendUrlBase = getBackendUserUrl();
  if (!backendUrlBase) {
    return applyCors(NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }), req);
  }

  const { searchParams } = req.nextUrl;
  const backendUrl = new URL(backendUrlBase);
  searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  try {
    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendRes } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(backendUrl.toString(), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
      })
    )

    if (!backendRes.ok) {
      const responseData = await backendRes.json().catch(() => null);
      return applyCors(
        NextResponse.json(
          { success: false, message: responseData?.message || "Failed to export users" },
          { status: backendRes.status }
        ),
        req
      );
    }
    
    // The response could be a file (CSV or JSON). 
    // The API contract says: application/json or similar JSON data 
    // responses: 200: description: User export data.
    const data = await backendRes.json();

    return applyCors(NextResponse.json(data, { status: 200 }), req);
  } catch {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while exporting users" }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

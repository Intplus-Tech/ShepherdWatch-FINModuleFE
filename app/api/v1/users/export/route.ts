import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendUserUrl() {
  return getBackendUrl("api/v1/users/export");
}

export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }), req);
  }

  const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
  if (!backendToken) {
    return applyCors(NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }), req);
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
    const backendRes = await fetch(backendUrl.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    });

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

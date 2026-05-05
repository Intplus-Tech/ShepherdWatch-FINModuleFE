import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { applyAuthCookies, executeWithRefreshRetry } from "@/lib/backend-refresh";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendUserUrl() {
  return getBackendUrl(`${API_V1}/users`);
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
    const { res: backendRes, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl.toString(), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    );

    const responseData = await backendRes.json().catch(() => null);

    let response: NextResponse;
    if (!backendRes.ok) {
      response = NextResponse.json(
        { success: false, message: responseData?.message || "Failed to fetch users" },
        { status: backendRes.status }
      );
    } else {
      response = NextResponse.json(responseData, { status: 200 });
    }

    applyAuthCookies(response, refreshedTokens);
    return applyCors(response, req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while fetching users" }, { status: 502 }),
      req
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }), req);
  }

  const backendUrl = getBackendUserUrl();
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
        { success: false, message: responseData?.message || "Failed to create user" },
        { status: backendRes.status }
      );
    } else {
      response = NextResponse.json(responseData, { status: 200 });
    }

    applyAuthCookies(response, refreshedTokens);
    return applyCors(response, req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while creating user" }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

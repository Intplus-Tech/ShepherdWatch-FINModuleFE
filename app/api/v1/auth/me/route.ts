import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { fetchBackendMe, getBackendMeUrls } from "@/lib/backend-auth-me";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const accessToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthorized. Please log in again." }, { status: 401 }),
        req
      );
    }

    const backendUrls = getBackendMeUrls();
    if (backendUrls.length === 0) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    console.debug(`[${API_V1}/auth/me] backendUrls: ${backendUrls.length}, token length: ${accessToken.length}`);
    const backendRes = await fetchBackendMe(accessToken);
    if (!backendRes) {
      console.warn(`[${API_V1}/auth/me] No backend response`);
      return applyCors(
        NextResponse.json({ success: false, message: "Backend unavailable - continuing with cookie auth" }, { status: 200 }),
        req
      );
    }
    console.debug(`[${API_V1}/auth/me] backend status: ${backendRes.status}`);

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
            { success: false, message: "Invalid response received from authentication service" },
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
  } catch {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Server error occurred while fetching profile" },
        { status: 502 }
      ),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

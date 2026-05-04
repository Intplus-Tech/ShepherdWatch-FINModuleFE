import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendUserUrl(userId: string) {
  return getBackendUrl(`core/users/${userId}`);
}

export async function GET(
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
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    });

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: responseData?.message || "Failed to fetch user by id" },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(responseData, { status: 200 }), req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while fetching user" }, { status: 502 }),
      req
    );
  }
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
    const body = await req.json().catch(() => null);

    const backendRes = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: responseData?.message || "Failed to update user" },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(NextResponse.json(responseData, { status: 200 }), req);
  } catch (error) {
    return applyCors(
      NextResponse.json({ success: false, message: "Server error occurred while updating user" }, { status: 502 }),
      req
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

export async function POST(req: NextRequest) {
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
      NextResponse.json(
        { success: false, message: "Unauthorized. Please log in again." },
        { status: 401 }
      ),
      req
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.oldPassword || !body.newPassword) {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      ),
      req
    );
  }

  const baseUrl = process.env.BACKEND_LOGIN_URL?.replace("/login", "/change-password");
  if (!baseUrl) {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 }
      ),
      req
    );
  }

  try {
    const backendRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify({
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
      }),
    });

    const responseData = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: responseData?.message || "Failed to change password. Please try again.",
          },
          { status: backendRes.status }
        ),
        req
      );
    }

    return applyCors(
      NextResponse.json(
        { success: true, message: responseData?.message || "Password changed successfully" },
        { status: 200 }
      ),
      req
    );
  } catch (error) {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Server error occurred while changing password" },
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

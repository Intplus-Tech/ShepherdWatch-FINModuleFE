import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";
import { getBackendUrl } from "@/lib/backend-auth-url";

function getBackendChangePasswordUrl(): string | null {
  return getBackendUrl("api/v1/auth/change-password");
}

type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

function normalizePayload(body: unknown): ChangePasswordPayload | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;
  const currentPassword = String(source.currentPassword ?? "");
  const newPassword = String(source.newPassword ?? "");
  const passwordOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword);
  if (!currentPassword || !passwordOk) return null;
  return { currentPassword, newPassword };
}

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    );
  }

  const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value;
  if (!backendToken) {
    return applyCors(
      NextResponse.json({ success: false, message: "Unauthorized. Please log in again." }, { status: 401 }),
      req
    );
  }

  const backendUrl = getBackendChangePasswordUrl();
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    );
  }

  try {
    const rawText = await req.text();
    let payloadToSend: ChangePasswordPayload | null = null;
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      payloadToSend = normalizePayload(parsed);
    } catch {
      payloadToSend = null;
    }

    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid payload. Provide currentPassword and a strong newPassword (min 8 with uppercase, lowercase, and number).",
          },
          { status: 400 }
        ),
        req
      );
    }

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify(payloadToSend),
      cache: "no-store",
    });

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

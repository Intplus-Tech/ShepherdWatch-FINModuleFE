import { NextRequest, NextResponse } from "next/server";
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendProfileUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/auth/profile`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/auth/profile");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/profile");
  }

  return null;
}

type UpdateProfilePayload = {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}

function normalizeUpdateProfilePayload(body: unknown): UpdateProfilePayload | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;

  const firstName = String(source.firstName ?? "").trim();
  const lastName = String(source.lastName ?? "").trim();
  const phone = String(source.phone ?? "").trim();
  const avatar = String(source.avatar ?? "").trim();

  const payload: UpdateProfilePayload = {};
  if (firstName) {
    if (firstName.length < 2) return null;
    payload.firstName = firstName;
  }
  if (lastName) {
    if (lastName.length < 2) return null;
    payload.lastName = lastName;
  }
  if (phone) payload.phone = phone;
  if (avatar) payload.avatar = avatar;

  return Object.keys(payload).length > 0 ? payload : null;
}

export async function PATCH(req: NextRequest) {
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

    const backendUrl = getBackendProfileUrl();
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const rawText = await req.text();
    let payloadToSend: UpdateProfilePayload | null = null;
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      payloadToSend = normalizeUpdateProfilePayload(parsed);
    } catch {
      payloadToSend = null;
    }

    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid payload. Provide at least one of firstName, lastName, phone, or avatar.",
          },
          { status: 400 }
        ),
        req
      );
    }

    const backendRes = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
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
        { success: false, message: "Server error occurred while updating profile" },
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

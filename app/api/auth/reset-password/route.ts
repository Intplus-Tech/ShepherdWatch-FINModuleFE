import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendResetPasswordUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/auth/reset-password`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/auth/reset-password");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/reset-password");
  }

  return null;
}

type ResetPasswordPayload = {
  email: string
  code: string
  newPassword: string
}

function normalizeResetPasswordPayload(body: unknown): ResetPasswordPayload | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;

  const email = String(source.email ?? "").trim().toLowerCase();
  const code = String(source.code ?? "").trim();
  const newPassword = String(source.newPassword ?? "");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const codeOk = /^\d{6}$/.test(code);
  const passwordOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword);

  if (!emailOk || !codeOk || !passwordOk) return null;

  return { email, code, newPassword };
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      );
    }

    const rawText = await req.text();
    let payloadToSend: ResetPasswordPayload | null = null;
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      payloadToSend = normalizeResetPasswordPayload(parsed);
    } catch {
      payloadToSend = null;
    }

    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid payload. Provide email, 6-digit code, and a strong password (min 8 with uppercase, lowercase, and number).",
          },
          { status: 400 }
        ),
        req
      );
    }

    const backendUrl = getBackendResetPasswordUrl();
    if (!backendUrl) {
      return applyCors(
        NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
        req
      );
    }

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
        { success: false, message: "Server error occurred while resetting password" },
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

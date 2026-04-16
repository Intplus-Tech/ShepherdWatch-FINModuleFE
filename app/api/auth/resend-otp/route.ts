import { NextRequest, NextResponse } from "next/server";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendResendOtpUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/auth/resend-otp`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/auth/resend-otp");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/resend-otp");
  }

  return null;
}

type ResendOtpPayload = {
  email: string
  purpose: "email_verification" | "password_reset"
}

function normalizeResendOtpPayload(body: unknown): ResendOtpPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const email = String(source.email ?? "").trim().toLowerCase()
  const purpose = String(source.purpose ?? "").trim().toLowerCase()
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk || !["email_verification", "password_reset"].includes(purpose)) {
    return null
  }
  return { email, purpose: purpose as ResendOtpPayload["purpose"] }
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
    let payloadToSend: ResendOtpPayload | null = null
    try {
      const parsed = rawText ? JSON.parse(rawText) : null
      payloadToSend = normalizeResendOtpPayload(parsed)
    } catch {
      payloadToSend = null
    }

    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid payload. Email and purpose are required." },
          { status: 400 }
        ),
        req
      );
    }

    const backendUrl = getBackendResendOtpUrl();
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
        { success: false, message: "Server error occurred while resending OTP" },
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

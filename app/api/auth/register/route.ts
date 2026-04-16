import { NextRequest, NextResponse } from "next/server";
import { REMEMBER_ME_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors";

function getBackendRegisterUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/api/v1/auth/register`;
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL;
  if (!loginUrl) return null;

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/auth/register");
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/register");
  }

  return null;
}

type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

function normalizeRegisterPayload(body: unknown): RegisterPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const firstName = String(source.firstName ?? "").trim()
  const lastName = String(source.lastName ?? "").trim()
  const email = String(source.email ?? "").trim().toLowerCase()
  const password = String(source.password ?? "")
  const phone = String(source.phone ?? "").trim()

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordOk =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)

  if (firstName.length < 2 || lastName.length < 2 || !emailOk || !passwordOk) {
    return null
  }

  return {
    firstName,
    lastName,
    email,
    password,
    ...(phone ? { phone } : {}),
  }
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
    let rememberMe: boolean | undefined;
    let forwardPayload: RegisterPayload | null = null;

    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      if (parsed && typeof parsed === "object") {
        const parsedRecord = parsed as Record<string, unknown>;
        rememberMe = Boolean(parsedRecord.rememberMe);
        const rest = { ...parsedRecord };
        delete rest.rememberMe;
        forwardPayload = normalizeRegisterPayload(rest);
      }
    } catch {
      forwardPayload = null;
    }

    if (!forwardPayload) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid payload. firstName, lastName, valid email, and password (min 8 with upper/lower/number) are required.",
          },
          { status: 400 }
        ),
        req
      );
    }

    const backendUrl = getBackendRegisterUrl();
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
      body: JSON.stringify(forwardPayload),
      cache: "no-store",
    });

    const responseText = await backendRes.text();
    const contentType = backendRes.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      try {
        const responseData = responseText ? JSON.parse(responseText) : null;
        const response = NextResponse.json(responseData, { status: backendRes.status });
        if (rememberMe !== undefined) {
          response.cookies.set({
            name: REMEMBER_ME_COOKIE,
            value: rememberMe ? "true" : "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: rememberMe ? 60 * 60 * 24 * 90 : 0,
          });
        }
        return applyCors(response, req);
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

    const response = new NextResponse(responseText, {
        status: backendRes.status,
        headers: contentType ? { "Content-Type": contentType } : undefined,
      });
    if (rememberMe !== undefined) {
      response.cookies.set({
        name: REMEMBER_ME_COOKIE,
        value: rememberMe ? "true" : "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: rememberMe ? 60 * 60 * 24 * 90 : 0,
      });
    }
    return applyCors(response, req);
  } catch {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Server error occurred while registering user" },
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

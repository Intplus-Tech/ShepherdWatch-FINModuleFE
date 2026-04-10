import { NextRequest, NextResponse } from "next/server";
import { REMEMBER_ME_COOKIE } from "@/lib/auth-config";
import { applyCors, getCorsHeaders } from "@/lib/cors";

function getBackendRegisterUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}/auth/register`;
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

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    let rememberMe: boolean | undefined;
    let forwardBody = rawText;

    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      if (parsed && typeof parsed === "object") {
        rememberMe = Boolean(parsed.rememberMe);
        // Remove rememberMe before sending to backend
        if ("rememberMe" in parsed) {
          const { rememberMe: _omit, ...rest } = parsed as Record<string, unknown>;
          forwardBody = JSON.stringify(rest);
        }
      }
    } catch {
      // keep raw body; backend will handle validation
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
      body: forwardBody,
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
  } catch (error) {
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

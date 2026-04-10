import { NextRequest, NextResponse } from "next/server"
import {
  BACKEND_REFRESH_TOKEN_COOKIE,
  BACKEND_TOKEN_COOKIE,
} from "@/lib/auth-config"
import { applyCors, getCorsHeaders } from "@/lib/cors"

function getBackendLogoutUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "")
  if (baseUrl) {
    return `${baseUrl}/auth/logout`
  }

  const loginUrl = process.env.BACKEND_LOGIN_URL
  if (!loginUrl) return null

  if (loginUrl.includes("/auth/login")) {
    return loginUrl.replace("/auth/login", "/auth/logout")
  }

  if (loginUrl.endsWith("/login")) {
    return loginUrl.replace(/\/login$/, "/logout")
  }

  return null
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
  const refreshToken = req.cookies.get(BACKEND_REFRESH_TOKEN_COOKIE)?.value

  if (!accessToken || !refreshToken) {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Unauthorized. Please log in again." },
        { status: 401 }
      ),
      req
    )
  }

  const backendUrl = getBackendLogoutUrl()
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    )
  }

  const backendRes = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  })

  const responseText = await backendRes.text()
  const contentType = backendRes.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")

  let response: NextResponse
  if (isJson) {
    try {
      const responseData = responseText ? JSON.parse(responseText) : null
      response = NextResponse.json(responseData, { status: backendRes.status })
    } catch {
      response = NextResponse.json(
        { success: false, message: "Invalid response received from authentication service" },
        { status: 502 }
      )
    }
  } else {
    response = new NextResponse(responseText, {
      status: backendRes.status,
      headers: contentType ? { "Content-Type": contentType } : undefined,
    })
  }

  response.cookies.set(BACKEND_TOKEN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  response.cookies.set(BACKEND_REFRESH_TOKEN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return applyCors(response, req)
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

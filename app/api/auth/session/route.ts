import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders } from "@/lib/cors"

function getBackendMeUrl(): string | null {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "")
  if (baseUrl) {
    return `${baseUrl}/auth/me`
  }
  return null
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
  if (!token) return applyCors(NextResponse.json({ message: "Unauthenticated" }, { status: 401 }), req)

  const backendUrl = getBackendMeUrl()
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ message: "Backend URL not configured" }, { status: 500 }),
      req
    )
  }

  const backendResponse = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  const payload = await backendResponse.json().catch(() => null)

  if (!backendResponse.ok) {
    return applyCors(
      NextResponse.json(
        { message: payload?.message ?? "Unable to fetch current user" },
        { status: backendResponse.status || 502 }
      ),
      req
    )
  }

  return applyCors(NextResponse.json(payload, { status: 200 }), req)
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers: headers ?? undefined });
}

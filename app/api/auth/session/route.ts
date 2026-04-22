import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { fetchBackendMe, getBackendMeUrls } from "@/lib/backend-auth-me"
import { applyCors, getCorsHeaders } from "@/lib/cors"

export async function GET(req: NextRequest) {
  const token = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
  if (!token) return applyCors(NextResponse.json({ message: "Unauthenticated" }, { status: 401 }), req)

  const backendUrls = getBackendMeUrls()
  if (backendUrls.length === 0) {
    return applyCors(
      NextResponse.json({ message: "Backend URL not configured" }, { status: 500 }),
      req
    )
  }

  const backendResponse = await fetchBackendMe(token)

  if (!backendResponse) {
    return applyCors(
      NextResponse.json({ message: "Unable to resolve /api/v1/auth/me endpoint" }, { status: 502 }),
      req
    )
  }

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

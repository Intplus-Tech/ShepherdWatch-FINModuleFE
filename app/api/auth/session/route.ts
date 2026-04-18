import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { getAuthEndpoint } from "@/lib/backend-auth-url"
import { applyCors, getCorsHeaders } from "@/lib/cors"

function getBackendMeUrls(): string[] {
  const urls: string[] = []
  const primaryUrl = getAuthEndpoint("me")
  if (primaryUrl) urls.push(primaryUrl)

  return Array.from(new Set(urls))
}

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

  let backendResponse: Response | null = null
  for (const backendUrl of backendUrls) {
    const candidate = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })
    backendResponse = candidate
    if (candidate.status !== 404) break
  }

  if (!backendResponse) {
    return applyCors(
      NextResponse.json({ message: "Unable to fetch current user" }, { status: 502 }),
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

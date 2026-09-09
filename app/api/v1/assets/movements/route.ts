import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"

import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"


export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request origin" },
          { status: 403 }
        ),
        req
      )
    }

    const baseUrl = getBackendApiUrl();

    const url = new URL(`${baseUrl}/assets/movements`)
    const reqUrl = new URL(req.url)
    reqUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      })
    )

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to fetch asset movements",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("List asset movements proxy error:", error)
    return applyCors(
      NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      ),
      req
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req)
  return new NextResponse(null, { status: 204, headers: headers ?? undefined })
}

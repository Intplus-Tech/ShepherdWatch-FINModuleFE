import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"

import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await req.json().catch(() => null)
    if (!body) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request body" },
          { status: 400 }
        ),
        req
      )
    }

    const { id } = await params

    const baseUrl = getBackendApiUrl();

    const url = new URL(`${baseUrl}/cash-boxes/${id}/top-up`)

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      })
    )

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to top up cash box",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Cash box top-up proxy error:", error)
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

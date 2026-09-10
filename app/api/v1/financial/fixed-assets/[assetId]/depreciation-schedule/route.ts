import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"

import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"


function buildBackendScheduleUrl(assetId: string, search: string): string {
  const baseUrl = getBackendApiUrl();
  const url = new URL(
    `${baseUrl}/financial/fixed-assets/${assetId}/depreciation-schedule`
  )
  if (search) {
    url.search = search
  }
  return url.toString()
}

export async function GET(req: NextRequest, context: { params: Promise<{ assetId: string }> }) {
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

    const assetId = (await context.params).assetId
    if (!assetId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Asset ID is required" }, { status: 400 }),
        req
      )
    }

    const backendUrl = buildBackendScheduleUrl(assetId, req.nextUrl.search)
    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(backendUrl, {
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
            message: payload?.message ?? "Unable to fetch depreciation schedule",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get depreciation schedule proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req)
  return new NextResponse(null, { status: 204, headers: headers ?? undefined })
}

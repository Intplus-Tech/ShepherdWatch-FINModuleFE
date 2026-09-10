import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"


function buildBackendAssetUrl(assetId: string): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/financial/fixed-assets/${assetId}`
}

export async function GET(req: NextRequest, context: { params: Promise<{ assetId: string }> }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
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

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(buildBackendAssetUrl(assetId), {
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
          { success: false, message: payload?.message ?? "Unable to fetch fixed asset" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get fixed asset proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ assetId: string }> }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      )
    }

    if (!isCsrfValid(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "CSRF token invalid" }, { status: 403 }),
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

    const body = await req.json().catch(() => null)

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(buildBackendAssetUrl(assetId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body ?? {}),
        cache: "no-store",
      })
    )

    const payload = await backendResponse.json().catch(() => null)
    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: payload?.message ?? "Unable to update fixed asset" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Update fixed asset proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ assetId: string }> }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      )
    }

    if (!isCsrfValid(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "CSRF token invalid" }, { status: 403 }),
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

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(buildBackendAssetUrl(assetId), {
        method: "DELETE",
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
          { success: false, message: payload?.message ?? "Unable to delete fixed asset" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload ?? { success: true }, { status: 200 }), req)
  } catch (error) {
    console.error("Delete fixed asset proxy error:", error)
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

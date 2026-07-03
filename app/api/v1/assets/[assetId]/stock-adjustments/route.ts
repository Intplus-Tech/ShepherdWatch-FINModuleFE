import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"

import { getBackendApiUrl } from "@/lib/env"


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
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

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
    if (!backendToken) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Unauthenticated" },
          { status: 401 }
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

    const { assetId } = await params

    const baseUrl = getBackendApiUrl();

    const url = new URL(`${baseUrl}/assets/${assetId}/stock-adjustments`)

    const backendResponse = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to record stock adjustment",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Record stock adjustment proxy error:", error)
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

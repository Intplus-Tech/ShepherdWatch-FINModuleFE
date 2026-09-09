import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"

import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"


function buildBackendUrl(deductionId: string): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/compliance/deductions/${deductionId}/remit`
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ deductionId: string }> }) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      )
    }

    const deductionId = (await context.params).deductionId
    if (!deductionId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Deduction ID is required" }, { status: 400 }),
        req
      )
    }

    const body = await req.json().catch(() => ({}))

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(buildBackendUrl(deductionId), {
        method: "PATCH",
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
          { success: false, message: payload?.message ?? "Unable to mark statutory deduction as remitted" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Remit statutory deduction proxy error:", error)
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

import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || !body.status) {
      return applyCors(
        NextResponse.json({ success: false, message: "Missing approval status payload." }, { status: 400 }),
        req
      )
    }

    const validStatuses = ["approved", "rejected", "revision"]
    if (!validStatuses.includes(body.status)) {
       return applyCors(
        NextResponse.json({ success: false, message: "Invalid budget status mapping." }, { status: 400 }),
        req
      )
    }

    const baseUrl = getBackendApiUrl();// Explicit binding to ${API_V1}/budgets/{id}/approve
    const { id } = await params
    const url = `${baseUrl}/budgets/${id}/approve`

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: body.status })
      })
    )

    const responseData = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: responseData?.message ?? "Failed to update budget approval status.",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(responseData, { status: 200 }), req)
  } catch (error) {
    console.error("Budget approve proxy error:", error)
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

import { API_V1 } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"

export async function GET(
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

    const baseUrl = getBackendApiUrl();// Bind tightly targeting ${API_V1}/budgets/{id}/performance
    const { id } = await params
    const url = `${baseUrl}/budgets/${id}/performance`

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          Accept: "application/json",
        },
      })
    )

    const responseData = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: responseData?.message ?? "Failed to fetch detailed budget performance",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(responseData, { status: 200 }), req)
  } catch (error) {
    console.error("Detailed budget performance proxy error:", error)
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

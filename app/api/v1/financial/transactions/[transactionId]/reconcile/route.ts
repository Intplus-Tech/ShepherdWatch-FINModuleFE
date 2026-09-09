import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"
import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"

function buildBackendReconcileUrl(transactionId: string): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/transactions/${transactionId}/verify`
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ transactionId: string }> }
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

    if (!isCsrfValid(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "CSRF token invalid" }, { status: 403 }),
        req
      )
    }

    const { transactionId } = await context.params
    if (!transactionId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Transaction ID required" }, { status: 400 }),
        req
      )
    }

    const body = await req.json().catch(() => null)
    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(buildBackendReconcileUrl(transactionId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          status: "verified",
          ...(body ?? {}),
        }),
        cache: "no-store",
      })
    )

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to reconcile transaction",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Reconcile transaction proxy error:", error)
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

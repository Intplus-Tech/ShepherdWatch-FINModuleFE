import { NextRequest, NextResponse } from "next/server"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

import { getBackendApiUrl } from "@/lib/env"
import { executeWithRefreshRetry } from "@/lib/backend-refresh"


// Budget approval is PATCH /budgets/:id/approve on the backend, open to
// super_admin, director, regional_pastor and branch_pastor. A branch pastor may
// only approve budgets belonging to their own branch; the backend enforces that
// and answers 403 otherwise.
function buildBackendApproveUrl(budgetEntryId: string): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/budgets/${budgetEntryId}/approve`
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ budgetEntryId: string }> }
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

    const { budgetEntryId } = await context.params
    if (!budgetEntryId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Budget entry ID required" }, { status: 400 }),
        req
      )
    }

    // The backend requires an explicit target status so the same route can
    // reject. Callers that just mean "approve" may omit the body.
    const requested = await req.json().catch(() => null)
    const status =
      typeof requested?.status === "string" && requested.status.trim()
        ? requested.status
        : "approved"

    // Retries once with a refreshed access token when the cookie has expired,
    // and stages the renewed cookies for `applyCors` to write back.
    const { res: backendResponse } = await executeWithRefreshRetry(req, (backendToken) =>
      fetch(buildBackendApproveUrl(budgetEntryId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        cache: "no-store",
      })
    )

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to approve budget entry",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Approve budget entry proxy error:", error)
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

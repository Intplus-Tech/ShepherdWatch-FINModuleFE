import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

import { getBackendApiUrl } from "@/lib/env"


function buildBackendRequisitionsUrl(): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/requisitions`
}

function resolveIsoDate(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim()
  }
  return new Date().toISOString().slice(0, 10)
}

function normalizeStatus(value: string | null): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  const map: Record<string, string> = {
    draft: "draft",
    pending_pastor: "pending_pastor",
    pending_accountant: "pending_pastor",
    pending_director: "pending_director",
    approved: "approved",
    declined: "declined",
    paid: "paid",
    pendingpastor: "pending_pastor",
    pendingaccountant: "pending_pastor",
    pendingdirector: "pending_director",
    pending_branch_pastor: "pending_pastor",
    pendingbranchpastor: "pending_pastor",
  }
  return map[normalized] ?? null
}

export async function POST(req: NextRequest) {
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

    const backendUrl = buildBackendRequisitionsUrl()
    const body = await req.json().catch(() => null)

    const branchId = String(body?.branchId ?? body?.tenantId ?? "").trim()
    const budgetHeadId = String(body?.budgetHeadId ?? body?.coaId ?? "").trim()
    const justification = String(body?.justification ?? "").trim()
    const amount = Number(body?.amount ?? 0)
    const currency =
      typeof body?.currency === "string" && ["NGN", "USD", "GBP", "EUR"].includes(body.currency)
        ? body.currency
        : "NGN"
    const requiredDate = resolveIsoDate(body?.requiredDate)

    if (!branchId || !budgetHeadId || !justification || !Number.isFinite(amount) || amount <= 0) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message:
              "Validation failed: branchId, budgetHeadId, amount, justification, and requiredDate are required.",
          },
          { status: 400 }
        ),
        req
      )
    }

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        branchId,
        budgetHeadId,
        amount,
        currency,
        justification,
        requiredDate,
      }),
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to create requisition",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create requisition proxy error:", error)
    return applyCors(
      NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      ),
      req
    )
  }
}

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

    const baseUrl = getBackendApiUrl();

    const url = new URL(`${baseUrl}/requisitions`)
    const query = req.nextUrl.searchParams

    const page = query.get("page")
    const limit = query.get("limit")
    const branchId = query.get("branchId") ?? query.get("tenantId")
    const status = normalizeStatus(query.get("status") ?? query.get("currentStatus"))
    const budgetHeadId = query.get("budgetHeadId") ?? query.get("coaId")
    const requestedBy = query.get("requestedBy")
    const startDate = query.get("startDate")
    const endDate = query.get("endDate")
    const search = query.get("search")
    const sort = query.get("sort")
    const order = query.get("order")

    if (page) url.searchParams.set("page", page)
    if (limit) url.searchParams.set("limit", limit)
    if (branchId) url.searchParams.set("branchId", branchId)
    if (status) url.searchParams.set("status", status)
    if (budgetHeadId) url.searchParams.set("budgetHeadId", budgetHeadId)
    if (requestedBy) url.searchParams.set("requestedBy", requestedBy)
    if (startDate) url.searchParams.set("startDate", startDate)
    if (endDate) url.searchParams.set("endDate", endDate)
    if (search) url.searchParams.set("search", search)
    if (sort) url.searchParams.set("sort", sort)
    if (order) url.searchParams.set("order", order)

    const backendResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to fetch requisitions",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get requisitions proxy error:", error)
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

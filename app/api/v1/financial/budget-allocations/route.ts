import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

import { getBackendApiUrl } from "@/lib/env"
type CreateBudgetAllocationPayload = {
  budgetId: string
  chartOfAccountId: string
  amount: number
  allocationType?: "percentage" | "fixed_amount"
  notes?: string
}



function buildBackendUrl(): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/budget-allocations`
}

function normalizePayload(body: unknown): CreateBudgetAllocationPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const budgetId = String(source.budgetId ?? "").trim()
  const chartOfAccountId = String(source.chartOfAccountId ?? "").trim()
  const amount = Number(source.amount)
  const allocationTypeRaw = String(source.allocationType ?? "fixed_amount").toLowerCase()
  const notes = String(source.notes ?? "").trim()

  if (!budgetId || !chartOfAccountId || !Number.isFinite(amount) || amount <= 0) {
    return null
  }

  const allocationType: CreateBudgetAllocationPayload["allocationType"] =
    allocationTypeRaw === "percentage" ? "percentage" : "fixed_amount"

  return {
    budgetId,
    chartOfAccountId,
    amount,
    allocationType,
    ...(notes ? { notes } : {}),
  }
}

export async function POST(req: NextRequest) {
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

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      )
    }

    const body = await req.json().catch(() => null)
    const payloadToSend = normalizePayload(body)
    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid payload. budgetId, chartOfAccountId and amount are required." },
          { status: 400 }
        ),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadToSend),
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)
    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: payload?.message ?? "Unable to create budget allocation." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create budget allocation proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
        req
      )
    }

    const backendToken = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value
    if (!backendToken) {
      return applyCors(
        NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }),
        req
      )
    }

    const backendUrl = new URL(buildBackendUrl())
    const page = req.nextUrl.searchParams.get("page")
    const limit = req.nextUrl.searchParams.get("limit")
    const budgetId = req.nextUrl.searchParams.get("budgetId")
    const chartOfAccountId = req.nextUrl.searchParams.get("chartOfAccountId")

    if (page) backendUrl.searchParams.set("page", page)
    if (limit) backendUrl.searchParams.set("limit", limit)
    if (budgetId) backendUrl.searchParams.set("budgetId", budgetId)
    if (chartOfAccountId) backendUrl.searchParams.set("chartOfAccountId", chartOfAccountId)

    const backendResponse = await fetch(backendUrl.toString(), {
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
          { success: false, message: payload?.message ?? "Unable to fetch budget allocations." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("List budget allocations proxy error:", error)
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

import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

type UpdateBudgetPayload = {
  title?: string
  totalAmount?: number
  category?: "operational" | "capital" | "project"
  notes?: string
}

function getRequiredEnv(name: "BACKEND_API_URL"): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function buildBackendUrl(budgetId: string): string {
  const baseUrl = getRequiredEnv("BACKEND_API_URL")
  if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
    throw new Error("BACKEND_API_URL must use https in production")
  }
  return `${baseUrl.replace(/\/+$/, "")}/api/v1/budgets/${budgetId}`
}

function normalizeUpdatePayload(body: unknown): UpdateBudgetPayload | null {
  if (!body || typeof body !== "object") return null

  const source = body as Record<string, unknown>
  const payload: UpdateBudgetPayload = {}

  if ("title" in source) {
    payload.title = String(source.title ?? "").trim()
  }

  if ("totalAmount" in source) {
    const totalAmount = Number(source.totalAmount)
    if (!Number.isFinite(totalAmount)) return null
    payload.totalAmount = totalAmount
  }

  if ("category" in source) {
    const category = String(source.category ?? "").toLowerCase()
    if (!["operational", "capital", "project"].includes(category)) return null
    payload.category = category as UpdateBudgetPayload["category"]
  }

  if ("notes" in source) {
    payload.notes = String(source.notes ?? "").trim()
  }

  return Object.keys(payload).length > 0 ? payload : null
}

export async function GET(req: NextRequest, context: { params: Promise<{ budgetId: string }> }) {
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

    const budgetId = (await context.params).budgetId
    if (!budgetId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Budget ID is required." }, { status: 400 }),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(budgetId), {
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
          { success: false, message: payload?.message ?? "Unable to fetch budget." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Budget details proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ budgetId: string }> }) {
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

    const budgetId = (await context.params).budgetId
    if (!budgetId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Budget ID is required." }, { status: 400 }),
        req
      )
    }

    const body = await req.json().catch(() => null)
    const payloadToSend = normalizeUpdatePayload(body)
    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid payload. Provide at least one updatable field." },
          { status: 400 }
        ),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(budgetId), {
      method: "PATCH",
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
          { success: false, message: payload?.message ?? "Unable to update budget." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Budget update proxy error:", error)
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

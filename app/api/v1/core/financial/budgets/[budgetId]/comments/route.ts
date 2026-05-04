import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

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
  return `${baseUrl.replace(/\/+$/, "")}/api/v1/budgets/${budgetId}/comments`
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

    const { budgetId } = await context.params
    if (!budgetId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Budget ID is required." }, { status: 400 }),
        req
      )
    }

    const backendUrl = new URL(buildBackendUrl(budgetId))
    const page = req.nextUrl.searchParams.get("page")
    const limit = req.nextUrl.searchParams.get("limit")
    if (page) backendUrl.searchParams.set("page", page)
    if (limit) backendUrl.searchParams.set("limit", limit)

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
          { success: false, message: payload?.message ?? "Unable to fetch budget comments." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get budget comments proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ budgetId: string }> }) {
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

    const { budgetId } = await context.params
    if (!budgetId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Budget ID is required." }, { status: 400 }),
        req
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request payload." }, { status: 400 }),
        req
      )
    }

    const source = body as Record<string, unknown>
    const message = String(source.message ?? "").trim()
    const lineItemRef = String(source.lineItemRef ?? "").trim()
    if (!message) {
      return applyCors(
        NextResponse.json({ success: false, message: "Comment message is required." }, { status: 400 }),
        req
      )
    }

    const payloadToSend: Record<string, string> = { message }
    if (lineItemRef) payloadToSend.lineItemRef = lineItemRef

    const backendResponse = await fetch(buildBackendUrl(budgetId), {
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
          { success: false, message: payload?.message ?? "Unable to add budget comment." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create budget comment proxy error:", error)
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

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

function buildBackendUrl(bankAccountId: string): string {
  const baseUrl = getRequiredEnv("BACKEND_API_URL")
  if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
    throw new Error("BACKEND_API_URL must use https in production")
  }
  return `${baseUrl.replace(/\/+$/, "")}/api/v1/bank-accounts/${bankAccountId}`
}

type UpdateBankAccountPayload = {
  accountName?: string
  accountNumber?: string
  bankName?: string
  currency?: "NGN" | "USD" | "GBP" | "EUR"
  isDomiciliary?: boolean
  chartOfAccountId?: string
}

function normalizePayload(body: unknown): UpdateBankAccountPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const payload: UpdateBankAccountPayload = {}

  if ("accountName" in source) {
    const accountName = String(source.accountName ?? "").trim()
    if (accountName) payload.accountName = accountName
  }
  if ("accountNumber" in source) {
    const accountNumber = String(source.accountNumber ?? "").trim()
    if (accountNumber) payload.accountNumber = accountNumber
  }
  if ("bankName" in source) {
    const bankName = String(source.bankName ?? "").trim()
    if (bankName) payload.bankName = bankName
  }
  if ("currency" in source) {
    const currency = String(source.currency ?? "").toUpperCase()
    if (["NGN", "USD", "GBP", "EUR"].includes(currency)) {
      payload.currency = currency as UpdateBankAccountPayload["currency"]
    }
  }
  if ("isDomiciliary" in source) {
    payload.isDomiciliary = Boolean(source.isDomiciliary)
  }
  if ("chartOfAccountId" in source) {
    const chartOfAccountId = String(source.chartOfAccountId ?? "").trim()
    if (chartOfAccountId) payload.chartOfAccountId = chartOfAccountId
  }

  return Object.keys(payload).length > 0 ? payload : null
}

export async function GET(req: NextRequest, context: { params: Promise<{ bankAccountId: string }> }) {
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

    const bankAccountId = (await context.params).bankAccountId
    if (!bankAccountId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Bank account ID is required." }, { status: 400 }),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(bankAccountId), {
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
          { success: false, message: payload?.message ?? "Unable to fetch bank account details." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get bank account by ID proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ bankAccountId: string }> }) {
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

    const bankAccountId = (await context.params).bankAccountId
    if (!bankAccountId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Bank account ID is required." }, { status: 400 }),
        req
      )
    }

    const body = await req.json().catch(() => null)
    const payloadToSend = normalizePayload(body)
    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid payload. Provide at least one updatable field." },
          { status: 400 }
        ),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(bankAccountId), {
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
          { success: false, message: payload?.message ?? "Unable to update bank account." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Update bank account proxy error:", error)
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

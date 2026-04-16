import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

type CreateBankAccountPayload = {
  accountName: string
  accountNumber: string
  bankName: string
  branchId: string
  currency: "NGN" | "USD" | "GBP" | "EUR"
  isDomiciliary?: boolean
  chartOfAccountId?: string
}

function getRequiredEnv(name: "BACKEND_API_URL"): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function buildBackendUrl(): string {
  const baseUrl = getRequiredEnv("BACKEND_API_URL")
  if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
    throw new Error("BACKEND_API_URL must use https in production")
  }
  return `${baseUrl.replace(/\/+$/, "")}/api/v1/bank-accounts`
}

function normalizePayload(body: unknown): CreateBankAccountPayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const accountName = String(source.accountName ?? "").trim()
  const accountNumber = String(source.accountNumber ?? "").trim()
  const bankName = String(source.bankName ?? "").trim()
  const branchId = String(source.branchId ?? "").trim()
  const currencyRaw = String(source.currency ?? "").toUpperCase()
  const chartOfAccountId = String(source.chartOfAccountId ?? "").trim()
  const isDomiciliary = Boolean(source.isDomiciliary ?? false)

  if (!accountName || !accountNumber || !bankName || !branchId) return null
  if (!["NGN", "USD", "GBP", "EUR"].includes(currencyRaw)) return null

  const payload: CreateBankAccountPayload = {
    accountName,
    accountNumber,
    bankName,
    branchId,
    currency: currencyRaw as CreateBankAccountPayload["currency"],
    isDomiciliary,
  }

  if (chartOfAccountId) payload.chartOfAccountId = chartOfAccountId
  return payload
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
          { success: false, message: "Invalid payload. Required: accountName, accountNumber, bankName, branchId, currency." },
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
          { success: false, message: payload?.message ?? "Unable to create bank account." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create bank account proxy error:", error)
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
    const branchId = req.nextUrl.searchParams.get("branchId")
    const currency = req.nextUrl.searchParams.get("currency")
    const isDomiciliary = req.nextUrl.searchParams.get("isDomiciliary")
    const search = req.nextUrl.searchParams.get("search")

    if (page) backendUrl.searchParams.set("page", page)
    if (limit) backendUrl.searchParams.set("limit", limit)
    if (branchId) backendUrl.searchParams.set("branchId", branchId)
    if (currency) backendUrl.searchParams.set("currency", currency)
    if (isDomiciliary !== null && isDomiciliary !== "") backendUrl.searchParams.set("isDomiciliary", isDomiciliary)
    if (search) backendUrl.searchParams.set("search", search)

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
          { success: false, message: payload?.message ?? "Unable to fetch bank accounts." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("List bank accounts proxy error:", error)
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

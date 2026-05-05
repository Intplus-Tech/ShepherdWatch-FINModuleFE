import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

import { getBackendApiUrl } from "@/lib/env"
type BudgetTemplateLineItem = {
  chartOfAccountId: string
  description?: string
  defaultAmount: number
}

type CreateBudgetTemplatePayload = {
  name: string
  description?: string
  lineItems: BudgetTemplateLineItem[]
}



function buildBackendUrl(): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/budget-templates`
}

function normalizePayload(body: unknown): CreateBudgetTemplatePayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const name = String(source.name ?? "").trim()
  const description = String(source.description ?? "").trim()
  const lineItemsRaw = Array.isArray(source.lineItems) ? source.lineItems : []

  if (!name || lineItemsRaw.length === 0) return null

  const lineItems: BudgetTemplateLineItem[] = []
  for (const row of lineItemsRaw) {
    if (!row || typeof row !== "object") continue
    const item = row as Record<string, unknown>
    const chartOfAccountId = String(item.chartOfAccountId ?? "").trim()
    const lineDescription = String(item.description ?? "").trim()
    const defaultAmount = Number(item.defaultAmount)
    if (!chartOfAccountId || !Number.isFinite(defaultAmount) || defaultAmount < 0) continue
    lineItems.push({
      chartOfAccountId,
      defaultAmount,
      ...(lineDescription ? { description: lineDescription } : {}),
    })
  }

  if (lineItems.length === 0) return null

  return {
    name,
    lineItems,
    ...(description ? { description } : {}),
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
          { success: false, message: "Invalid payload. name and lineItems are required." },
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
          { success: false, message: payload?.message ?? "Unable to create budget template." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create budget template proxy error:", error)
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

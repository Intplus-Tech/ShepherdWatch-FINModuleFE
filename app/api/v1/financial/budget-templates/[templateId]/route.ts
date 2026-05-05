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

type UpdateBudgetTemplatePayload = {
  name?: string
  description?: string
  lineItems?: BudgetTemplateLineItem[]
}



function buildBackendUrl(templateId: string): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/budget-templates/${templateId}`
}

function normalizePayload(body: unknown): UpdateBudgetTemplatePayload | null {
  if (!body || typeof body !== "object") return null
  const source = body as Record<string, unknown>
  const payload: UpdateBudgetTemplatePayload = {}

  if ("name" in source) {
    const name = String(source.name ?? "").trim()
    if (name) payload.name = name
  }

  if ("description" in source) {
    payload.description = String(source.description ?? "").trim()
  }

  if ("lineItems" in source) {
    const lineItemsRaw = Array.isArray(source.lineItems) ? source.lineItems : []
    const lineItems: BudgetTemplateLineItem[] = []
    for (const row of lineItemsRaw) {
      if (!row || typeof row !== "object") continue
      const item = row as Record<string, unknown>
      const chartOfAccountId = String(item.chartOfAccountId ?? "").trim()
      const description = String(item.description ?? "").trim()
      const defaultAmount = Number(item.defaultAmount)
      if (!chartOfAccountId || !Number.isFinite(defaultAmount) || defaultAmount < 0) continue
      lineItems.push({
        chartOfAccountId,
        defaultAmount,
        ...(description ? { description } : {}),
      })
    }
    payload.lineItems = lineItems
  }

  return Object.keys(payload).length > 0 ? payload : null
}

export async function GET(req: NextRequest, context: { params: Promise<{ templateId: string }> }) {
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

    const templateId = (await context.params).templateId
    if (!templateId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Template ID is required." }, { status: 400 }),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(templateId), {
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
          { success: false, message: payload?.message ?? "Unable to fetch budget template." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get budget template by ID proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ templateId: string }> }) {
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

    const templateId = (await context.params).templateId
    if (!templateId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Template ID is required." }, { status: 400 }),
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

    const backendResponse = await fetch(buildBackendUrl(templateId), {
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
          { success: false, message: payload?.message ?? "Unable to update budget template." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Update budget template proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ templateId: string }> }) {
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

    const templateId = (await context.params).templateId
    if (!templateId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Template ID is required." }, { status: 400 }),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(templateId), {
      method: "DELETE",
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
          { success: false, message: payload?.message ?? "Unable to delete budget template." },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Delete budget template proxy error:", error)
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

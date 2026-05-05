import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

import { getBackendApiUrl } from "@/lib/env"


function buildBackendBudgetsUrl(): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/budgets`
}

type CreateBudgetPayload = {
  title: string
  branchId: string
  fiscalYear: number
  totalAmount: number
  category?: "operational" | "capital" | "project"
  notes?: string
}

function normalizeCreatePayload(body: unknown): CreateBudgetPayload | null {
  if (!body || typeof body !== "object") return null

  const source = body as Record<string, unknown>
  const title = String(source.title ?? "").trim()
  const branchId = String(source.branchId ?? source.tenantId ?? "").trim()
  const fiscalYear = Number(source.fiscalYear)
  const totalAmount = Number(source.totalAmount)
  const categoryRaw = String(source.category ?? "").toLowerCase()
  const notes = String(source.notes ?? "").trim()

  if (!title || !branchId || !Number.isFinite(fiscalYear) || !Number.isFinite(totalAmount) || totalAmount <= 0) {
    return null
  }

  const payload: CreateBudgetPayload = {
    title,
    branchId,
    fiscalYear,
    totalAmount,
  }

  if (["operational", "capital", "project"].includes(categoryRaw)) {
    payload.category = categoryRaw as CreateBudgetPayload["category"]
  }
  if (notes) payload.notes = notes

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
    const payloadToSend = normalizeCreatePayload(body)
    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid payload. Required fields: title, branchId, fiscalYear, totalAmount.",
          },
          { status: 400 }
        ),
        req
      )
    }

    const backendResponse = await fetch(buildBackendBudgetsUrl(), {
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
          { success: false, message: payload?.message ?? "Unable to create budget" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create budget proxy error:", error)
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

import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"

import { getBackendApiUrl } from "@/lib/env"


function buildBackendCoaUrl(): string {
  const baseUrl = getBackendApiUrl();
  return `${baseUrl}/chart-of-accounts`
}

type CreateChartPayload = {
  code: string
  name: string
  accountType: "asset" | "liability" | "equity" | "revenue" | "expense"
  branchId: string
  parentId?: string
  description?: string
}

function normalizeCreateChartPayload(body: unknown): CreateChartPayload | null {
  if (!body || typeof body !== "object") {
    return null
  }

  const source = body as Record<string, unknown>
  const accountTypeRaw = String(source.accountType ?? "").toLowerCase()
  const accountType = ["asset", "liability", "equity", "revenue", "expense"].includes(accountTypeRaw)
    ? (accountTypeRaw as CreateChartPayload["accountType"])
    : null

  const payload: CreateChartPayload = {
    code: String(source.code ?? "").trim(),
    name: String(source.name ?? "").trim(),
    accountType: (accountType ?? "expense") as CreateChartPayload["accountType"],
    branchId: String(source.branchId ?? source.tenantId ?? "").trim(),
  }

  const parentId = String(source.parentId ?? "").trim()
  const description = String(source.description ?? "").trim()

  if (parentId) payload.parentId = parentId
  if (description) payload.description = description

  if (!payload.code || !payload.name || !payload.branchId || !accountType) {
    return null
  }

  return payload
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

    const backendUrl = buildBackendCoaUrl()
    const body = await req.json().catch(() => null)
    const payloadToSend = normalizeCreateChartPayload(body)

    if (!payloadToSend) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid payload. Required fields: code, name, accountType, branchId.",
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
      body: JSON.stringify(payloadToSend),
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to create chart of account entry",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create COA proxy error:", error)
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

    const url = new URL(buildBackendCoaUrl())
    const query = req.nextUrl.searchParams

    const page = query.get("page")
    const limit = query.get("limit")
    const search = query.get("search")
    const parentId = query.get("parentId")
    const branchId = query.get("branchId") ?? query.get("tenantId")
    const rawAccountType = query.get("accountType") ?? query.get("type")

    if (page) url.searchParams.set("page", page)
    if (limit) url.searchParams.set("limit", limit)
    if (search) url.searchParams.set("search", search)
    if (parentId) url.searchParams.set("parentId", parentId)
    if (branchId) url.searchParams.set("branchId", branchId)

    if (rawAccountType) {
      const normalized = rawAccountType.toLowerCase()
      const mappedAccountType =
        normalized === "income"
          ? "revenue"
          : normalized === "expenses"
            ? "expense"
            : normalized

      if (["asset", "liability", "equity", "revenue", "expense"].includes(mappedAccountType)) {
        url.searchParams.set("accountType", mappedAccountType)
      }
    }

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
            message: payload?.message ?? "Unable to fetch COA entries",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get COA proxy error:", error)
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

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

function buildBackendTransactionsUrl(): string {
  const baseUrl = getRequiredEnv("BACKEND_API_URL")
  if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
    throw new Error("BACKEND_API_URL must use https in production")
  }
  return `${baseUrl.replace(/\/+$/, "")}/api/v1/core/financial/transactions`
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

    const backendUrl = buildBackendTransactionsUrl()
    const body = await req.json().catch(() => null)

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to create transaction",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 201 }), req)
  } catch (error) {
    console.error("Create transaction proxy error:", error)
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

    const baseUrl = getRequiredEnv("BACKEND_API_URL")
    if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
      throw new Error("BACKEND_API_URL must use https in production")
    }

    const url = new URL(`${baseUrl.replace(/\/+$/, "")}/api/v1/core/financial/transactions`)
    if (req.nextUrl.search) {
      url.search = req.nextUrl.search
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
            message: payload?.message ?? "Unable to fetch transactions",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Get transactions proxy error:", error)
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

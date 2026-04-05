import { NextRequest, NextResponse } from "next/server"
import { BACKEND_TOKEN_COOKIE } from "@/lib/auth-config"
import { applyCors, getCorsHeaders, isOriginAllowed } from "@/lib/cors"

function getRequiredEnv(name: "BACKEND_API_URL"): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function buildBackendUrl(search: string): string {
  const baseUrl = getRequiredEnv("BACKEND_API_URL")
  if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
    throw new Error("BACKEND_API_URL must use https in production")
  }
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/api/v1/core/financial/export/transactions`)
  if (search) {
    url.search = search
  }
  return url.toString()
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

    const backendResponse = await fetch(buildBackendUrl(req.nextUrl.search), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "text/csv",
      },
      cache: "no-store",
    })

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text().catch(() => "")
      return applyCors(
        NextResponse.json(
          { success: false, message: errorBody || "Unable to export transactions" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    const contentType = backendResponse.headers.get("Content-Type") ?? "text/csv"
    const contentDisposition =
      backendResponse.headers.get("Content-Disposition") ??
      'attachment; filename="transactions.csv"'

    const response = new NextResponse(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    })

    return applyCors(response, req)
  } catch (error) {
    console.error("Export transactions proxy error:", error)
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

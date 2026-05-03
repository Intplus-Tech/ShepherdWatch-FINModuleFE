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

function buildBackendUrl(requisitionId: string): string {
  const baseUrl = getRequiredEnv("BACKEND_API_URL")
  if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
    throw new Error("BACKEND_API_URL must use https in production")
  }
  return `${baseUrl.replace(/\/+$/, "")}/api/v1/requisitions/${requisitionId}`
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ requisitionId: string }> }) {
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

    const requisitionId = (await context.params).requisitionId
    if (!requisitionId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Requisition ID is required" }, { status: 400 }),
        req
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return applyCors(
        NextResponse.json({ success: false, message: "Invalid request payload" }, { status: 400 }),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(requisitionId), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)
    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          { success: false, message: payload?.message ?? "Unable to update requisition" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Update requisition proxy error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ requisitionId: string }> }) {
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

    const requisitionId = (await context.params).requisitionId
    if (!requisitionId) {
      return applyCors(
        NextResponse.json({ success: false, message: "Requisition ID is required" }, { status: 400 }),
        req
      )
    }

    const backendResponse = await fetch(buildBackendUrl(requisitionId), {
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
          { success: false, message: payload?.message ?? "Unable to delete requisition" },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Delete requisition proxy error:", error)
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

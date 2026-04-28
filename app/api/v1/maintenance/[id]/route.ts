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

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
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

    const recordId = context.params.id
    if (!recordId) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Maintenance record ID is required" },
          { status: 400 }
        ),
        req
      )
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return applyCors(
        NextResponse.json(
          { success: false, message: "Invalid request body" },
          { status: 400 }
        ),
        req
      )
    }

    const baseUrl = getRequiredEnv("BACKEND_API_URL")
    if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
      throw new Error("BACKEND_API_URL must use https in production")
    }

    const url = new URL(
      `${baseUrl.replace(/\/+$/, "")}/api/v1/maintenance/${recordId}`
    )

    const backendResponse = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            message: payload?.message ?? "Unable to update maintenance record",
          },
          { status: backendResponse.status || 502 }
        ),
        req
      )
    }

    return applyCors(NextResponse.json(payload, { status: 200 }), req)
  } catch (error) {
    console.error("Update maintenance proxy error:", error)
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

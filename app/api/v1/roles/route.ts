import { API_V1 } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"
import { applyCors, isOriginAllowed } from "@/lib/cors"
import { corsOptions } from "@/lib/proxy"
import { executeWithRefreshRetry, applyAuthCookies } from "@/lib/backend-refresh"
import { getBackendUrl } from "@/lib/backend-auth-url"
import { readMatrix, toRoleRecord } from "@/lib/roles-adapter"

/**
 * `/roles` is a view over the permission matrix — the backend has no roles
 * resource of its own (a plain `/roles` call answers 404).
 */
export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    )
  }

  const backendUrl = getBackendUrl(`${API_V1}/permissions/matrix`)
  if (!backendUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    )
  }

  try {
    const { res, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(backendUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      })
    )

    const payload = await res.json().catch(() => null)
    if (!res.ok) {
      const response = applyCors(NextResponse.json(payload ?? { success: false }, { status: res.status }), req)
      applyAuthCookies(response, refreshedTokens)
      return response
    }

    const roles = readMatrix(payload)
      .filter((entry) => entry.role)
      .map(toRoleRecord)

    const response = applyCors(
      NextResponse.json({ success: true, message: "Roles fetched successfully.", data: roles }),
      req
    )
    applyAuthCookies(response, refreshedTokens)
    return response
  } catch (error) {
    console.error("Roles adapter error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req)
}

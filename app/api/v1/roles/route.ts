import { API_V1 } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"
import { applyCors, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"
import { corsOptions } from "@/lib/proxy"
import { executeWithRefreshRetry, applyAuthCookies } from "@/lib/backend-refresh"
import { getBackendUrl } from "@/lib/backend-auth-url"
import { readMatrix, toRoleRecord } from "@/lib/roles-adapter"

/**
 * The backend now serves `/roles` itself, with a label, description, section
 * and `granted` flag per permission, and it allows a director — where
 * `/permissions/matrix` is super_admin only. Prefer it, and fall back to the
 * matrix adapter only if a deployment predates it.
 */
export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    )
  }

  const rolesUrl = getBackendUrl(`${API_V1}/roles`)
  const backendUrl = getBackendUrl(`${API_V1}/permissions/matrix`)
  if (!backendUrl || !rolesUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    )
  }

  try {
    const direct = await executeWithRefreshRetry(req, (token) =>
      fetch(rolesUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      })
    )

    // Anything but a 404 is the backend's own answer, including a 403 the
    // caller needs to see.
    if (direct.res.status !== 404) {
      const directPayload = await direct.res.json().catch(() => null)
      const response = applyCors(
        NextResponse.json(directPayload ?? { success: false }, { status: direct.res.status }),
        req
      )
      applyAuthCookies(response, direct.refreshedTokens)
      return response
    }

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

/**
 * Creating a role. The backend has no endpoint for it yet — `POST /roles`
 * answers 404, and `PUT /permissions/matrix` rejects any `role` outside its
 * eight-value enum — so this forwards the documented body and turns a missing
 * endpoint into a message that says which part is missing, rather than a bare
 * 404 the screen cannot explain.
 */
export async function POST(req: NextRequest) {
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

  const rolesUrl = getBackendUrl(`${API_V1}/roles`)
  if (!rolesUrl) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    )
  }

  const body = await req.json().catch(() => null)
  const name = String((body as { name?: unknown })?.name ?? "").trim()
  if (!name) {
    return applyCors(
      NextResponse.json({ success: false, message: "A role name is required." }, { status: 400 }),
      req
    )
  }

  try {
    const { res, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(rolesUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      })
    )

    const payload = await res.json().catch(() => null)
    const response = applyCors(
      NextResponse.json(
        res.status === 404
          ? {
              success: false,
              message:
                "Custom roles are not available yet: the backend has no endpoint for creating one, and its permission matrix only accepts the eight built-in roles. The eight can be edited here in the meantime.",
            }
          : payload ?? { success: false },
        { status: res.status === 404 ? 501 : res.status }
      ),
      req
    )
    applyAuthCookies(response, refreshedTokens)
    return response
  } catch (error) {
    console.error("Role create error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req)
}

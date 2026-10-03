import { API_V1 } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"
import { applyCors, isOriginAllowed } from "@/lib/cors"
import { isCsrfValid } from "@/lib/csrf"
import { corsOptions } from "@/lib/proxy"
import { executeWithRefreshRetry, applyAuthCookies } from "@/lib/backend-refresh"
import { getBackendUrl } from "@/lib/backend-auth-url"
import { readMatrix, toMatrixPermissions, toRoleRecord } from "@/lib/roles-adapter"

/**
 * A single role. The backend serves `/roles/{role}` directly now, so prefer
 * it; only a deployment that predates it needs the permission-matrix adapter
 * below, which reads and writes the whole matrix to change one role.
 */
function matrixUrl(): string | null {
  return getBackendUrl(`${API_V1}/permissions/matrix`)
}

/** Calls the backend's own role endpoint. Returns null if it is not deployed. */
async function callRoleEndpoint(req: NextRequest, roleId: string, init?: { body: unknown }) {
  const url = getBackendUrl(`${API_V1}/roles/${encodeURIComponent(roleId)}`)
  if (!url) return null
  const attempt = await executeWithRefreshRetry(req, (token) =>
    fetch(url, {
      method: init ? "PUT" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init ? { "Content-Type": "application/json" } : {}),
      },
      ...(init ? { body: JSON.stringify(init.body) } : {}),
      cache: "no-store",
    })
  )
  if (attempt.res.status === 404 && !init) return null
  const payload = await attempt.res.json().catch(() => null)
  // A 404 on PUT means the endpoint is missing, not the role — the backend
  // answers "Role not found" with its own message when the role is the problem.
  if (attempt.res.status === 404 && !payload?.message?.toLowerCase().includes("role")) return null
  return { res: attempt.res, payload, refreshedTokens: attempt.refreshedTokens }
}

async function loadMatrix(req: NextRequest) {
  const url = matrixUrl()
  if (!url) throw new Error("Backend URL not configured")

  const { res, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    })
  )
  const payload = await res.json().catch(() => null)
  return { res, payload, refreshedTokens }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  if (!isOriginAllowed(req)) {
    return applyCors(
      NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 }),
      req
    )
  }

  const { roleId } = await params

  try {
    const direct = await callRoleEndpoint(req, roleId)
    if (direct) {
      const response = applyCors(
        NextResponse.json(direct.payload ?? { success: false }, { status: direct.res.status }),
        req
      )
      applyAuthCookies(response, direct.refreshedTokens)
      return response
    }

    const { res, payload, refreshedTokens } = await loadMatrix(req)
    if (!res.ok) {
      const response = applyCors(NextResponse.json(payload ?? { success: false }, { status: res.status }), req)
      applyAuthCookies(response, refreshedTokens)
      return response
    }

    const entry = readMatrix(payload).find((row) => row.role === roleId)
    if (!entry) {
      return applyCors(
        NextResponse.json({ success: false, message: "Role not found" }, { status: 404 }),
        req
      )
    }

    const response = applyCors(
      NextResponse.json({
        success: true,
        message: "Role fetched successfully.",
        data: toRoleRecord(entry),
      }),
      req
    )
    applyAuthCookies(response, refreshedTokens)
    return response
  } catch (error) {
    console.error("Role adapter error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
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

  const { roleId } = await params
  const body = await req.json().catch(() => null)
  const rawPermissions = Array.isArray((body as { permissions?: unknown })?.permissions)
    ? (body as { permissions: unknown[] }).permissions
    : null

  // Either `["approve_budgets"]` or `[{ action, granted }]`.
  const permissions = rawPermissions
    ? rawPermissions
        .map((entry) =>
          typeof entry === "string"
            ? entry
            : (entry as { granted?: unknown })?.granted === false
              ? null
              : String((entry as { action?: unknown; id?: unknown })?.action ?? (entry as { id?: unknown })?.id ?? "")
        )
        .filter((action): action is string => Boolean(action))
    : null

  if (!permissions || !rawPermissions) {
    return applyCors(
      NextResponse.json(
        { success: false, message: "Invalid payload. `permissions` is required." },
        { status: 400 }
      ),
      req
    )
  }

  const url = matrixUrl()
  if (!url) {
    return applyCors(
      NextResponse.json({ success: false, message: "Backend URL not configured" }, { status: 500 }),
      req
    )
  }

  try {
    const direct = await callRoleEndpoint(req, roleId, {
      body: {
        permissions: rawPermissions.every((entry) => typeof entry === "string")
          ? (rawPermissions as string[]).map((action) => ({ action, granted: true }))
          : rawPermissions,
      },
    })
    if (direct) {
      const response = applyCors(
        NextResponse.json(direct.payload ?? { success: false }, { status: direct.res.status }),
        req
      )
      applyAuthCookies(response, direct.refreshedTokens)
      return response
    }

    const current = await loadMatrix(req)
    if (!current.res.ok) {
      const response = applyCors(
        NextResponse.json(current.payload ?? { success: false }, { status: current.res.status }),
        req
      )
      applyAuthCookies(response, current.refreshedTokens)
      return response
    }

    const matrix = readMatrix(current.payload)
    const next = matrix.some((entry) => entry.role === roleId)
      ? matrix.map((entry) =>
          entry.role === roleId ? { role: roleId, permissions: toMatrixPermissions(permissions) } : entry
        )
      : [...matrix, { role: roleId, permissions: toMatrixPermissions(permissions) }]

    const { res, refreshedTokens } = await executeWithRefreshRetry(req, (token) =>
      fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matrix: next }),
        cache: "no-store",
      })
    )

    const payload = await res.json().catch(() => null)
    const response = applyCors(
      NextResponse.json(
        res.ok
          ? {
              success: true,
              message: "Role permissions updated successfully.",
              data: toRoleRecord({ role: roleId, permissions: toMatrixPermissions(permissions) }),
            }
          : payload ?? { success: false, message: "Unable to update role permissions." },
        { status: res.status }
      ),
      req
    )
    applyAuthCookies(response, refreshedTokens)
    return response
  } catch (error) {
    console.error("Role update error:", error)
    return applyCors(
      NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }),
      req
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req)
}

"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export type AuthUser = {
  id: string
  email: string
  role: string
  name?: string
  firstName?: string
  lastName?: string
  tenantId?: string
  tenant?: {
    id?: string
    name?: string
  }
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  refreshUser: () => Promise<void>
  login: (payload: { email: string; password: string; rememberMe?: boolean }) => Promise<AuthUser | null>
  logout: () => Promise<void>
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resendOtp: (payload: { email: string; purpose: "email_verification" | "password_reset" }) => Promise<void>
  updateProfile: (payload: {
    firstName?: string
    lastName?: string
    phone?: string
    avatar?: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }

  const text = await response.text().catch(() => "")
  return text ? { message: text } : null
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>
    const data = source.data && typeof source.data === "object"
      ? (source.data as Record<string, unknown>)
      : null
    const firstValidationError = Array.isArray(source.errors) ? source.errors[0] : null
    const validationMessage =
      firstValidationError && typeof firstValidationError === "object"
        ? (firstValidationError as Record<string, unknown>).message
        : null

    const messageLike =
      source.message ??
      source.error ??
      source.detail ??
      data?.message ??
      validationMessage

    if (typeof messageLike === "string" && messageLike.trim()) {
      return messageLike
    }
    if (Array.isArray(messageLike)) {
      const combined = messageLike.filter((entry) => typeof entry === "string").join(", ").trim()
      if (combined) return combined
    }

    const nestedData = source.data && typeof source.data === "object"
      ? (source.data as Record<string, unknown>)
      : null
    const nestedMessage = nestedData?.message
    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage
    }
    if (Array.isArray(nestedMessage)) {
      const combined = nestedMessage.filter((entry) => typeof entry === "string").join(", ").trim()
      if (combined) return combined
    }
  }
  return fallback
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isPublicAuthRoute =
    pathname === "/login" ||
    pathname === "/signin" ||
    pathname === "/sign-up" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email" ||
    pathname === "/reset-password" ||
    pathname === "/reset-success"

  const normalizeAuthUser = useCallback((payload: unknown): AuthUser | null => {
    const payloadRecord = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null
    const data =
      payloadRecord && payloadRecord.data && typeof payloadRecord.data === "object"
        ? (payloadRecord.data as Record<string, unknown>)
        : null
    const source = data ?? payloadRecord
    if (!source) return null

    const tenantFromSource =
      source.tenant && typeof source.tenant === "object"
        ? (source.tenant as Record<string, unknown>)
        : null
    const tenant =
      tenantFromSource ??
      (source.tenantId || source.tenantName
        ? { id: source.tenantId, name: source.tenantName }
        : undefined)

    const rawId = source.id ?? source.userId ?? source._id ?? source.uuid
    const rawEmail = source.email ?? source.userEmail
    const rawRole = source.role ?? source.roleType ?? source.userRole

    if (!rawId && !rawEmail) return null

    return {
      id: String(rawId ?? rawEmail ?? "unknown"),
      email: String(rawEmail ?? ""),
      role: String(rawRole ?? ""),
      name: source.fullName ? String(source.fullName) : source.name ? String(source.name) : (source.firstName && source.lastName) ? `${source.firstName} ${source.lastName}` : source.firstName ? String(source.firstName) : undefined,
      firstName: source.firstName ? String(source.firstName) : undefined,
      lastName: source.lastName ? String(source.lastName) : undefined,
      tenantId: source.tenantId ? String(source.tenantId) : tenantFromSource?.id ? String(tenantFromSource.id) : undefined,
      tenant: tenant ?? undefined,
    }
  }, [])

  const resolveAuthUser = useCallback((payload: unknown): AuthUser | null => {
    const payloadRecord = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null
    const data =
      payloadRecord && payloadRecord.data && typeof payloadRecord.data === "object"
        ? (payloadRecord.data as Record<string, unknown>)
        : null

    const candidates: unknown[] = [payloadRecord?.user, data?.user, data, payloadRecord, payload]

    for (const candidate of candidates) {
      const normalized = normalizeAuthUser(candidate)
      if (normalized && (normalized.id !== "unknown" || normalized.email || normalized.role)) {
        return normalized
      }
    }

    return null
  }, [normalizeAuthUser])

  const fetchCurrentUser = useCallback(
    async (options?: { attemptRefresh?: boolean }): Promise<AuthUser | null> => {
      const shouldAttemptRefresh = options?.attemptRefresh !== false
      let res = await fetch("/api/v1/auth/me", { credentials: "include" })

      if (!res.ok && res.status === 401 && shouldAttemptRefresh) {
        const refreshRes = await fetch("/api/v1/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        })
        if (refreshRes.ok) {
          res = await fetch("/api/v1/auth/me", { credentials: "include" })
        }
      }

      if (!res.ok) return null
      const payload = await parseResponseBody(res)
      return resolveAuthUser(payload)
    },
    [resolveAuthUser]
  )

  useEffect(() => {
    let active = true

    async function loadUser() {
      if (isPublicAuthRoute) {
        if (active) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      if (active) setLoading(true)
      try {
        const authUser = await fetchCurrentUser()
        if (active) setUser(authUser)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadUser()
    return () => {
      active = false
    }
  }, [fetchCurrentUser, isPublicAuthRoute])

  const login = async (payload: { email: string; password: string; rememberMe?: boolean }) => {
    const normalizedPayload = {
      ...payload,
      email: payload.email.trim(),
      password: String(payload.password),
    }

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(normalizedPayload),
    })

    const responsePayload = await parseResponseBody(res)
    if (!res.ok) {
      throw new Error(getErrorMessage(responsePayload, "Unable to login"))
    }

    let authUser = resolveAuthUser(responsePayload)
    if (!authUser) {
      authUser = await fetchCurrentUser({ attemptRefresh: false })
    }

    setUser(authUser)
    return authUser
  }

  const logout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }).catch(() => null)
    setUser(null)
  }

  const refreshUser = async () => {
    const authUser = await fetchCurrentUser()
    if (!authUser) {
      throw new Error("Unable to refresh user context")
    }
    setUser(authUser)
  }

  const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await fetch("/api/v1/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await parseResponseBody(res)
      throw new Error(getErrorMessage(data, "Failed to change password"))
    }
  }

  const forgotPassword = async (email: string) => {
    const res = await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const data = await parseResponseBody(res)
      throw new Error(getErrorMessage(data, "Unable to send reset email"))
    }
  }

  const resendOtp = async (payload: { email: string; purpose: "email_verification" | "password_reset" }) => {
    const res = await fetch("/api/v1/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await parseResponseBody(res)
      throw new Error(getErrorMessage(data, "Unable to resend OTP"))
    }
  }

  const updateProfile = async (payload: {
    firstName?: string
    lastName?: string
    phone?: string
    avatar?: string
  }) => {
    const res = await fetch("/api/v1/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await parseResponseBody(res)
      throw new Error(getErrorMessage(data, "Unable to update profile"))
    }

    const data = await parseResponseBody(res)
    setUser(resolveAuthUser(data))
  }

  const value: AuthContextValue = {
    user,
    loading,
    refreshUser,
    login,
    logout,
    changePassword,
    forgotPassword,
    resendOtp,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}

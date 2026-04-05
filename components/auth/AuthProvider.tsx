"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

export type AuthUser = {
  id: string
  email: string
  role: string
  name?: string
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
  login: (payload: { email: string; password: string; rememberMe?: boolean }) => Promise<void>
  logout: () => Promise<void>
  changePassword: (payload: { oldPassword: string; newPassword: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const normalizeAuthUser = (payload: any): AuthUser | null => {
    const source = payload?.data ?? payload
    if (!source) return null

    const tenant =
      source?.tenant ??
      (source?.tenantId || source?.tenantName
        ? { id: source?.tenantId, name: source?.tenantName }
        : undefined)

    return {
      id: source?.id ?? source?.userId ?? "unknown",
      email: source?.email ?? "",
      role: source?.role ?? source?.roleType ?? "",
      name: source?.name ?? source?.fullName ?? source?.firstName,
      tenantId: source?.tenantId ?? source?.tenant?.id,
      tenant: tenant ?? undefined,
    }
  }

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" })
        if (!res.ok) {
          if (active) setUser(null)
          return
        }
        const data = await res.json()
        const sessionUser = data.user ?? null

        if (!sessionUser) {
          if (active) setUser(null)
          return
        }

        if (active) {
          setUser(sessionUser)
          setLoading(false)
        }

        // Refresh richer profile in the background without blocking UI.
        void (async () => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000)
          try {
            const authRes = await fetch("/api/core/users/auth-user", {
              credentials: "include",
              signal: controller.signal,
            })
            if (authRes.ok) {
              const authData = await authRes.json().catch(() => null)
              if (active) {
                setUser(normalizeAuthUser(authData) ?? sessionUser)
              }
            }
          } catch {
            // fallback to session user
          } finally {
            clearTimeout(timeoutId)
          }
        })()
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSession()
    return () => {
      active = false
    }
  }, [])

  const login = async (payload: { email: string; password: string; rememberMe?: boolean }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || "Unable to login")
    }

    const data = await res.json()
    const sessionUser = data.data?.user ?? null
    setUser(sessionUser)

    // Refresh richer profile in the background without delaying login.
    void (async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      try {
        const authRes = await fetch("/api/core/users/auth-user", {
          credentials: "include",
          signal: controller.signal,
        })
        if (authRes.ok) {
          const authData = await authRes.json().catch(() => null)
          setUser(normalizeAuthUser(authData) ?? sessionUser)
        }
      } catch {
        // ignore fetch failure; session user already set
      } finally {
        clearTimeout(timeoutId)
      }
    })()

    if (payload.rememberMe) {
      localStorage.setItem("rememberedEmail", payload.email)
    } else {
      localStorage.removeItem("rememberedEmail")
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => null)
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await fetch("/api/core/users/auth-user", {
      credentials: "include",
    })
    if (!res.ok) {
      throw new Error("Unable to refresh user context")
    }
    const data = await res.json().catch(() => null)
    setUser(normalizeAuthUser(data))
  }

  const changePassword = async (payload: { oldPassword: string; newPassword: string }) => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || "Failed to change password")
    }
  }

  const forgotPassword = async (email: string) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || "Unable to send reset email")
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshUser,
      login,
      logout,
      changePassword,
      forgotPassword,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}

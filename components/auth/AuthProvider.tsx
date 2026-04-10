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
        let res = await fetch("/api/auth/session", { credentials: "include" })
        if (!res.ok) {
          if (res.status === 401) {
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            })
            if (refreshRes.ok) {
              res = await fetch("/api/auth/session", { credentials: "include" })
            }
          }

          if (!res.ok) {
            if (active) setUser(null)
            return
          }
        }
        const data = await res.json()
        const sessionUser = data.user ?? data?.data?.user ?? null

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
            const authRes = await fetch("/api/auth/me", {
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
    const sessionUser = data?.data?.user ?? null
    setUser(normalizeAuthUser(sessionUser))

    // Always refresh profile after login so user data stays current.
    const meRes = await fetch("/api/auth/me", { credentials: "include" })
    if (meRes.ok) {
      const meData = await meRes.json().catch(() => null)
      const meUser = meData?.data ?? meData?.data?.user ?? meData?.user ?? meData
      setUser(normalizeAuthUser(meUser))
    }

    const rememberRes = await fetch("/api/auth/remember-me", { credentials: "include" })
    if (rememberRes.ok) {
      const rememberData = await rememberRes.json().catch(() => null)
      if (rememberData?.rememberMe) {
        const meRes = await fetch("/api/auth/me", { credentials: "include" })
        if (meRes.ok) {
          const meData = await meRes.json().catch(() => null)
          const meUser = meData?.data ?? meData?.data?.user ?? meData?.user ?? meData
          setUser(normalizeAuthUser(meUser))
        }
      }
    }

    // Refresh richer profile in the background without delaying login.
    void (async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      try {
        const authRes = await fetch("/api/auth/me", {
          credentials: "include",
          signal: controller.signal,
        })
        if (authRes.ok) {
          const authData = await authRes.json().catch(() => null)
          const authUser = authData?.data ?? authData?.data?.user ?? authData?.user ?? authData
          setUser(normalizeAuthUser(authUser) ?? sessionUser)
        }
      } catch {
        // ignore fetch failure; session user already set
      } finally {
        clearTimeout(timeoutId)
      }
    })()

  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => null)
    setUser(null)
  }

  const refreshUser = async () => {
    let res = await fetch("/api/auth/me", {
      credentials: "include",
    })
    if (!res.ok && res.status === 401) {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
      if (refreshRes.ok) {
        res = await fetch("/api/auth/me", { credentials: "include" })
      }
    }
    if (!res.ok) {
      throw new Error("Unable to refresh user context")
    }
    const data = await res.json().catch(() => null)
    setUser(normalizeAuthUser(data))
  }

  const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
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

  const resendOtp = async (payload: { email: string; purpose: "email_verification" | "password_reset" }) => {
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || "Unable to resend OTP")
    }
  }

  const updateProfile = async (payload: {
    firstName?: string
    lastName?: string
    phone?: string
    avatar?: string
  }) => {
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || "Unable to update profile")
    }

    const data = await res.json().catch(() => null)
    const profile = data?.data ?? data?.data?.user ?? data?.user ?? data
    setUser(normalizeAuthUser(profile))
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
      resendOtp,
      updateProfile,
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

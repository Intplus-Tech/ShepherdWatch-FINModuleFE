"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

export type AuthUser = {
  id: string
  email: string
  role: string
  name?: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (payload: { email: string; password: string; rememberMe?: boolean }) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

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
        if (active) setUser(data.user ?? null)
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
    setUser(data.user)

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
      login,
      logout,
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

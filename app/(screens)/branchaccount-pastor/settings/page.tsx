"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ActiveSessionsManager } from "@/components/settings/ActiveSessionsManager"

export default function Page() {
  const { updateProfile } = useAuth()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      let res = await fetch("/api/v1/auth/me", { credentials: "include" })
      if (res.status === 401) {
        const refreshRes = await fetch("/api/v1/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        })
        if (refreshRes.ok) {
          res = await fetch("/api/v1/auth/me", { credentials: "include" })
        }
      }
      const data = await res.json().catch(() => null)
      if (res.ok) {
        const user = data?.data
        if (user) {
          setFullName(`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim())
          setPhone(String(user.phone ?? user.phoneNumber ?? ""))
        }
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const parts = fullName.trim().split(/\s+/).filter(Boolean)
      await updateProfile({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        phone: phone.trim() || undefined,
      })
      setMessage("Profile updated successfully.")
    } catch (e: any) {
      setError(e?.message || "Unable to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">User Settings</h1>
      {loading ? <p className="mt-4">Loading...</p> : null}
      <div className="mt-4 grid max-w-xl gap-3">
        <input
          className="rounded border p-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
        />
        <input
          className="rounded border p-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
        />
        <button className="rounded bg-blue-600 p-2 text-white disabled:opacity-60" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        {message ? <p className="text-emerald-600">{message}</p> : null}
        {error ? <p className="text-rose-600">{error}</p> : null}
      </div>
      <div className="mt-8">
        <ActiveSessionsManager />
      </div>
    </main>
  )
}
